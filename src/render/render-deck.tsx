import { renderToStaticMarkup } from "react-dom/server";
import { RUNTIME_SOURCE } from "../runtime/deck-runtime";
import type { Deck, Slide } from "../schema/core";
import type { Design } from "../schema/design-types";
import type { RenderContext } from "../schema/layout";
import { tokensCss } from "./css";

export interface RenderOptions {
  /** Reads a project-relative text file (CSS). Return `undefined` when it does not exist. */
  readText: (projectRelativePath: string) => string | undefined;
  /** Maps a deck-relative asset path to the URL written in the HTML. Defaults to identity. */
  asset?: (src: string) => string;
  /** `<base href>` for previews that load the HTML from another URL. */
  baseHref?: string;
  /** Skip the web-font <link> (offline builds). */
  offline?: boolean;
  /** Render only this slide (0-based) without chrome, e.g. for gallery thumbnails. */
  onlySlide?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const mustRead = (opts: RenderOptions, path: string): string => {
  const text = opts.readText(path);
  if (text === undefined) throw new Error(`render: missing stylesheet ${path}`);
  return text;
};

export const effectiveVariant = (deck: Deck, design: Design, slide: Slide): string =>
  slide.variant ?? deck.variant ?? design.variants.default;

export const effectivePalette = (deck: Deck, design: Design): string => deck.palette ?? design.palettes.default;

/** Renders a single slide `<section>`. */
export const renderSlide = (deck: Deck, design: Design, index: number, opts: RenderOptions, active = false): string => {
  const slide = deck.slides[index] as Slide;
  const layout = design.layouts.all[slide.layout];
  if (!layout) throw new Error(`render: slide "${slide.id}" uses unknown layout "${slide.layout}"`);

  const animation = slide.animation ?? {};
  const steps = animation.steps === true;
  const ctx: RenderContext = {
    design,
    deck,
    index,
    total: deck.slides.length,
    steps,
    imageAnim: animation.image ?? "none",
    asset: opts.asset ?? ((src) => src),
    motif: (name) => design.motifs?.[name],
  };

  const inner = renderToStaticMarkup(layout.component({ slide, ctx }));
  const enter = animation.enter ?? design.animations.default;
  const classes = ["slide", `slide--${slide.layout}`, active ? "is-active" : ""].filter(Boolean).join(" ");
  const attrs = [
    `class="${classes}"`,
    `data-layout="${escapeAttr(slide.layout)}"`,
    `data-slide-id="${escapeAttr(slide.id)}"`,
    `data-screen-label="${escapeAttr(`${pad(index + 1)} ${slide.label}`)}"`,
    `data-variant="${escapeAttr(effectiveVariant(deck, design, slide))}"`,
    `data-palette="${escapeAttr(effectivePalette(deck, design))}"`,
    `data-enter="${enter}"`,
    steps ? "data-steps" : "",
  ].filter(Boolean);
  return `<section ${attrs.join(" ")}>\n${inner}\n</section>`;
};

/** Renders the whole deck as one standalone HTML document. */
export const renderDeckHtml = (deck: Deck, design: Design, opts: RenderOptions): string => {
  const variantsUsed = new Set(deck.slides.map((slide) => effectiveVariant(deck, design, slide)));
  variantsUsed.add(deck.variant ?? design.variants.default);

  const designCss = design.css.map((file) => mustRead(opts, `${design.dir}/${file.replace(/^\.\//, "")}`));
  const variantCss = [...variantsUsed]
    .map((name) => opts.readText(`${design.dir}/variants/${name}.css`))
    .filter((css): css is string => css !== undefined);

  const slideCss = [
    `/* engine */\n${mustRead(opts, "src/styles/slides.css")}`,
    mustRead(opts, `src/shapes/${deck.shape}.css`),
    mustRead(opts, "src/animations/presets.css"),
    `/* design: ${design.id} */\n${tokensCss(design)}`,
    ...designCss,
    ...variantCss,
  ].join("\n\n");

  const indices = opts.onlySlide === undefined ? deck.slides.map((_, i) => i) : [opts.onlySlide];
  const sections = indices.map((i) => renderSlide(deck, design, i, opts, i === indices[0])).join("\n\n");

  const fonts =
    design.fonts.href && !opts.offline
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="${design.fonts.href}" rel="stylesheet">`
      : "";
  const chrome =
    opts.onlySlide === undefined
      ? `<div class="counter" aria-live="polite"><span id="cNow">01</span> / <span id="cTotal">${pad(deck.slides.length)}</span></div>
<div class="help" aria-hidden="true"><kbd>←</kbd> <kbd>→</kbd> · <kbd>Home</kbd> <kbd>End</kbd> · <kbd>F</kbd></div>`
      : "";

  return `<!doctype html>
<html lang="${deck.lang}" class="shape-${deck.shape}" data-design="${design.id}" data-variant="${deck.variant ?? design.variants.default}" data-palette="${effectivePalette(deck, design)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="generator" content="slideschurch">
${opts.baseHref ? `<base href="${escapeAttr(opts.baseHref)}">\n` : ""}<title>${escapeAttr(deck.title)}</title>
${fonts}
<style data-scope="slides">
${slideCss}
</style>
<style data-scope="page">
${mustRead(opts, "src/styles/page.css")}
</style>
</head>
<body>
<div class="stage">
${sections}
</div>
${chrome}
<script>${RUNTIME_SOURCE}</script>
</body>
</html>
`;
};
