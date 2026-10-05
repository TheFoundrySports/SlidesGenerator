import type { LayoutDef } from "../schema/layout";
import {
  bulletsLayout,
  freeLayout,
  imageFullLayout,
  imageOverlayLayout,
  imageTextLayout,
  quoteLayout,
  sectionLayout,
  textImageLayout,
  titleBodyLayout,
  titleLayout,
  twoColumnLayout,
} from "./core";

/** Engine layouts. A design opts in by name through `layouts.core`. */
export const coreLayouts: Record<string, LayoutDef> = Object.fromEntries(
  [
    titleLayout,
    titleBodyLayout,
    bulletsLayout,
    quoteLayout,
    twoColumnLayout,
    sectionLayout,
    textImageLayout,
    imageTextLayout,
    imageOverlayLayout,
    imageFullLayout,
    freeLayout,
  ].map((layout) => [layout.name, layout]),
);
