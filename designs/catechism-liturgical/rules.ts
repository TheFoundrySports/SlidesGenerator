import { EMOJI_RE, slideText, withoutQuotations } from "../../src/lint/util";
import type { Issue, Rule } from "../../src/schema/design-types";

/** Which variants each layout may use (DESIGN.md §6, «Valid combinations»). */
export const VALID_COMBINATIONS: Record<string, string[]> = {
  cover: ["monastic", "festive"],
  scripture: ["monastic", "typographic"],
  doctrine: ["monastic"],
  reflection: ["monastic", "typographic"],
  prayer: ["monastic", "festive"],
  summary: ["monastic"],
  divider: ["monastic", "festive"],
  closing: ["monastic", "festive"],
  triptych: ["monastic"],
};

export const VARIANT_BUDGETS: Record<string, number> = { festive: 2, typographic: 1 };
const ALLOWED_EMOJI = new Set(["✝"]);

const effectiveVariant: (deckVariant: string | undefined, fallback: string, slideVariant: string | undefined) => string = (
  deckVariant,
  fallback,
  slideVariant,
) => slideVariant ?? deckVariant ?? fallback;

const variantCombination: Rule = ({ deck, design }) => {
  const issues: Issue[] = [];
  for (const slide of deck.slides) {
    const allowed = VALID_COMBINATIONS[slide.layout];
    if (!allowed) continue;
    const variant = effectiveVariant(deck.variant, design.variants.default, slide.variant);
    if (!allowed.includes(variant)) {
      issues.push({
        rule: "variant-combination",
        severity: "P1",
        slide: slide.id,
        message: `${slide.layout} does not pair with variant "${variant}"; valid: ${allowed.join(", ")}`,
      });
    }
  }
  return issues;
};

const variantBudget: Rule = ({ deck, design }) => {
  const counts: Record<string, number> = {};
  for (const slide of deck.slides) {
    const variant = effectiveVariant(deck.variant, design.variants.default, slide.variant);
    counts[variant] = (counts[variant] ?? 0) + 1;
  }
  return Object.entries(VARIANT_BUDGETS)
    .filter(([variant, max]) => (counts[variant] ?? 0) > max)
    .map(([variant, max]) => ({
      rule: "variant-budget",
      severity: "P1" as const,
      message: `variant "${variant}" allows max ${max} slide(s) per deck; this deck has ${counts[variant]}`,
    }));
};

const rhythm: Rule = ({ deck }) => {
  const issues: Issue[] = [];
  for (let i = 2; i < deck.slides.length; i++) {
    const [a, b, c] = [deck.slides[i - 2], deck.slides[i - 1], deck.slides[i]];
    if (a && b && c && a.layout === b.layout && b.layout === c.layout) {
      issues.push({
        rule: "rhythm",
        severity: "P1",
        slide: c.id,
        message: `three "${c.layout}" slides in a row (${a.id}, ${b.id}, ${c.id}); alternate archetypes`,
      });
    }
  }
  return issues;
};

const voice: Rule = ({ deck }) => {
  const issues: Issue[] = [];
  const placeholder = /lorem ipsum|feature (one|two|three)|description (one|two|three)/i;
  for (const slide of deck.slides) {
    const text = slideText(slide);
    if (placeholder.test(text)) {
      issues.push({ rule: "placeholder-text", severity: "P0", slide: slide.id, message: "generic placeholder text (Lorem ipsum / Feature One…) is forbidden" });
    }
    if (/[¡!]/.test(withoutQuotations(text))) {
      issues.push({ rule: "exclamation", severity: "P1", slide: slide.id, message: "declarative voice: avoid exclamations outside «quotations»" });
    }
    if (/\bCCC\b/.test(text)) {
      issues.push({ rule: "cec-format", severity: "P1", slide: slide.id, message: 'cite the Catechism as "CEC N" (Spanish), not "CCC"' });
    }
  }
  return issues;
};

const emoji: Rule = ({ deck }) => {
  const issues: Issue[] = [];
  let crossCount = 0;
  for (const slide of deck.slides) {
    const text = slideText(slide);
    const found = text.match(EMOJI_RE) ?? [];
    const offenders = [...new Set(found.filter((e) => !ALLOWED_EMOJI.has(e)))];
    if (offenders.length > 0) {
      issues.push({ rule: "emoji", severity: "P0", slide: slide.id, message: `emoji found: ${offenders.join(" ")}; only ✝ is permitted` });
    }
    crossCount += found.filter((e) => e === "✝").length;
  }
  if (crossCount > 1) {
    issues.push({ rule: "cross-once", severity: "P1", message: `✝ appears ${crossCount} times; at most once per deck` });
  }
  return issues;
};

const structure: Rule = ({ deck }) => {
  const issues: Issue[] = [];
  for (const slide of deck.slides) {
    const points = (slide.points ?? slide.items) as unknown[] | undefined;
    if (slide.layout === "doctrine" && Array.isArray(points) && points.length > 5) {
      issues.push({ rule: "points-max", severity: "P1", slide: slide.id, message: `${points.length} points; split into a doctrine + summary pair (max 5)` });
    }
    if (slide.layout === "doctrine" && slide.points && slide.columns) {
      issues.push({ rule: "doctrine-density", severity: "P1", slide: slide.id, message: "points and columns together are dense; pick one" });
    }
    if (Array.isArray(slide.images) && slide.images.length > 1) {
      issues.push({ rule: "image-count", severity: "P1", slide: slide.id, message: "one framed image per slide" });
    }
    for (const image of (slide.images ?? []) as { src: string; credit?: string }[]) {
      if (!image.credit) {
        issues.push({ rule: "image-credit", severity: "P2", slide: slide.id, message: `image ${image.src} has no credit (artist/source)` });
      }
    }
  }
  return issues;
};

export const rules: Rule[] = [variantCombination, variantBudget, rhythm, voice, emoji, structure];
