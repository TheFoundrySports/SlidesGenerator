import type { Issue, LintContext, Rule } from "../schema/design-types";
import type { AnimationFeature } from "../schema/core";

const duplicateIds: Rule = ({ deck }) => {
  const seen = new Set<string>();
  const issues: Issue[] = [];
  for (const slide of deck.slides) {
    if (seen.has(slide.id)) {
      issues.push({ rule: "slide-id-unique", severity: "P0", slide: slide.id, message: `duplicate slide id "${slide.id}"` });
    }
    seen.add(slide.id);
  }
  return issues;
};

const slideCount: Rule = ({ deck, design }) => {
  const max = design.limits?.maxSlides ?? 40;
  return deck.slides.length > max
    ? [{ rule: "slide-count", severity: "P1", message: `deck has ${deck.slides.length} slides; soft cap is ${max}` }]
    : [];
};

const images: Rule = ({ deck, design, fileExists }) => {
  const issues: Issue[] = [];
  for (const slide of deck.slides) {
    const layout = design.layouts.all[slide.layout];
    const slides = slide.images ?? [];
    if (layout && slides.length > 0 && layout.imageSlots.length === 0) {
      issues.push({ rule: "image-slot", severity: "P0", slide: slide.id, message: `layout "${slide.layout}" does not accept images` });
    }
    for (const image of slides) {
      if (layout && layout.imageSlots.length > 0 && !layout.imageSlots.includes(image.slot)) {
        issues.push({
          rule: "image-slot",
          severity: "P0",
          slide: slide.id,
          message: `slot "${image.slot}" is not valid for "${slide.layout}"; valid: ${layout.imageSlots.join(", ")}`,
        });
      }
      if (image.box && slide.layout !== "free") {
        issues.push({ rule: "image-box", severity: "P1", slide: slide.id, message: "`box` is only honored by layout `free`" });
      }
      if (/^[a-z]+:\/\//i.test(image.src)) {
        issues.push({ rule: "image-remote", severity: "P1", slide: slide.id, message: `remote image ${image.src}; copy it into the deck assets folder` });
      } else if (image.src.startsWith("/") || image.src.includes("..")) {
        issues.push({ rule: "image-path", severity: "P0", slide: slide.id, message: `image path "${image.src}" must be relative to the deck folder (no leading / or ..)` });
      } else if (fileExists && !fileExists(image.src)) {
        issues.push({ rule: "image-missing", severity: "P0", slide: slide.id, message: `image file not found: ${image.src}` });
      }
    }
  }
  return issues;
};

const freeBounds: Rule = ({ deck }) => {
  const issues: Issue[] = [];
  for (const slide of deck.slides) {
    if (slide.layout !== "free") continue;
    const boxes = [
      ...((slide.blocks as { box: { x: number; y: number; w: number; h: number } }[] | undefined) ?? []).map((b) => b.box),
      ...(slide.images ?? []).flatMap((image) => (image.box ? [image.box] : [])),
    ];
    if (boxes.some((box) => box.x + box.w > 100.01 || box.y + box.h > 100.01)) {
      issues.push({ rule: "free-bounds", severity: "P1", slide: slide.id, message: "a box extends past the canvas (x+w or y+h > 100)" });
    }
  }
  return issues;
};

const animationBudget: Rule = ({ deck, design }) => {
  const counts: Partial<Record<AnimationFeature, number>> = {};
  for (const slide of deck.slides) {
    const animation = slide.animation;
    if (!animation) continue;
    const used: AnimationFeature[] = [];
    if (animation.enter && animation.enter !== "none") used.push(animation.enter);
    if (animation.steps) used.push("steps");
    if (animation.image && animation.image !== "none") used.push(animation.image);
    for (const feature of used) counts[feature] = (counts[feature] ?? 0) + 1;
  }
  const issues: Issue[] = [];
  for (const [feature, max] of Object.entries(design.animations.budget ?? {}) as [AnimationFeature, number][]) {
    if ((counts[feature] ?? 0) > max) {
      issues.push({ rule: "animation-budget", severity: "P1", message: `"${feature}" allows max ${max} slide(s) per deck; this deck has ${counts[feature]}` });
    }
  }
  return issues;
};

const imageAnimationNeedsImage: Rule = ({ deck }) =>
  deck.slides
    .filter((slide) => slide.animation?.image && slide.animation.image !== "none" && !(slide.images?.length))
    .map((slide) => ({
      rule: "animation-image",
      severity: "P1" as const,
      slide: slide.id,
      message: `animation.image "${slide.animation?.image}" has no image to animate`,
    }));

const shapeAllowed: Rule = ({ deck, design }) =>
  design.shapes.includes(deck.shape)
    ? []
    : [{ rule: "shape-allowed", severity: "P0", message: `shape "${deck.shape}" is not allowed by design "${design.id}"; allowed: ${design.shapes.join(", ")}` }];

export const coreRules: Rule[] = [duplicateIds, slideCount, images, freeBounds, animationBudget, imageAnimationNeedsImage, shapeAllowed];

const SEVERITY_ORDER = { P0: 0, P1: 1, P2: 2 } as const;

/** Core rules plus the design's own `rules`. */
export const lintDeck = (context: LintContext): Issue[] =>
  [...coreRules, ...(context.design.rules ?? [])]
    .flatMap((rule) => rule(context))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

export const hasBlockers = (issues: Issue[]): boolean => issues.some((issue) => issue.severity === "P0");
