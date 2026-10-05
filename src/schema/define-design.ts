import { z } from "zod";
import { coreLayouts } from "../layouts";
import {
  SLIDE_ID,
  ImageRefSchema,
  ShapeSchema,
  animationSchema,
  type Deck,
} from "./core";
import type { Design, DesignConfig } from "./design-types";
import type { LayoutDef } from "./layout";

const REQUIRED_TOKENS = ["bg", "surface", "fg", "muted", "border", "accent"] as const;

const oneOf = (values: string[], what: string): [string, ...string[]] => {
  if (values.length === 0) throw new Error(`defineDesign: ${what} must have at least one option`);
  return values as [string, ...string[]];
};

/** Composes the full slide schema for a layout inside a design. */
export const slideSchemaFor = (layout: LayoutDef, config: DesignConfig) =>
  z
    .object({
      id: z.string().regex(SLIDE_ID, "kebab-case id (a-z, 0-9, -)"),
      layout: z.literal(layout.name),
      label: z.string().min(1).describe("Short human label shown in the presenter (data-screen-label)"),
      variant: z.enum(oneOf(config.variants.options, "variants.options")).optional(),
      images: z.array(ImageRefSchema).optional(),
      animation: animationSchema(config.animations.allow).optional(),
      ...layout.content,
    })
    .strict();

/**
 * Turns a design manifest into a ready-to-use `Design`: resolves layouts and composes the
 * Zod schema that validates `deck.json` (and is exported as JSON Schema for editors/agents).
 */
export const defineDesign = (config: DesignConfig): Design => {
  for (const token of REQUIRED_TOKENS) {
    if (!config.tokens.colors[token]) throw new Error(`defineDesign(${config.id}): missing color token "${token}"`);
  }
  if (!config.variants.options.includes(config.variants.default)) {
    throw new Error(`defineDesign(${config.id}): default variant "${config.variants.default}" not in options`);
  }
  if (!(config.palettes.default in config.palettes.options)) {
    throw new Error(`defineDesign(${config.id}): default palette "${config.palettes.default}" not in options`);
  }

  const all: Record<string, LayoutDef> = {};
  for (const name of config.layouts.core) {
    const layout = coreLayouts[name];
    if (!layout) throw new Error(`defineDesign(${config.id}): unknown core layout "${name}"`);
    all[name] = layout;
  }
  for (const [name, layout] of Object.entries(config.layouts.custom)) {
    if (all[name]) throw new Error(`defineDesign(${config.id}): layout "${name}" clashes with a core layout`);
    if (layout.name !== name) throw new Error(`defineDesign(${config.id}): layout key "${name}" != layout.name "${layout.name}"`);
    all[name] = layout;
  }

  const slideSchemas = Object.values(all).map((layout) => slideSchemaFor(layout, config));
  const slideUnion = z.discriminatedUnion("layout", slideSchemas as unknown as [
    (typeof slideSchemas)[number],
    ...(typeof slideSchemas)[number][],
  ]);

  const deckSchema = z
    .object({
      $schema: z.string().optional(),
      id: z.string().regex(SLIDE_ID, "kebab-case id"),
      title: z.string().min(1),
      lang: z.enum(oneOf(config.lang, "lang")).default(config.lang[0] as string),
      design: z.literal(config.id),
      variant: z.enum(oneOf(config.variants.options, "variants.options")).optional(),
      palette: z.enum(oneOf(Object.keys(config.palettes.options), "palettes.options")).optional(),
      shape: ShapeSchema.default(config.shapes[0] as Deck["shape"]),
      meta: z
        .object({ author: z.string().optional(), sources: z.array(z.string()).default([]) })
        .default({ sources: [] }),
      slides: z.array(slideUnion).min(1),
    })
    .strict() as unknown as z.ZodType<Deck>;

  return {
    ...config,
    dir: `designs/${config.id}`,
    layouts: { ...config.layouts, all },
    deckSchema,
  };
};
