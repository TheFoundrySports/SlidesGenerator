import { z } from "zod";

/** Canvas shapes shared by every design. Dimensions live in `src/shapes/dimensions.ts`. */
export const SHAPES = ["landscape-16-9", "portrait-3-4", "square-1-1", "ultrawide-21-9"] as const;
export const ShapeSchema = z.enum(SHAPES);
export type Shape = z.infer<typeof ShapeSchema>;

/** Named animation presets (the engine owns the CSS, designs pick an allowlist). */
export const ENTER_PRESETS = ["fade-lift", "fade", "none"] as const;
export const IMAGE_PRESETS = ["none", "slow-zoom", "fade-in-late"] as const;
/** Everything a design may allow: enter presets, `steps` (progressive reveal) and image presets. */
export const ANIMATION_FEATURES = ["fade-lift", "fade", "steps", "slow-zoom", "fade-in-late"] as const;
export type EnterPreset = (typeof ENTER_PRESETS)[number];
export type ImagePreset = (typeof IMAGE_PRESETS)[number];
export type AnimationFeature = (typeof ANIMATION_FEATURES)[number];

export const IMAGE_SLOTS = ["background", "left", "right", "top", "full", "inset"] as const;
export const ImageSlotSchema = z.enum(IMAGE_SLOTS);
export type ImageSlot = z.infer<typeof ImageSlotSchema>;

/** Percent-of-canvas rectangle. Only the `free` layout uses explicit boxes. */
export const BoxSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  w: z.number().min(0).max(100),
  h: z.number().min(0).max(100),
});
export type Box = z.infer<typeof BoxSchema>;

export const ImageRefSchema = z.object({
  src: z.string().min(1).describe("Path relative to the deck folder, e.g. assets/peter.jpg"),
  alt: z.string().min(1).describe("Accessible description (required)"),
  slot: ImageSlotSchema.default("right").describe("Where the layout places the image"),
  fit: z.enum(["cover", "contain"]).default("cover"),
  focal: z
    .object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) })
    .optional()
    .describe("Focal point 0..1 used as object-position when fit=cover"),
  box: BoxSchema.optional().describe("Only for layout `free`: percent-of-canvas rectangle"),
  caption: z.string().optional(),
  credit: z.string().optional(),
});
export type ImageRef = z.infer<typeof ImageRefSchema>;

export const SLIDE_ID = /^[a-z0-9][a-z0-9-]*$/;

/** Builds the per-design animation schema from the design's allowlist. */
export const animationSchema = (allow: readonly AnimationFeature[]) => {
  const enter = ENTER_PRESETS.filter((p) => p === "none" || allow.includes(p));
  const image = IMAGE_PRESETS.filter((p) => p === "none" || allow.includes(p));
  const shape: Record<string, z.ZodType> = {
    enter: z.enum(enter as [EnterPreset, ...EnterPreset[]]).optional(),
    image: z.enum(image as [ImagePreset, ...ImagePreset[]]).optional(),
  };
  if (allow.includes("steps")) shape.steps = z.boolean().optional().describe("Reveal list items one by one");
  return z.object(shape).strict();
};
export type Animation = { enter?: EnterPreset; steps?: boolean; image?: ImagePreset };

/** Fields every slide has, whatever the layout. */
export interface SlideBase {
  id: string;
  layout: string;
  label: string;
  variant?: string;
  images?: ImageRef[];
  animation?: Animation;
}
export type Slide = SlideBase & Record<string, unknown>;

export interface Deck {
  $schema?: string;
  id: string;
  title: string;
  lang: string;
  design: string;
  variant?: string;
  palette?: string;
  shape: Shape;
  meta: { author?: string; sources: string[] };
  slides: Slide[];
}

/** Compact, agent-friendly rendering of a Zod error. */
export const formatZodError = (error: z.ZodError): string[] =>
  error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "(root)";
    return `${path}: ${issue.message}`;
  });
