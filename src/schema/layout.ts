import type { ReactElement } from "react";
import type { z } from "zod";
import type { Deck, ImageSlot, Slide, SlideBase } from "./core";
import type { Design } from "./design-types";

/** Everything a layout component may need while rendering one slide. */
export interface RenderContext {
  design: Design;
  deck: Deck;
  /** 0-based index of the slide being rendered. */
  index: number;
  total: number;
  /** Progressive reveal enabled for this slide. */
  steps: boolean;
  /** Image animation preset for this slide ("none" when unset). */
  imageAnim: string;
  /** Resolves a deck-relative asset path to the URL written in the HTML. */
  asset: (src: string) => string;
  /** Returns inline SVG markup for a motif of the design, if it exists. */
  motif: (name: string) => string | undefined;
}

export type LayoutProps<C extends z.ZodRawShape> = {
  slide: SlideBase & z.infer<z.ZodObject<C>>;
  ctx: RenderContext;
};

export interface LayoutDef {
  name: string;
  /** One line used by `npm run designs` and the generated guides. */
  description: string;
  /** Image slots the layout can render. Empty = no images. */
  imageSlots: readonly ImageSlot[];
  /** Zod shape of the layout-specific fields (everything except the slide base). */
  content: z.ZodRawShape;
  component: (props: { slide: Slide; ctx: RenderContext }) => ReactElement;
  /** Minimal valid content, used by galleries and examples. */
  example?: Record<string, unknown>;
}

export const defineLayout = <C extends z.ZodRawShape>(def: {
  name: string;
  description: string;
  imageSlots?: readonly ImageSlot[];
  content: C;
  component: (props: LayoutProps<C>) => ReactElement;
  example?: Record<string, unknown>;
}): LayoutDef => ({
  name: def.name,
  description: def.description,
  imageSlots: def.imageSlots ?? [],
  content: def.content,
  component: def.component as unknown as LayoutDef["component"],
  example: def.example,
});
