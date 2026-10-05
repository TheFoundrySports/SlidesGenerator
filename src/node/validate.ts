import { lintDeck, lintHtml } from "../lint";
import { parseBriefNotes } from "../render/notes";
import { renderDeckHtml } from "../render/render-deck";
import type { Issue } from "../schema/design-types";
import type { DesignRegistry } from "../designs/registry";
import { deckFileExists, loadDeck, readProjectText, type LoadedDeck } from "./project";

export interface ValidationResult {
  slug: string;
  /** Present when deck.json parsed and matched its design schema. */
  loaded?: LoadedDeck;
  /** Zod/JSON errors. Any entry blocks the build. */
  schemaErrors: string[];
  issues: Issue[];
  blocked: boolean;
}

/** Schema validation + JSON lint + render + HTML lint + notes coverage. */
export const validateDeck = (slug: string, registry: DesignRegistry): ValidationResult => {
  const result = loadDeck(slug, registry);
  if (!result.ok) return { slug, schemaErrors: result.errors, issues: [], blocked: true };

  const loaded = result.value;
  const { deck, design } = loaded;
  const issues = lintDeck({ deck, design, fileExists: deckFileExists(slug) });

  try {
    const html = renderDeckHtml(deck, design, { readText: readProjectText });
    issues.push(...lintHtml(html, design));
  } catch (error) {
    issues.push({ rule: "render", severity: "P0", message: `render failed: ${(error as Error).message}` });
  }

  if (loaded.brief === undefined) {
    issues.push({ rule: "brief-missing", severity: "P2", message: "no brief.md (research, intent and speaker notes)" });
  } else {
    const { notes, unknown } = parseBriefNotes(loaded.brief, deck.slides.map((slide) => slide.id));
    for (const id of unknown) issues.push({ rule: "notes-unknown-id", severity: "P1", message: `brief.md has notes for unknown slide id "${id}"` });
    const empty = notes.filter((note) => note === "").length;
    if (empty > 0) issues.push({ rule: "notes-coverage", severity: "P2", message: `${empty}/${notes.length} slides have no speaker notes` });
  }

  const blocked = issues.some((issue) => issue.severity === "P0");
  return { slug, loaded, schemaErrors: [], issues, blocked };
};

export const formatValidation = (result: ValidationResult): string => {
  const lines = [`\n${result.slug}${result.loaded ? ` — ${result.loaded.deck.slides.length} slide(s), design ${result.loaded.design.id}` : ""}`];
  for (const error of result.schemaErrors) lines.push(`  ✗ [P0] schema: ${error}`);
  for (const issue of result.issues) {
    const where = issue.slide ? ` (${issue.slide})` : "";
    lines.push(`  ${issue.severity === "P0" ? "✗" : issue.severity === "P1" ? "!" : "·"} [${issue.severity}] ${issue.rule}${where}: ${issue.message}`);
  }
  if (result.schemaErrors.length === 0 && result.issues.length === 0) lines.push("  ✓ clean");
  return lines.join("\n");
};
