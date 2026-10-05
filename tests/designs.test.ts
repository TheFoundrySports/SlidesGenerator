import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasBlockers, lintDeck } from "../src/lint";
import { DECKS_DIR, listDeckSlugs, loadDeck, loadDesigns } from "../src/node/project";
import { validateDeck } from "../src/node/validate";
import { renderDeckHtml } from "../src/render/render-deck";
import { readProjectText } from "./helpers";

const registry = await loadDesigns();

describe("design registry", () => {
  it("skips folders starting with _", () => {
    expect([...registry.keys()]).not.toContain("_template");
    expect(registry.has("catechism-liturgical")).toBe(true);
  });

  it("every pack has a GUIDE, examples and documents each layout", () => {
    for (const design of registry.values()) {
      expect(existsSync(join(design.dir, "GUIDE.md")), `${design.id} GUIDE.md`).toBe(true);
      expect(existsSync(join(design.dir, "examples/minimal.deck.json")), `${design.id} minimal example`).toBe(true);
      for (const layout of Object.values(design.layouts.custom)) {
        expect(layout.description.length, `${design.id}/${layout.name} description`).toBeGreaterThan(0);
        expect(layout.example, `${design.id}/${layout.name} example`).toBeTruthy();
      }
    }
  });

  it("has an up-to-date JSON Schema per design", () => {
    for (const design of registry.values()) {
      expect(existsSync(join("schemas", `${design.id}.schema.json`)), `run npm run schemas (${design.id})`).toBe(true);
    }
  });
});

describe("_template pack", () => {
  it("is a valid design whose examples validate, lint and render", async () => {
    const template = (await import("../designs/_template/design.config")).default;
    for (const name of ["minimal", "full"]) {
      const deck = template.deckSchema.parse((await import(`../designs/_template/examples/${name}.deck.json`)).default);
      const issues = lintDeck({ deck, design: template, fileExists: () => true });
      expect(hasBlockers(issues), name).toBe(false);
      expect(renderDeckHtml(deck, template, { readText: (path) => readProjectText(path.replace("designs/__ID__/", "designs/_template/")), offline: true })).toContain("<section");
    }
  });
});

describe("decks in the repo", () => {
  const slugs = listDeckSlugs();

  it("finds the migrated decks", () => {
    expect(slugs).toEqual(expect.arrayContaining(["demo", "jesuscristo-capitulo-2"]));
  });

  it.each(slugs)("%s validates without P0 issues and every asset exists", (slug) => {
    const result = validateDeck(slug, registry);
    expect(result.schemaErrors).toEqual([]);
    expect(result.issues.filter((issue) => issue.severity === "P0")).toEqual([]);
    expect(result.blocked).toBe(false);
  });

  it.each(slugs)("%s has a brief.md", (slug) => {
    expect(existsSync(join(DECKS_DIR, slug, "brief.md"))).toBe(true);
    expect(loadDeck(slug, registry).ok).toBe(true);
  });

  it("has no stray files at the decks root", () => {
    const entries = readdirSync(DECKS_DIR, { withFileTypes: true });
    expect(entries.filter((entry) => !entry.isDirectory() && !entry.name.startsWith("."))).toEqual([]);
  });
});
