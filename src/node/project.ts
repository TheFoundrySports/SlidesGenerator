import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { formatZodError, type Deck } from "../schema/core";
import type { Design } from "../schema/design-types";
import { getDesign, registryFromModules, type DesignRegistry } from "../designs/registry";

export const ROOT = resolve(import.meta.dirname, "../..");
export const DECKS_DIR = join(ROOT, "decks");
export const DESIGNS_DIR = join(ROOT, "designs");
export const DIST_DIR = join(ROOT, "dist");

/** Reads a project-relative text file; `undefined` when it does not exist. */
export const readProjectText = (relativePath: string): string | undefined => {
  const full = join(ROOT, relativePath);
  return existsSync(full) ? readFileSync(full, "utf8") : undefined;
};

/** Imports every `designs/<id>/design.config.ts` (folders starting with `_` are templates). */
export const loadDesigns = async (): Promise<DesignRegistry> => {
  const modules: Record<string, { default: Design }> = {};
  for (const entry of readdirSync(DESIGNS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const file = join(DESIGNS_DIR, entry.name, "design.config.ts");
    if (!existsSync(file)) continue;
    modules[`/designs/${entry.name}/design.config.ts`] = (await import(pathToFileURL(file).href)) as { default: Design };
  }
  return registryFromModules(modules);
};

export const listDeckSlugs = (): string[] =>
  existsSync(DECKS_DIR)
    ? readdirSync(DECKS_DIR)
        .filter((name) => statSync(join(DECKS_DIR, name)).isDirectory() && existsSync(join(DECKS_DIR, name, "deck.json")))
        .sort()
    : [];

export const deckDir = (slug: string): string => join(DECKS_DIR, slug);

export interface LoadedDeck {
  slug: string;
  dir: string;
  design: Design;
  deck: Deck;
  brief: string | undefined;
}

export type DeckLoadResult = { ok: true; value: LoadedDeck } | { ok: false; slug: string; errors: string[] };

/** Reads deck.json, resolves its design and validates it against the design's schema. */
export const loadDeck = (slug: string, registry: DesignRegistry): DeckLoadResult => {
  const dir = deckDir(slug);
  const file = join(dir, "deck.json");
  if (!existsSync(file)) return { ok: false, slug, errors: [`decks/${slug}/deck.json not found`] };

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    return { ok: false, slug, errors: [`deck.json is not valid JSON: ${(error as Error).message}`] };
  }

  const designId = (raw as { design?: unknown } | null)?.design;
  if (typeof designId !== "string") return { ok: false, slug, errors: ['deck.json needs a string "design" field'] };

  let design: Design;
  try {
    design = getDesign(registry, designId);
  } catch (error) {
    return { ok: false, slug, errors: [(error as Error).message] };
  }

  const parsed = design.deckSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, slug, errors: formatZodError(parsed.error) };

  const briefFile = join(dir, "brief.md");
  return {
    ok: true,
    value: {
      slug,
      dir,
      design,
      deck: parsed.data,
      brief: existsSync(briefFile) ? readFileSync(briefFile, "utf8") : undefined,
    },
  };
};

export const deckFileExists = (slug: string) => (relativePath: string) => existsSync(join(deckDir(slug), relativePath));

export const relativeToRoot = (path: string): string => path.replace(`${ROOT}/`, "");
export const parentDir = dirname;
