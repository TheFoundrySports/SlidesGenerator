/**
 * Pure helpers for the presenter. No DOM access, so they run under Vitest in Node.
 * The deck HTML produced by the engine (and by older hand-written decks) is only ever
 * read through `parseDeckHtml`: the presenter never executes a deck's own <script>.
 */
import { SHAPE_DIMENSIONS, computeStageScale, shapeDimensions } from "../src/shapes/dimensions";

export { SHAPE_DIMENSIONS, computeStageScale, shapeDimensions };

export interface RawSlide {
  attrs: string;
  inner: string;
  outerHtml: string;
}

export interface StyleBlock {
  /** Value of `data-scope` ("slides" | "page"); `null` for legacy decks without scopes. */
  scope: string | null;
  css: string;
}

export interface ParsedDeckHtml {
  /** CSS bodies of every <style> block, in order. */
  styles: string[];
  styleBlocks: StyleBlock[];
  /** `href` of every stylesheet <link> (web fonts). */
  links: string[];
  /** Every <section> whose class list includes "slide". */
  slides: RawSlide[];
}

const STYLE_RE = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
const SECTION_RE = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
const LINK_RE = /<link\b[^>]*>/gi;

export const parseDeckHtml = (html: string): ParsedDeckHtml => {
  if (typeof html !== "string") throw new TypeError("parseDeckHtml: expected string");

  const styleBlocks: StyleBlock[] = [];
  for (const match of html.matchAll(STYLE_RE)) {
    const scope = (match[1] ?? "").match(/\bdata-scope\s*=\s*["']([^"']+)["']/)?.[1] ?? null;
    styleBlocks.push({ scope, css: match[2] ?? "" });
  }

  const links: string[] = [];
  for (const match of html.matchAll(LINK_RE)) {
    const tag = match[0];
    if (!/\brel\s*=\s*["']stylesheet["']/i.test(tag)) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href) links.push(href);
  }

  const slides: RawSlide[] = [];
  for (const match of html.matchAll(SECTION_RE)) {
    const attrs = match[1] ?? "";
    if (/\bclass\s*=\s*["'][^"']*\bslide\b/.test(attrs)) slides.push({ attrs, inner: match[2] ?? "", outerHtml: match[0] });
  }

  return { styles: styleBlocks.map((block) => block.css), styleBlocks, links, slides };
};

/** CSS the presenter injects: everything except the deck page's own chrome (`data-scope="page"`). */
export const slideScopeStyles = (parsed: ParsedDeckHtml): string[] =>
  parsed.styleBlocks.filter((block) => block.scope !== "page").map((block) => block.css);

/**
 * Accepts a bare array or `{ deck, slides: [...] }`. Returns `total` strings, padded with "".
 * Throws on malformed JSON.
 */
export const parseSidecar = (jsonText: string, total: number): string[] => {
  if (typeof jsonText !== "string") throw new TypeError("parseSidecar: expected string");
  if (!Number.isInteger(total) || total < 0) throw new TypeError("parseSidecar: total must be a non-negative integer");

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch (error) {
    throw new SyntaxError(`parseSidecar: invalid JSON: ${(error as Error).message}`);
  }

  let raw: unknown[];
  if (Array.isArray(data)) raw = data;
  else if (data && Array.isArray((data as { slides?: unknown }).slides)) raw = (data as { slides: unknown[] }).slides;
  else if (data == null) raw = [];
  else throw new TypeError("parseSidecar: expected array or {slides: [...]}");

  return Array.from({ length: total }, (_, i) => (raw[i] == null ? "" : String(raw[i])));
};

export const emptySidecar = (total: number, deckName = ""): string => {
  if (!Number.isInteger(total) || total < 0) throw new TypeError("emptySidecar: total must be a non-negative integer");
  return JSON.stringify({ deck: deckName, slides: Array.from({ length: total }, () => "") }, null, 2);
};

/** Reads the shape from `<html class="... shape-<name> ...">`; defaults to landscape-16-9. */
export const extractShape = (html: string): string => {
  const attrs = (html || "").match(/<html\b([^>]*)>/)?.[1] ?? "";
  return attrs.match(/\bshape-([\w-]+)\b/)?.[1] ?? "landscape-16-9";
};

export interface DeckIndexEntry {
  slug: string;
  title: string;
  design: string;
  slides: number;
  /** Path relative to `dist/`, e.g. `my-deck/my-deck.html`. */
  file: string;
}

/** Validates the `dist/decks.json` index written by the build. */
export const parseDecksIndex = (jsonText: string): DeckIndexEntry[] => {
  const data: unknown = JSON.parse(jsonText);
  if (!Array.isArray(data)) throw new TypeError("decks.json: expected an array");
  return data.filter(
    (entry): entry is DeckIndexEntry =>
      Boolean(entry) && typeof entry.slug === "string" && typeof entry.file === "string" && typeof entry.title === "string",
  );
};

/* ── Minimal markdown for speaker notes ──────────────────────────────────────── */
const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] as string);

const renderInline = (text: string): string =>
  text
    .split(/(`[^`]+`)/)
    .map((part, i) => {
      if (i % 2 === 1) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      return escapeHtml(part)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*(?=\S)(.+?)(?<=\S)\*\*/g, "<strong>$1</strong>")
        .replace(/(?<![*\w])\*(?=\S)(.+?)(?<=\S)\*(?![*\w])/g, "<em>$1</em>")
        .replace(/(?<![_\w])_(?=\S)(.+?)(?<=\S)_(?![_\w])/g, "<em>$1</em>");
    })
    .join("");

const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;

type BlockKind = "ul" | "ol" | "quote" | "p";

const blockKind = (line: string): BlockKind => {
  if (BULLET.test(line)) return "ul";
  if (NUMBERED.test(line)) return "ol";
  if (QUOTE.test(line)) return "quote";
  return "p";
};

const renderBlock = (kind: BlockKind, lines: string[]): string => {
  if (kind === "ul" || kind === "ol") {
    const pattern = kind === "ul" ? BULLET : NUMBERED;
    const items = lines.map((line) => `<li>${renderInline((line.match(pattern) as RegExpMatchArray)[1] as string)}</li>`);
    return `<${kind}>${items.join("")}</${kind}>`;
  }
  if (kind === "quote") {
    const inner = lines.map((line) => renderInline((line.match(QUOTE) as RegExpMatchArray)[1] as string)).join("<br>");
    return `<blockquote>${inner}</blockquote>`;
  }
  return `<p>${lines.map((line) => renderInline(line)).join("<br>")}</p>`;
};

/**
 * Renders the markdown subset used in speaker notes: paragraphs, **bold**, *italic*, `code`,
 * [links](https://…), bullet / numbered lists and > quotes. Input is HTML-escaped first, so the
 * result is safe to assign to `innerHTML`.
 */
export const renderNotesMarkdown = (markdown: string): string => {
  const html: string[] = [];
  let kind: BlockKind | null = null;
  let buffer: string[] = [];
  const flush = (): void => {
    if (kind) html.push(renderBlock(kind, buffer));
    kind = null;
    buffer = [];
  };

  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      flush();
      continue;
    }
    const lineKind = blockKind(line);
    if (kind !== lineKind) flush();
    kind = lineKind;
    buffer.push(line);
  }
  flush();
  return html.join("");
};

export const sidecarPath = (htmlFile: string): string => htmlFile.replace(/\.html?$/i, ".notes.json");

export interface Bus {
  send: (message: unknown) => void;
  onMessage: (listener: (event: { data: unknown }) => void) => void;
  close: () => void;
}

/** BroadcastChannel wrapper (presenter window sync); a no-op local bus where unavailable. */
export const createBus = (name: string): Bus => {
  const listeners = new Set<(event: { data: unknown }) => void>();
  if (typeof BroadcastChannel === "undefined") {
    return {
      send: () => undefined,
      onMessage: (listener) => void listeners.add(listener),
      close: () => listeners.clear(),
    };
  }
  const channel = new BroadcastChannel(name);
  channel.addEventListener("message", (event) => listeners.forEach((listener) => listener(event)));
  return {
    send: (message) => channel.postMessage(message),
    onMessage: (listener) => void listeners.add(listener),
    close: () => {
      listeners.clear();
      channel.close();
    },
  };
};
