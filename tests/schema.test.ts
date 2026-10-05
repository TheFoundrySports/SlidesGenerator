import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineDesign } from "../src/schema/define-design";
import { CATECHISM, deckOf, getDesign, readExample, reflection } from "./helpers";

describe("catechism-liturgical schema", () => {
  it("accepts both shipped examples", async () => {
    const design = await getDesign();
    for (const name of ["minimal", "full"] as const) {
      expect(design.deckSchema.safeParse(readExample(CATECHISM, name)).success, name).toBe(true);
    }
  });

  it("applies defaults (lang, shape, meta)", async () => {
    const design = await getDesign();
    const deck = design.deckSchema.parse({ id: "t", title: "T", design: CATECHISM, slides: [reflection("a")] });
    expect(deck.lang).toBe("es");
    expect(deck.shape).toBe("landscape-16-9");
    expect(deck.meta?.sources).toEqual([]);
  });

  it("rejects a deck that belongs to another design", async () => {
    const design = await getDesign();
    expect(design.deckSchema.safeParse(deckOf([reflection("a")], { design: "other" })).success).toBe(false);
  });

  it("rejects unknown layouts, unknown fields and bad ids", async () => {
    const design = await getDesign();
    expect(design.deckSchema.safeParse(deckOf([{ id: "a", layout: "nope", label: "a" }])).success).toBe(false);
    expect(design.deckSchema.safeParse(deckOf([{ ...reflection("a"), surprise: true }])).success).toBe(false);
    expect(design.deckSchema.safeParse(deckOf([reflection("Not Kebab")])).success).toBe(false);
  });

  it("requires the layout's required fields", async () => {
    const design = await getDesign();
    expect(design.deckSchema.safeParse(deckOf([{ id: "a", layout: "prayer", label: "a", title: "Padre Nuestro" }])).success).toBe(false);
  });

  it("exposes core and custom layouts", async () => {
    const design = await getDesign();
    expect(Object.keys(design.layouts.all)).toEqual(
      expect.arrayContaining(["cover", "scripture", "doctrine", "reflection", "prayer", "summary", "divider", "closing", "free"]),
    );
  });

  it("emits a JSON Schema with a layout discriminator", async () => {
    const design = await getDesign();
    const json = z.toJSONSchema(design.deckSchema as unknown as z.ZodType, { io: "input", unrepresentable: "any" });
    expect(JSON.stringify(json)).toContain('"layout"');
  });
});

describe("defineDesign validation", () => {
  it("fails fast on a missing color token, bad default variant or unknown core layout", async () => {
    const base = await getDesign();
    const config = { ...base } as unknown as Parameters<typeof defineDesign>[0];
    const colors = { ...base.tokens.colors } as Record<string, string>;
    delete colors.accent;
    expect(() => defineDesign({ ...config, tokens: { colors } })).toThrow(/accent/);
    expect(() => defineDesign({ ...config, variants: { default: "ghost", options: ["monastic"] } })).toThrow(/default variant/);
    expect(() => defineDesign({ ...config, layouts: { core: ["ghost"], custom: {} } })).toThrow(/unknown core layout/);
  });
});
