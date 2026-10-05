import { allowedHexes } from "../render/css";
import type { Design, Issue } from "../schema/design-types";

const sectionsOf = (html: string): string[] => html.match(/<section\b[^>]*>[\s\S]*?<\/section>/g) ?? [];

/** Checks on the rendered HTML. These catch regressions in layouts and the engine itself. */
export const lintHtml = (html: string, design: Design): Issue[] => {
  const issues: Issue[] = [];
  const sections = sectionsOf(html);
  const maxMotifs = design.limits?.maxMotifsPerSlide ?? 2;
  const hexes = allowedHexes(design);

  if (!/class="counter"/.test(html)) {
    issues.push({ rule: "counter", severity: "P1", message: "no .counter HUD element" });
  }

  sections.forEach((section, i) => {
    const slide = (section.match(/data-slide-id="([^"]*)"/) ?? [])[1] ?? `#${i + 1}`;
    if (!/data-screen-label=/.test(section)) {
      issues.push({ rule: "screen-label", severity: "P1", slide, message: "missing data-screen-label" });
    }
    const svgCount = (section.match(/<svg\b/g) ?? []).length;
    if (svgCount > maxMotifs) {
      issues.push({ rule: "motif-budget", severity: "P0", slide, message: `${svgCount} SVG motifs; max ${maxMotifs}` });
    }
    for (const img of section.match(/<img\b[^>]*>/g) ?? []) {
      if (!/\bloading="lazy"/.test(img)) issues.push({ rule: "image-lazy", severity: "P1", slide, message: '<img> missing loading="lazy"' });
      if (!/\bdecoding="async"/.test(img)) issues.push({ rule: "image-decode", severity: "P1", slide, message: '<img> missing decoding="async"' });
      if (!/\balt="[^"]+"/.test(img)) issues.push({ rule: "image-alt", severity: "P0", slide, message: "<img> without alt text" });
    }
    const stray = [...new Set((section.match(/#[0-9A-Fa-f]{6}\b/g) ?? []).map((h) => h.toUpperCase()))].filter((h) => !hexes.has(h));
    if (stray.length > 0) {
      issues.push({ rule: "palette-tokens", severity: "P0", slide, message: `raw hex outside the design tokens: ${stray.join(" ")}` });
    }
    const hasStepsAttr = /^<section[^>]*\sdata-steps[\s>]/.test(section);
    if (hasStepsAttr && !/\sdata-step=""/.test(section)) {
      issues.push({ rule: "steps-empty", severity: "P1", slide, message: "animation.steps is on but this layout has no steppable items" });
    }
  });

  return issues;
};
