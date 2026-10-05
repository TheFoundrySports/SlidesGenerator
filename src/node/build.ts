import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { notesSidecar, parseBriefNotes } from "../render/notes";
import { renderDeckHtml } from "../render/render-deck";
import { DIST_DIR, deckDir, readProjectText, type LoadedDeck } from "./project";

export interface BuildOptions {
  /** Embed images as base64 so the HTML is a single file. */
  inline: boolean;
  /** Skip the web-font <link>. */
  offline: boolean;
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export interface BuiltDeck {
  htmlPath: string;
  notesPath: string;
  outDir: string;
  bytes: number;
}

/** Writes dist/<slug>/<slug>.html, <slug>.notes.json and the referenced assets. */
export const buildDeck = (loaded: LoadedDeck, options: BuildOptions): BuiltDeck => {
  const { slug, deck, design } = loaded;
  const outDir = join(DIST_DIR, slug);
  mkdirSync(outDir, { recursive: true });

  const assets = deck.slides.flatMap((slide) => (slide.images ?? []).map((image) => image.src));
  const dataUri = (src: string): string => {
    const file = join(deckDir(slug), src);
    const mime = MIME[extname(src).toLowerCase()] ?? "application/octet-stream";
    return `data:${mime};base64,${readFileSync(file).toString("base64")}`;
  };

  const html = renderDeckHtml(deck, design, {
    readText: readProjectText,
    offline: options.offline,
    asset: options.inline ? dataUri : undefined,
  });
  const htmlPath = join(outDir, `${slug}.html`);
  writeFileSync(htmlPath, html);

  if (!options.inline) {
    for (const src of new Set(assets)) {
      const from = join(deckDir(slug), src);
      if (!existsSync(from)) continue;
      const to = join(outDir, src);
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to);
    }
  }

  const notes = loaded.brief ? parseBriefNotes(loaded.brief, deck.slides.map((slide) => slide.id)).notes : deck.slides.map(() => "");
  const notesPath = join(outDir, `${slug}.notes.json`);
  writeFileSync(notesPath, notesSidecar(deck.id, notes));

  return { htmlPath, notesPath, outDir, bytes: Buffer.byteLength(html) };
};

export interface DeckIndexEntry {
  slug: string;
  title: string;
  design: string;
  slides: number;
  file: string;
}

/** dist/decks.json — what the presenter lists. Merges with existing entries so partial builds keep the rest. */
export const writeDecksIndex = (entries: DeckIndexEntry[]): string => {
  mkdirSync(DIST_DIR, { recursive: true });
  const path = join(DIST_DIR, "decks.json");
  const existing: DeckIndexEntry[] = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as DeckIndexEntry[]) : [];
  const merged = new Map(existing.filter((entry) => existsSync(join(DIST_DIR, entry.file))).map((entry) => [entry.slug, entry]));
  for (const entry of entries) merged.set(entry.slug, entry);
  writeFileSync(path, JSON.stringify([...merged.values()].sort((a, b) => a.slug.localeCompare(b.slug)), null, 2) + "\n");
  return path;
};
