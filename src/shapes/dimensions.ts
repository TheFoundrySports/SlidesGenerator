import type { Shape } from "../schema/core";

/** Canvas size in CSS pixels for each shape. */
export const SHAPE_DIMENSIONS: Record<Shape, readonly [number, number]> = {
  "landscape-16-9": [1920, 1080],
  "portrait-3-4": [1440, 1920],
  "square-1-1": [1440, 1440],
  "ultrawide-21-9": [2520, 1080],
};

export const shapeDimensions = (shape: string): readonly [number, number] =>
  SHAPE_DIMENSIONS[shape as Shape] ?? SHAPE_DIMENSIONS["landscape-16-9"];

/** Scale-to-fit factor that preserves the aspect ratio. */
export const computeStageScale = (viewportW: number, viewportH: number, canvasW = 1920, canvasH = 1080): number => {
  if (!(viewportW > 0) || !(viewportH > 0)) return 1;
  return Math.min(viewportW / canvasW, viewportH / canvasH);
};

export const shapeCssPath = (shape: string): string => `src/shapes/${shape}.css`;
