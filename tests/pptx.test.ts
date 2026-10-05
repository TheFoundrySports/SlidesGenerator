import { describe, expect, it } from "vitest";
import { join } from "node:path";
import { exportPptx, slideParts } from "../src/exporters/pptx";
import { extractPptx, isSupportedImage, parseMapArg, stringFieldsOf, toDeck } from "../src/importers/pptx";
import { z } from "zod";
import { DESIGNS_DIR } from "../src/node/project";
import { CATECHISM, getDesign, parseDeck, readExample } from "./helpers";

describe("parseMapArg", () => {
  it("parses N:layout pairs and ignores junk", () => {
    expect(parseMapArg("1:cover, 2:scripture")).toEqual({ 1: "cover", 2: "scripture" });
    expect(parseMapArg("x:cover,3:")).toEqual({});
    expect(parseMapArg(undefined)).toEqual({});
  });
});

describe("stringFieldsOf", () => {
  it("lists required string fields before optional ones and skips non-strings", () => {
    const shape = { a: z.string().optional(), b: z.string(), c: z.number(), d: z.string().default("x"), e: z.array(z.string()) };
    expect(stringFieldsOf(shape)).toEqual(["b", "a", "d"]);
  });
});

describe("isSupportedImage", () => {
  it("accepts web formats and rejects EMF/WMF", () => {
    expect(isSupportedImage("a.JPG")).toBe(true);
    expect(isSupportedImage("a.png")).toBe(true);
    expect(isSupportedImage("a.emf")).toBe(false);
    expect(isSupportedImage("a.wmf")).toBe(false);
  });
});

describe("slideParts", () => {
  it("orders a doctrine slide: kicker, title, items, citation", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "full"));
    const slide = deck.slides.find((s) => s.id === "doctrine-points");
    const parts = slideParts(slide!);
    expect(parts.map((part) => part.role)).toEqual(["kicker", "title", "subtitle", "item", "item", "item", "meta"]);
    expect(parts.filter((part) => part.role === "item").map((part) => part.marker)).toEqual(["I.", "II.", "III."]);
  });

  it("keeps terms as bold lead-ins and the scripture reference as its title", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "full"));
    const terms = slideParts(deck.slides.find((s) => s.id === "doctrine-terms")!).filter((part) => part.role === "term");
    expect(terms.map((part) => part.term)).toEqual(["Sacerdote", "Profeta", "Rey"]);
    const scripture = slideParts(deck.slides.find((s) => s.id === "scripture")!);
    expect(scripture.find((part) => part.role === "title")?.text).toBe("Génesis 1, 1");
  });
});

describe("export → import round trip", () => {
  it("exports a valid .pptx with notes and re-imports its slides", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "full"));
    const notes = deck.slides.map((slide, i) => (i === 0 ? "Nota de apertura" : ""));
    const buffer = await exportPptx(deck, design, { assetsRoot: join(DESIGNS_DIR, CATECHISM, "examples"), notes });

    expect(buffer.subarray(0, 2).toString()).toBe("PK");

    const extraction = await extractPptx(buffer);
    expect(extraction.slides).toHaveLength(deck.slides.length);
    const allText = extraction.slides.map((slide) => slide.shapes.map((shape) => (shape.kind === "text" ? shape.text : "")).join("\n")).join("\n");
    expect(allText).toContain("Creo en Dios");
    expect(allText).toContain("Padre Nuestro");

    const draft = toDeck(extraction, { slug: "round-trip", title: "Round trip", design });
    expect(draft.slides).toHaveLength(deck.slides.length);
    expect(draft.slides.every((slide) => slide.layout === "free")).toBe(true);
    expect(design.deckSchema.safeParse(draft).success).toBe(true);
  });

  it("maps slides to a requested layout", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "minimal"));
    const buffer = await exportPptx(deck, design, { assetsRoot: join(DESIGNS_DIR, CATECHISM, "examples") });
    const draft = toDeck(await extractPptx(buffer), { slug: "mapped", title: "Mapped", design, map: { 1: "cover", 4: "closing" } });
    expect(draft.slides.map((slide) => slide.layout)).toEqual(["cover", "free", "free", "closing"]);
  });
});
