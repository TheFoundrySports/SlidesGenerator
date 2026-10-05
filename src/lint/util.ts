import type { Slide } from "../schema/core";

const NON_PROSE_KEYS = new Set([
  "id", "layout", "src", "variant", "motif", "slot", "fit", "kind", "family", "color", "align", "numbering", "enter", "image",
]);

/** Every human-readable string of a slide (keys that hold identifiers/enums are skipped). */
export const collectText = (value: unknown, key = ""): string[] => {
  if (typeof value === "string") return NON_PROSE_KEYS.has(key) ? [] : [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectText(item, key));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => collectText(v, k));
  }
  return [];
};

export const slideText = (slide: Slide): string => collectText(slide).join("\n");

/** Prose with «quoted» passages removed (quotations may contain exclamations legitimately). */
export const withoutQuotations = (text: string): string => text.replace(/«[^»]*»/g, "");

export const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
