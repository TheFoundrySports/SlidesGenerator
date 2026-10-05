import type { z } from "zod";
import type { AnimationFeature, Deck, EnterPreset, Shape } from "./core";
import type { LayoutDef } from "./layout";

export type Severity = "P0" | "P1" | "P2";

export interface Issue {
  rule: string;
  severity: Severity;
  message: string;
  /** Slide id the issue belongs to (deck-level issues omit it). */
  slide?: string;
}

export interface LintContext {
  deck: Deck;
  design: Design;
  /** Lets the lint check asset existence without depending on the filesystem. */
  fileExists?: (deckRelativePath: string) => boolean;
}

export type Rule = (ctx: LintContext) => Issue[];

export type Colors = Record<string, string>;

export interface DesignConfig {
  id: string;
  name: string;
  description: string;
  /** Languages the design is written for; the first one is the default. */
  lang: string[];
  fonts: {
    display: string;
    body: string;
    mono: string;
    /** Optional web-font stylesheet URL (omitted when a deck is built with --offline). */
    href?: string;
    /** Full CSS font stacks; defaults to the family followed by a generic fallback. */
    stacks?: { display?: string; body?: string; mono?: string };
  };
  /** Color tokens. Must contain bg, surface, fg, muted, border, accent; extra tokens are allowed. */
  tokens: { colors: Colors };
  /** CSS files relative to the design folder, appended in order. */
  css: string[];
  variants: { default: string; options: string[] };
  /** Palette name -> token overrides (e.g. liturgical seasons). The default should be `{}`. */
  palettes: { default: string; options: Record<string, Colors> };
  shapes: Shape[];
  layouts: {
    /** Engine layouts this design allows. */
    core: string[];
    /** Layouts owned by the design. */
    custom: Record<string, LayoutDef>;
  };
  animations: {
    allow: AnimationFeature[];
    default: EnterPreset;
    /** Max number of slides per deck that may use a feature. */
    budget?: Partial<Record<AnimationFeature, number>>;
  };
  rules?: Rule[];
  /** Inline SVG motifs (viewBox 100x100, currentColor strokes). */
  motifs?: Record<string, string>;
  limits?: { maxSlides?: number; maxMotifsPerSlide?: number };
}

export interface Design extends DesignConfig {
  /** Project-relative folder, assigned by the registry (e.g. `designs/catechism-liturgical`). */
  dir: string;
  /** Resolved layouts (allowed core layouts + custom ones). */
  layouts: DesignConfig["layouts"] & { all: Record<string, LayoutDef> };
  /** Full deck schema for this design. */
  deckSchema: z.ZodType<Deck>;
}
