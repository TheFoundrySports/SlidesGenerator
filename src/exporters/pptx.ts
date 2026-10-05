/**
 * deck.json → .pptx exporter.
 *
 * It does not re-render the design's TSX layouts. It maps the semantic fields of each slide to
 * a typographic PowerPoint slide using the design's tokens (colors, fonts) and the deck's
 * palette: kicker, title, subtitle, body text, lists, columns and a footer reference, with the
 * first image on the side of its `slot`. Speaker notes come from `brief.md`.
 * Use it for handouts or for editing in PowerPoint; the HTML build stays the source of truth.
 */
import PptxGenJS from "pptxgenjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Deck, ImageRef, Slide } from "../schema/core";
import type { Design } from "../schema/design-types";
import { shapeDimensions } from "../shapes/dimensions";

export type PartRole = "kicker" | "title" | "subtitle" | "body" | "quote" | "term" | "item" | "heading" | "meta";

export interface Part {
  role: PartRole;
  text: string;
  /** Bold lead-in for `item` parts with a term. */
  term?: string;
  /** Marker for numbered items ("I.", "1."). */
  marker?: string;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

const asString = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value : undefined);
const asRecords = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null) : [];

/** Flattens a slide's semantic fields into an ordered list of typographic parts. Pure; used by tests. */
export const slideParts = (slide: Slide): Part[] => {
  const parts: Part[] = [];
  const push = (role: PartRole, text: string | undefined, extra: Partial<Part> = {}) => {
    if (text) parts.push({ role, text, ...extra });
  };

  push("kicker", asString(slide.eyebrow) ?? asString(slide.kicker));
  // Scripture slides are headed by their reference; closing/cover slides use it as a footer.
  const headedByReference = slide.layout === "scripture";
  push("title", asString(slide.title) ?? (headedByReference ? asString(slide.reference) : undefined));
  push("subtitle", asString(slide.subtitle) ?? asString(slide.lead));
  if (asString(slide.title) && asString(slide.lead) && asString(slide.subtitle)) push("body", asString(slide.lead));

  const quote = slide.quote as { text?: string; source?: string } | undefined;
  push("quote", asString(slide.text) ?? asString(quote?.text));
  if (asString(slide.text) && quote?.text) push("quote", quote.text);
  push("meta", asString(quote?.source));
  push("body", asString(slide.commentary));

  const list = asRecords(slide.points ?? slide.items);
  const numbering = slide.numbering === "arabic" ? "arabic" : "roman";
  list.forEach((entry, i) => {
    const term = asString(entry.term);
    push(term ? "term" : "item", asString(entry.text), {
      term,
      marker: term ? undefined : numbering === "roman" ? `${ROMAN[i]}.` : `${i + 1}.`,
    });
  });

  for (const column of asRecords(slide.columns)) {
    push("heading", asString(column.heading));
    push("body", asString(column.text));
  }

  push("body", asString(slide.closing));
  push("meta", asString(slide.attribution));
  for (const block of asRecords(slide.blocks)) push("body", asString(block.text));
  push("meta", asString(slide.invocation));
  if (slide.amen === true) push("quote", "Amén.");
  push("meta", slide.layout === "scripture" ? undefined : asString(slide.reference));
  push("meta", asString(slide.citation));
  return parts;
};

const hex = (value: string): string => value.replace("#", "").toUpperCase();

const imageSide = (image: ImageRef): "left" | "right" | "top" | "full" => {
  if (image.slot === "left") return "left";
  if (image.slot === "top") return "top";
  if (image.slot === "right") return "right";
  return "full";
};

export interface ExportOptions {
  /** Folder that images (`assets/...`) are relative to: the deck's folder. */
  assetsRoot: string;
  /** Speaker notes aligned with slides ("" for none). */
  notes?: string[];
}

export const exportPptx = async (deck: Deck, design: Design, options: ExportOptions): Promise<Buffer> => {
  const [width, height] = shapeDimensions(deck.shape);
  const widthIn = width / 192;
  const heightIn = height / 192;
  const colors = { ...design.tokens.colors, ...(design.palettes.options[deck.palette ?? design.palettes.default] ?? {}) };
  const color = (token: string): string => hex(colors[token] ?? colors.fg ?? "#000000");
  const px = (value: number): number => Math.round(value * 0.375 * 10) / 10; // canvas px → pt at 192 px/in

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "DECK", width: widthIn, height: heightIn });
  pptx.layout = "DECK";
  pptx.title = deck.title;
  pptx.author = deck.meta?.author ?? "";

  deck.slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: color("bg") };

    const margin = 0.7;
    const image = (slideData.images ?? [])[0];
    const side = image ? imageSide(image) : undefined;
    const imagePath = image ? join(options.assetsRoot, image.src) : undefined;
    const hasImage = Boolean(image && imagePath && existsSync(imagePath));

    let textBox = { x: margin, y: margin, w: widthIn - margin * 2, h: heightIn - margin * 2 };
    if (hasImage && image && imagePath) {
      if (side === "left") {
        slide.addImage({ path: imagePath, x: margin, y: margin, w: widthIn * 0.4, h: heightIn - margin * 2, sizing: { type: "cover", w: widthIn * 0.4, h: heightIn - margin * 2 } });
        textBox = { x: widthIn * 0.4 + margin * 1.5, y: margin, w: widthIn * 0.6 - margin * 2.5, h: heightIn - margin * 2 };
      } else if (side === "right") {
        slide.addImage({ path: imagePath, x: widthIn * 0.6 + margin * 0.5, y: margin, w: widthIn * 0.4 - margin * 1.5, h: heightIn - margin * 2, sizing: { type: "cover", w: widthIn * 0.4 - margin * 1.5, h: heightIn - margin * 2 } });
        textBox = { x: margin, y: margin, w: widthIn * 0.6 - margin * 1.5, h: heightIn - margin * 2 };
      } else if (side === "top") {
        const imageHeight = heightIn * 0.34;
        slide.addImage({ path: imagePath, x: margin, y: margin * 0.6, w: widthIn - margin * 2, h: imageHeight, sizing: { type: "cover", w: widthIn - margin * 2, h: imageHeight } });
        textBox = { x: margin, y: imageHeight + margin * 0.9, w: widthIn - margin * 2, h: heightIn - imageHeight - margin * 1.5 };
      } else {
        slide.addImage({ path: imagePath, x: 0, y: 0, w: widthIn, h: heightIn, sizing: { type: "cover", w: widthIn, h: heightIn } });
      }
    }

    const align = hasImage && side !== "top" ? "left" : "center";
    const family = (role: "display" | "body" | "mono"): string => design.fonts[role];
    const runs: PptxGenJS.TextProps[] = [];
    const add = (text: string, options: PptxGenJS.TextPropsOptions) => runs.push({ text, options: { align, ...options } });

    for (const part of slideParts(slideData)) {
      switch (part.role) {
        case "kicker":
          add(part.text.toUpperCase(), { fontFace: family("mono"), fontSize: px(18), color: color("muted"), charSpacing: 4, breakLine: true, paraSpaceAfter: 6 });
          break;
        case "title":
          add(part.text, { fontFace: family("display"), fontSize: px(part.text.length > 34 ? 56 : 72), bold: true, color: color("fg"), breakLine: true, paraSpaceAfter: 8 });
          break;
        case "subtitle":
          add(part.text, { fontFace: family("display"), fontSize: px(34), italic: true, color: color("muted"), breakLine: true, paraSpaceAfter: 12 });
          break;
        case "quote":
          add(part.text, { fontFace: family("body"), fontSize: px(part.text.length > 140 ? 30 : 40), italic: true, color: color("fg"), breakLine: true, paraSpaceAfter: 8 });
          break;
        case "heading":
          add(part.text, { fontFace: family("display"), fontSize: px(32), bold: true, color: color("fg"), breakLine: true, paraSpaceBefore: 8 });
          break;
        case "term":
          add(`${part.term}  `, { fontFace: family("display"), fontSize: px(30), bold: true, color: color("fg"), align: "left" });
          add(part.text, { fontFace: family("body"), fontSize: px(26), color: color("fg"), align: "left", breakLine: true, paraSpaceAfter: 6 });
          break;
        case "item":
          add(`${part.marker}  `, { fontFace: family("mono"), fontSize: px(22), color: color("accent"), align: "left" });
          add(part.text, { fontFace: family("body"), fontSize: px(26), color: color("fg"), align: "left", breakLine: true, paraSpaceAfter: 6 });
          break;
        case "meta":
          add(part.text, { fontFace: family("mono"), fontSize: px(18), color: color("muted"), breakLine: true, paraSpaceBefore: 4 });
          break;
        default:
          add(part.text, { fontFace: family("body"), fontSize: px(28), color: color("fg"), breakLine: true, paraSpaceAfter: 6 });
      }
    }

    if (runs.length > 0) {
      slide.addText(runs, { ...textBox, valign: "middle", margin: 0, fit: "shrink" });
    }

    const note = options.notes?.[index];
    if (note) slide.addNotes(note);
  });

  const output = await pptx.write({ outputType: "nodebuffer" });
  return output as Buffer;
};
