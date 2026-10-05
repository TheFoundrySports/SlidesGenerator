/**
 * PPTX → deck.json importer.
 *
 * Extracts text blocks (position, size, bold, italic) and pictures from a .pptx, saves the images
 * to the deck's `assets/` and emits a draft `deck.json` for a chosen design:
 *
 *  - `free` mode (default): every slide becomes a core `free` layout that reproduces the source
 *    positions as percentages of the canvas. Faithful, but not semantic.
 *  - `map` mode: slides listed in the map become one of the design's layouts; text blocks are
 *    assigned to the layout's string fields (largest text first). Slides not in the map stay `free`.
 *
 * Colors, fonts, themes, transitions and animations of the source are discarded on purpose:
 * the design owns the look. The result is a draft to refine (by hand or with the pptx-importer agent).
 */
import JSZip from "jszip";
import { basename, extname } from "node:path";
import type { z } from "zod";
import type { Box, ImageRef } from "../schema/core";
import type { Design } from "../schema/design-types";

/* ── Raw extraction ──────────────────────────────────────────────────────────── */
export interface TextRun {
  text: string;
  size: number | null;
  bold: boolean;
  italic: boolean;
}

export interface TextShape {
  kind: "text";
  x: number;
  y: number;
  w: number;
  h: number;
  runs: TextRun[];
  /** Paragraphs joined with "\n". */
  text: string;
  maxSize: number;
  anyBold: boolean;
  anyItalic: boolean;
  align: "left" | "center" | "right";
}

export interface ImageShape {
  kind: "image";
  x: number;
  y: number;
  w: number;
  h: number;
  rId: string | null;
  /** File name written to assets/, set by `extractPptx`. */
  imageName?: string;
}

export type Shape = TextShape | ImageShape;

export interface ExtractedSlide {
  /** 1-based slide number (from the file name). */
  index: number;
  total: number;
  shapes: Shape[];
}

export interface SlideSize {
  w: number;
  h: number;
}

export interface SavedImage {
  name: string;
  data: Buffer;
}

export interface Extraction {
  slides: ExtractedSlide[];
  slideSize: SlideSize;
  images: SavedImage[];
}

/** EMU → px at 96 DPI. */
export const emuToPx = (emu: number): number => Math.round(emu / 9525);

export const decodeXmlEntities = (value: string): string =>
  value.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

export const parseRunProperties = (rpr: string): { size: number | null; bold: boolean; italic: boolean } => {
  if (!rpr) return { size: null, bold: false, italic: false };
  const size = rpr.match(/\bsz="(\d+)"/);
  return { size: size ? parseInt(size[1] as string, 10) / 100 : null, bold: /\bb="1"/.test(rpr), italic: /\bi="1"/.test(rpr) };
};

const parseAlign = (shapeXml: string): TextShape["align"] => {
  const algn = shapeXml.match(/<a:pPr[^>]*\balgn="(\w+)"/)?.[1];
  if (algn === "ctr") return "center";
  if (algn === "r") return "right";
  return "left";
};

/** Parses one `<p:sp>` or `<p:pic>` element. Returns `null` for shapes without position or text. */
export const parseShape = (shapeXml: string): Shape | null => {
  const xfrm = shapeXml.match(/<a:xfrm[^>]*>([\s\S]*?)<\/a:xfrm>/)?.[1];
  if (!xfrm) return null;
  const off = xfrm.match(/<a:off\s+x="(-?\d+)"\s+y="(-?\d+)"\s*\/>/);
  const ext = xfrm.match(/<a:ext\s+cx="(\d+)"\s+cy="(\d+)"\s*\/>/);
  if (!off || !ext) return null;
  const box = {
    x: emuToPx(parseInt(off[1] as string, 10)),
    y: emuToPx(parseInt(off[2] as string, 10)),
    w: emuToPx(parseInt(ext[1] as string, 10)),
    h: emuToPx(parseInt(ext[2] as string, 10)),
  };

  if (/<p:pic\b/.test(shapeXml)) {
    return { kind: "image", ...box, rId: shapeXml.match(/<a:blip\s+r:embed="(rId\d+)"/)?.[1] ?? null };
  }
  if (!/<p:sp\b/.test(shapeXml)) return null;

  const runs: TextRun[] = [];
  const paragraphs: string[] = [];
  for (const paragraph of shapeXml.split(/<a:p>|<a:p\s[^>]*>/).slice(1)) {
    const texts: string[] = [];
    for (const match of paragraph.matchAll(/<a:r>([\s\S]*?)<\/a:r>|<a:br\s*\/>/g)) {
      if (match[0].startsWith("<a:br")) {
        texts.push("\n");
        continue;
      }
      const runXml = match[1] as string;
      const text = runXml.match(/<a:t>([\s\S]*?)<\/a:t>/)?.[1];
      if (text === undefined) continue;
      const props = parseRunProperties(runXml.match(/<a:rPr([^/>]*?)\/?>/)?.[1] ?? "");
      const decoded = decodeXmlEntities(text);
      runs.push({ text: decoded, ...props });
      texts.push(decoded);
    }
    const joined = texts.join("");
    if (joined.length > 0) paragraphs.push(joined);
  }
  if (runs.length === 0) return null;

  return {
    kind: "text",
    ...box,
    runs,
    text: paragraphs.join("\n"),
    maxSize: runs.reduce((max, run) => Math.max(max, run.size ?? 0), 0),
    anyBold: runs.some((run) => run.bold),
    anyItalic: runs.some((run) => run.italic),
    align: parseAlign(shapeXml),
  };
};

export const parseSlideXml = (xml: string): Shape[] => {
  const shapes: Shape[] = [];
  for (const match of xml.matchAll(/<p:(sp|pic)\b[^>]*>([\s\S]*?)<\/p:\1>/g)) {
    const shape = parseShape(match[0]);
    if (shape) shapes.push(shape);
  }
  return shapes;
};

export const parseRelsXml = (relsXml: string): Record<string, string> => {
  const rels: Record<string, string> = {};
  for (const match of relsXml.matchAll(/<Relationship\s+([^>]*?)\/>/g)) {
    const attrs = match[1] as string;
    const id = attrs.match(/\bId="([^"]+)"/)?.[1];
    const target = attrs.match(/\bTarget="([^"]+)"/)?.[1];
    if (id && target) rels[id] = target;
  }
  return rels;
};

export const parseSlideSize = (presentationXml: string): SlideSize => {
  const match = presentationXml.match(/<p:sldSz\s+cx="(\d+)"\s+cy="(\d+)"/);
  if (!match) return { w: 9144000, h: 6858000 };
  return { w: parseInt(match[1] as string, 10), h: parseInt(match[2] as string, 10) };
};

export const extractPptx = async (buffer: Buffer): Promise<Extraction> => {
  const zip = await JSZip.loadAsync(buffer);
  const presentation = zip.file("ppt/presentation.xml");
  if (!presentation) throw new Error("not a .pptx file (ppt/presentation.xml missing)");
  const slideSize = parseSlideSize(await presentation.async("string"));

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => Number(a.match(/(\d+)\.xml$/)?.[1]) - Number(b.match(/(\d+)\.xml$/)?.[1]));

  const slides: ExtractedSlide[] = [];
  const images: SavedImage[] = [];
  const savedByZipPath = new Map<string, string>();

  for (const file of slideFiles) {
    const xml = await (zip.file(file) as JSZip.JSZipObject).async("string");
    const relsFile = zip.file(file.replace("slides/", "slides/_rels/").replace(".xml", ".xml.rels"));
    const rels = relsFile ? parseRelsXml(await relsFile.async("string")) : {};
    const shapes = parseSlideXml(xml);

    for (const shape of shapes) {
      if (shape.kind !== "image" || !shape.rId || !rels[shape.rId]) continue;
      const target = rels[shape.rId] as string;
      const zipPath = `ppt/${target.replace(/^\.\.\//, "")}`;
      const existing = savedByZipPath.get(zipPath);
      if (existing) {
        shape.imageName = existing;
        continue;
      }
      const entry = zip.file(zipPath);
      if (!entry) continue;
      const name = basename(target);
      images.push({ name, data: await entry.async("nodebuffer") });
      savedByZipPath.set(zipPath, name);
      shape.imageName = name;
    }

    slides.push({ index: Number(file.match(/slide(\d+)\.xml$/)?.[1]), total: slideFiles.length, shapes });
  }

  return { slides, slideSize, images };
};

/* ── deck.json generation ────────────────────────────────────────────────────── */
export const parseMapArg = (value: string | undefined): Record<number, string> => {
  const map: Record<number, string> = {};
  for (const pair of (value ?? "").split(",")) {
    const [key, layout] = pair.split(":").map((part) => part.trim());
    const index = Number(key);
    if (Number.isInteger(index) && layout) map[index] = layout;
  }
  return map;
};

const round = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, round(value)));

const toBox = (shape: Shape, size: SlideSize): Box => {
  const widthPx = emuToPx(size.w);
  const heightPx = emuToPx(size.h);
  const x = clampPercent((shape.x / widthPx) * 100);
  const y = clampPercent((shape.y / heightPx) * 100);
  return {
    x,
    y,
    w: Math.min(round((shape.w / widthPx) * 100), 100 - x),
    h: Math.min(round((shape.h / heightPx) * 100), 100 - y),
  };
};

/** Slide width in points, used to convert PPTX font points into canvas pixels. */
const pointsToCanvasPx = (points: number, size: SlideSize, canvasWidth: number): number => {
  const slideWidthPt = size.w / 12700;
  return Math.max(10, Math.min(240, Math.round(points * (canvasWidth / slideWidthPt))));
};

const textBlock = (shape: TextShape, size: SlideSize, canvasWidth: number) => ({
  kind: "text" as const,
  text: shape.text,
  box: toBox(shape, size),
  size: pointsToCanvasPx(shape.maxSize || 14, size, canvasWidth),
  ...(shape.anyBold ? { weight: 600 } : {}),
  italic: shape.anyItalic,
  align: shape.align,
});

const imageRef = (shape: ImageShape, size: SlideSize, deckAssetsDir: string, label: string): ImageRef => ({
  src: `${deckAssetsDir}/${shape.imageName}`,
  alt: label,
  slot: "inset",
  fit: "contain",
  box: toBox(shape, size),
});

/** Names of the string fields a layout can receive text in: required first, then optional, in declaration order. */
export const stringFieldsOf = (content: z.ZodRawShape): string[] => {
  const required: string[] = [];
  const optional: string[] = [];
  for (const [key, schema] of Object.entries(content)) {
    let current = schema as z.ZodType & { def: { type: string; innerType?: z.ZodType } };
    let isOptional = false;
    while (current.def.type === "optional" || current.def.type === "default") {
      isOptional = true;
      current = current.def.innerType as typeof current;
    }
    if (current.def.type !== "string") continue;
    (isOptional ? optional : required).push(key);
  }
  return [...required, ...optional];
};

export interface ToDeckOptions {
  slug: string;
  title: string;
  design: Design;
  /** slide number (1-based) → layout name. */
  map?: Record<number, string>;
  /** Deck-relative folder where the images were written. */
  assetsDir?: string;
}

const slideId = (index: number, total: number): string => `slide-${String(index).padStart(String(total).length, "0")}`;

const fillLayoutSlide = (slide: ExtractedSlide, layoutName: string, options: ToDeckOptions) => {
  const layout = options.design.layouts.all[layoutName];
  if (!layout) throw new Error(`design "${options.design.id}" has no layout "${layoutName}" (slide ${slide.index})`);
  const texts = slide.shapes
    .filter((shape): shape is TextShape => shape.kind === "text")
    .sort((a, b) => b.maxSize - a.maxSize || a.y - b.y);
  const fields = stringFieldsOf(layout.content);

  const content: Record<string, string> = {};
  texts.forEach((shape, i) => {
    const field = fields[i];
    if (field) content[field] = shape.text;
  });

  const pictures = slide.shapes.filter((shape): shape is ImageShape => isUsableImage(shape));
  const slot = layout.imageSlots[0];
  const images: ImageRef[] =
    slot && pictures[0]
      ? [{ src: `${options.assetsDir ?? "assets"}/${pictures[0].imageName}`, alt: `Slide ${slide.index} image`, slot, fit: "cover" }]
      : [];

  return {
    id: slideId(slide.index, slide.total),
    layout: layoutName,
    label: (content.title ?? content.text ?? `Slide ${slide.index}`).split("\n")[0]!.slice(0, 60),
    ...content,
    ...(images.length > 0 ? { images } : {}),
  };
};

const freeSlide = (slide: ExtractedSlide, size: SlideSize, canvasWidth: number, options: ToDeckOptions) => {
  const texts = slide.shapes.filter((shape): shape is TextShape => shape.kind === "text");
  const pictures = slide.shapes.filter((shape): shape is ImageShape => isUsableImage(shape));
  const biggest = [...texts].sort((a, b) => b.maxSize - a.maxSize)[0];
  return {
    id: slideId(slide.index, slide.total),
    layout: "free",
    label: (biggest?.text.split("\n")[0] ?? `Slide ${slide.index}`).slice(0, 60),
    blocks: texts.map((shape) => textBlock(shape, size, canvasWidth)),
    ...(pictures.length > 0
      ? { images: pictures.map((shape) => imageRef(shape, size, options.assetsDir ?? "assets", `Slide ${slide.index} image`)) }
      : {}),
  };
};

/** Builds the draft deck object (not yet validated). */
export const toDeck = (extraction: Extraction, options: ToDeckOptions) => {
  const { design, map = {} } = options;
  const shape = design.shapes[0] ?? "landscape-16-9";
  const canvasWidth = shape === "portrait-3-4" || shape === "square-1-1" ? 1440 : shape === "ultrawide-21-9" ? 2520 : 1920;

  if (!design.layouts.all.free && Object.keys(map).length < extraction.slides.length) {
    throw new Error(`design "${design.id}" does not allow the "free" layout; pass --map for every slide`);
  }

  return {
    id: options.slug,
    title: options.title,
    lang: design.lang[0] ?? "en",
    design: design.id,
    shape,
    slides: extraction.slides.map((slide) => {
      const layoutName = map[slide.index];
      return layoutName
        ? fillLayoutSlide(slide, layoutName, options)
        : freeSlide(slide, extraction.slideSize, canvasWidth, options);
    }),
  };
};

const isUsableImage = (shape: Shape): shape is ImageShape =>
  shape.kind === "image" && Boolean(shape.imageName) && isSupportedImage(shape.imageName as string);

export const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);
export const isSupportedImage = (name: string): boolean => imageExtensions.has(extname(name).toLowerCase());
