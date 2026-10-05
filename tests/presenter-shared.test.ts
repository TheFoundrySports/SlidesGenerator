import { describe, expect, it } from "vitest";
import {
  SHAPE_DIMENSIONS,
  computeStageScale,
  emptySidecar,
  extractShape,
  parseDeckHtml,
  parseDecksIndex,
  parseSidecar,
  renderNotesMarkdown,
  shapeDimensions,
  sidecarPath,
  slideScopeStyles,
} from "../presenter/shared";
import { renderDeckHtml } from "../src/render/render-deck";
import { CATECHISM, getDesign, parseDeck, readExample, readProjectText } from "./helpers";

describe("parseDeckHtml", () => {
  it("rejects non-strings", () => {
    expect(() => parseDeckHtml(null as never)).toThrow(TypeError);
  });

  it("reads scoped styles, font links and slides from an engine build", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "full"));
    const parsed = parseDeckHtml(renderDeckHtml(deck, design, { readText: readProjectText }));

    expect(parsed.slides).toHaveLength(deck.slides.length);
    expect(parsed.links.some((href) => href.includes("fonts.googleapis.com"))).toBe(true);
    expect(parsed.styleBlocks.map((block) => block.scope)).toEqual(expect.arrayContaining(["slides", "page"]));
  });

  it("drops the page scope when the presenter injects styles", () => {
    const parsed = parseDeckHtml(
      '<style data-scope="slides">.a{}</style><style data-scope="page">body{}</style><style>.legacy{}</style>',
    );
    expect(slideScopeStyles(parsed)).toEqual([".a{}", ".legacy{}"]);
  });

  it("only returns <section class=slide>", () => {
    const parsed = parseDeckHtml('<section class="x">no</section><section class="slide is-active">yes</section>');
    expect(parsed.slides).toHaveLength(1);
    expect(parsed.slides[0]?.inner).toBe("yes");
  });
});

describe("sidecar", () => {
  it("accepts an array or {slides}, pads and stringifies", () => {
    expect(parseSidecar('["a",null]', 3)).toEqual(["a", "", ""]);
    expect(parseSidecar('{"deck":"d","slides":["x"]}', 2)).toEqual(["x", ""]);
    expect(parseSidecar("null", 2)).toEqual(["", ""]);
  });

  it("throws on malformed input", () => {
    expect(() => parseSidecar("{", 1)).toThrow(SyntaxError);
    expect(() => parseSidecar('{"a":1}', 1)).toThrow(TypeError);
    expect(() => parseSidecar("[]", -1)).toThrow(TypeError);
  });

  it("builds empty sidecars and derives the path", () => {
    expect(JSON.parse(emptySidecar(2, "d"))).toEqual({ deck: "d", slides: ["", ""] });
    expect(sidecarPath("demo/demo.html")).toBe("demo/demo.notes.json");
  });
});

describe("decks index", () => {
  it("keeps only well-formed entries", () => {
    const entries = parseDecksIndex(
      JSON.stringify([{ slug: "a", title: "A", file: "a/a.html", design: "d", slides: 1 }, { slug: 1 }, null]),
    );
    expect(entries.map((entry) => entry.slug)).toEqual(["a"]);
    expect(() => parseDecksIndex("{}")).toThrow(TypeError);
  });
});

describe("stage geometry", () => {
  it("scales to fit while keeping aspect ratio", () => {
    expect(computeStageScale(960, 540)).toBe(0.5);
    expect(computeStageScale(1920, 540)).toBe(0.5);
    expect(computeStageScale(0, 540)).toBe(1);
  });

  it("knows every shape and falls back to 16:9", () => {
    expect(shapeDimensions("portrait-3-4")).toEqual(SHAPE_DIMENSIONS["portrait-3-4"]);
    expect(shapeDimensions("???")).toEqual([1920, 1080]);
    expect(extractShape('<html lang="es" class="shape-square-1-1">')).toBe("square-1-1");
    expect(extractShape("<html>")).toBe("landscape-16-9");
  });
});

describe("renderNotesMarkdown", () => {
  it("renders paragraphs, emphasis, code and links", () => {
    expect(renderNotesMarkdown("Hola **fuerte** y *suave* con `x<y`\nsegunda línea")).toBe(
      "<p>Hola <strong>fuerte</strong> y <em>suave</em> con <code>x&lt;y</code><br>segunda línea</p>",
    );
    expect(renderNotesMarkdown("[CEC](https://example.org/a?b=1&c=2)")).toBe(
      '<p><a href="https://example.org/a?b=1&amp;c=2" target="_blank" rel="noopener noreferrer">CEC</a></p>',
    );
  });

  it("renders lists and quotes as separate blocks", () => {
    expect(renderNotesMarkdown("- uno\n- dos\n\n1. a\n2. b\n\n> cita")).toBe(
      "<ul><li>uno</li><li>dos</li></ul><ol><li>a</li><li>b</li></ol><blockquote>cita</blockquote>",
    );
  });

  it("never lets markup or non-http links through", () => {
    const html = renderNotesMarkdown('<img src=x onerror="alert(1)">\n[x](javascript:alert(1))\n- <script>1</script>');
    expect(html).not.toMatch(/<img|<script|href="javascript/i);
    expect(html).toContain("&lt;img");
  });

  it("returns nothing for empty input", () => {
    expect(renderNotesMarkdown("  \n\n")).toBe("");
  });
});
