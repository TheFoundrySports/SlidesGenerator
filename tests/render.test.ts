import { describe, expect, it } from "vitest";
import { renderDeckHtml, renderSlide } from "../src/render/render-deck";
import { CATECHISM, getDesign, parseDeck, readExample, readProjectText } from "./helpers";

const options = { readText: readProjectText, offline: true };

describe("render", () => {
  it("renders one <section> per slide with the documented attributes", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "full"));
    const html = renderDeckHtml(deck, design, options);

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect((html.match(/<section\b[^>]*class="slide/g) ?? []).length).toBe(deck.slides.length);
    expect(html).toContain('data-scope="slides"');
    expect(html).toContain('data-scope="page"');
    for (const slide of deck.slides) {
      expect(html).toContain(`data-slide-id="${slide.id}"`);
      expect(html).toContain(`data-layout="${slide.layout}"`);
    }
  });

  it("is deterministic", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "minimal"));
    expect(renderDeckHtml(deck, design, options)).toBe(renderDeckHtml(deck, design, options));
  });

  it("omits the web-font link when offline", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "minimal"));
    expect(renderDeckHtml(deck, design, { ...options, offline: true })).not.toContain("fonts.googleapis.com");
    expect(renderDeckHtml(deck, design, { ...options, offline: false })).toContain("fonts.googleapis.com");
  });

  it("adds data-step to steppable items and honors the asset resolver", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "full"));
    const html = renderDeckHtml(deck, design, { ...options, asset: (src) => `/cdn/${src}` });
    expect(html).toContain("data-step");
    expect(html).toContain("/cdn/assets/plate.svg");
  });

  it("escapes text", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, {
      id: "t",
      title: "T",
      design: CATECHISM,
      slides: [{ id: "a", layout: "reflection", label: "a", text: "<script>alert(1)</script>" }],
    });
    const html = renderDeckHtml(deck, design, options);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  describe("layout markup (snapshots)", () => {
    it.each(["cover", "scripture", "doctrine", "reflection", "prayer", "summary", "divider", "closing", "image-overlay"])(
      "%s",
      async (layout) => {
        const design = await getDesign();
        const deck = parseDeck(design, readExample(CATECHISM, "full"));
        const index = deck.slides.findIndex((slide) => slide.layout === layout);
        expect(index, `example slide for ${layout}`).toBeGreaterThanOrEqual(0);
        expect(renderSlide(deck, design, index, options)).toMatchSnapshot();
      },
    );
  });
});
