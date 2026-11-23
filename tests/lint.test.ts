import { describe, expect, it } from "vitest";
import { hasBlockers, lintDeck, lintHtml } from "../src/lint";
import { renderDeckHtml } from "../src/render/render-deck";
import type { Issue } from "../src/schema/design-types";
import { CATECHISM, deckOf, getDesign, parseDeck, readExample, readProjectText, reflection } from "./helpers";

const lint = async (slides: unknown[], extra: Record<string, unknown> = {}): Promise<Issue[]> => {
  const design = await getDesign();
  const deck = parseDeck(design, deckOf(slides, extra));
  return lintDeck({ deck, design, fileExists: () => true });
};
const rules = (issues: Issue[]) => issues.map((issue) => issue.rule);
const doctrine = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  layout: "doctrine",
  label: id,
  title: "Título",
  points: [{ text: "Uno." }],
  ...extra,
});

describe("core rules", () => {
  it("flags duplicate slide ids as P0", async () => {
    const issues = await lint([reflection("a"), reflection("a")]);
    expect(issues.find((i) => i.rule === "slide-id-unique")?.severity).toBe("P0");
    expect(hasBlockers(issues)).toBe(true);
  });

  it("flags images on layouts without image slots", async () => {
    const issues = await lint([{ ...reflection("a"), images: [{ src: "assets/x.jpg", alt: "x", slot: "right" }] }]);
    expect(issues).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "image-slot", severity: "P0", slide: "a" })]));
  });

  it("flags a missing asset file", async () => {
    const design = await getDesign();
    const deck = parseDeck(
      design,
      deckOf([doctrine("a", { images: [{ src: "assets/missing.jpg", alt: "x", slot: "right", credit: "c" }] })]),
    );
    const issues = lintDeck({ deck, design, fileExists: () => false });
    expect(issues.some((i) => i.severity === "P0" && i.slide === "a")).toBe(true);
  });
});

describe("catechism-liturgical rules", () => {
  it("passes the shipped examples without P0", async () => {
    const design = await getDesign();
    for (const name of ["minimal", "full"] as const) {
      const deck = parseDeck(design, readExample(CATECHISM, name));
      const issues = lintDeck({ deck, design, fileExists: () => true });
      expect(hasBlockers(issues), `${name}: ${JSON.stringify(issues.filter((i) => i.severity === "P0"))}`).toBe(false);
    }
  });

  it("warns about three identical layouts in a row", async () => {
    const issues = await lint([doctrine("a"), doctrine("b"), doctrine("c")]);
    expect(rules(issues)).toContain("rhythm");
    expect(rules(await lint([doctrine("a"), reflection("b"), doctrine("c")]))).not.toContain("rhythm");
  });

  it("flags exclamations outside quotations, but not inside «»", async () => {
    expect(rules(await lint([reflection("a", "¡Aleluya!")]))).toContain("exclamation");
    expect(rules(await lint([reflection("a", "«¡Aleluya!»")]))).not.toContain("exclamation");
  });

  it('requires "CEC" rather than "CCC"', async () => {
    expect(rules(await lint([reflection("a", "Ver CCC 279.")]))).toContain("cec-format");
    expect(rules(await lint([reflection("a", "Ver CEC 279.")]))).not.toContain("cec-format");
  });

  it("blocks emoji and placeholder text; allows the cross", async () => {
    expect(await lint([reflection("a", "Gloria 🙏")])).toEqual(expect.arrayContaining([expect.objectContaining({ rule: "emoji", severity: "P0" })]));
    expect(rules(await lint([reflection("a", "Lorem ipsum dolor")]))).toContain("placeholder-text");
    expect(rules(await lint([reflection("a", "✝ Gloria")]))).not.toContain("emoji");
  });

  it("limits points per doctrine slide and mixing points with columns", async () => {
    const six = Array.from({ length: 6 }, (_, i) => ({ text: `Punto ${i}.` }));
    expect(rules(await lint([doctrine("a", { points: six })]))).toContain("points-max");
    const mixed = doctrine("a", { columns: [{ heading: "A", text: "a" }, { heading: "B", text: "b" }] });
    expect(rules(await lint([mixed]))).toContain("doctrine-density");
  });

  it("budgets festive variants and checks layout/variant pairing", async () => {
    const festive = (id: string) => ({ ...reflection(id), variant: "festive" });
    expect(rules(await lint([festive("a")]))).toContain("variant-combination");
    const closing = (id: string) => ({ id, layout: "closing", label: id, text: "«Paz.»", variant: "festive" });
    expect(rules(await lint([closing("a"), reflection("m"), closing("b"), reflection("n"), closing("c")]))).toContain("variant-budget");
  });
});

describe("background image slot", () => {
  it("accepts a background image on a layout that admits it", async () => {
    const issues = await lint([{ ...reflection("a"), images: [{ src: "assets/x.jpg", alt: "x", slot: "background" }] }]);
    expect(rules(issues)).not.toContain("image-slot");
  });

  it("allows one background plus one framed image, and warns on two backgrounds", async () => {
    const framed = { src: "assets/plate.svg", alt: "plate", slot: "right", credit: "c" };
    const background = { src: "assets/bg.jpg", alt: "bg", slot: "background", credit: "c" };
    expect(rules(await lint([doctrine("a", { images: [background, framed] })]))).not.toContain("image-count");
    const second = { ...background, src: "assets/bg2.jpg" };
    expect(rules(await lint([doctrine("a", { images: [background, second] })]))).toContain("image-count");
  });

  it("keeps the framed plate when a background image comes first", async () => {
    const design = await getDesign();
    const deck = parseDeck(
      design,
      deckOf([
        doctrine("a", {
          images: [
            { src: "assets/bg.jpg", alt: "bg", slot: "background" },
            { src: "assets/plate.svg", alt: "plate", slot: "right" },
          ],
        }),
      ]),
    );
    const html = renderDeckHtml(deck, design, { readText: readProjectText, offline: true });
    expect(html).toContain('class="figure figure--background backdrop"');
    expect(html).toContain('src="assets/bg.jpg"');
    expect(html).toContain("split--right");
    expect(html).toContain('src="assets/plate.svg"');
  });

  it("keeps the triptych plate when a background image comes first", async () => {
    const design = await getDesign();
    const deck = parseDeck(
      design,
      deckOf([
        {
          id: "a",
          layout: "triptych",
          label: "a",
          title: "Título",
          aside: "Al margen.",
          images: [
            { src: "assets/bg.jpg", alt: "bg", slot: "background" },
            { src: "assets/plate.svg", alt: "plate", slot: "right" },
          ],
        },
      ]),
    );
    const html = renderDeckHtml(deck, design, { readText: readProjectText, offline: true });
    expect(html).toContain('class="figure figure--background backdrop"');
    expect(html).toContain('src="assets/plate.svg"');
  });
});

describe("three-column layout", () => {
  const slide = {
    id: "a",
    layout: "three-column",
    label: "a",
    title: "Fe, esperanza y caridad",
    columns: [
      { heading: "Fe", text: "Creer lo que Dios revela." },
      { heading: "Esperanza", text: "Esperar lo que Dios promete." },
      { heading: "Caridad", text: "Amar como Dios ama." },
    ],
  };

  it("renders exactly three columns", async () => {
    const design = await getDesign();
    const html = renderDeckHtml(parseDeck(design, deckOf([slide])), design, { readText: readProjectText, offline: true });
    expect(html).toContain('class="cols cols--3"');
    expect(html.match(/class="col__heading"/g) ?? []).toHaveLength(3);
    expect(html).toContain("Esperanza");
  });

  it("reveals the three columns one by one with steps", async () => {
    const design = await getDesign();
    const html = renderDeckHtml(
      parseDeck(design, deckOf([{ ...slide, animation: { steps: true } }])),
      design,
      { readText: readProjectText, offline: true },
    );
    expect(html.match(/data-step=""/g) ?? []).toHaveLength(3);
  });

  it("requires exactly three columns", async () => {
    const design = await getDesign();
    expect(() => parseDeck(design, deckOf([slide]))).not.toThrow();
    const two = { ...slide, columns: slide.columns.slice(0, 2) };
    expect(() => parseDeck(design, deckOf([two]))).toThrow();
  });
});

describe("html lint", () => {
  it("passes on a rendered example", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "minimal"));
    const html = renderDeckHtml(deck, design, { readText: readProjectText, offline: true });
    expect(hasBlockers(lintHtml(html, design))).toBe(false);
  });
});
