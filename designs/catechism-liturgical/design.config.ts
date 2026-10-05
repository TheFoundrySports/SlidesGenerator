import { defineDesign } from "../../src/schema/define-design";
import { catechismLayouts } from "./layouts";
import { MOTIFS } from "./motifs";
import { rules } from "./rules";

export default defineDesign({
  id: "catechism-liturgical",
  name: "Catechism Liturgical",
  description: "Parchment, single oxblood ink, serif throughout, sacred geometry. Catechesis, RCIA, retreats.",
  lang: ["es"],
  fonts: {
    display: "Cormorant Garamond",
    body: "EB Garamond",
    mono: "JetBrains Mono",
    href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap",
    stacks: {
      display: '"Cormorant Garamond", "EB Garamond", "Iowan Old Style", "Charter", Georgia, serif',
      body: '"EB Garamond", "Lora", "Iowan Old Style", "Charter", Georgia, serif',
      mono: '"JetBrains Mono", ui-monospace, "IBM Plex Mono", Menlo, monospace',
    },
  },
  tokens: {
    colors: {
      bg: "#F5EBD9", // parchment
      surface: "#EFE3CC", // callout well
      fg: "#5C1A1B", // oxblood ink — every text element
      muted: "#8A7560", // captions, counter, refs
      border: "#B5A285", // hairline rules
      accent: "#73201D", // reserved single accent
      gold: "#A8915C", // ornament strokes only
    },
  },
  css: ["tokens.css", "base.css"],
  variants: { default: "monastic", options: ["monastic", "festive", "typographic"] },
  palettes: {
    default: "ordinary",
    options: {
      ordinary: {},
      "advent-lent": { fg: "#4A1E5C", gold: "#7A6A8A" },
      "christmas-easter": { fg: "#7A5A1F", gold: "#B8923A" },
      pentecost: { fg: "#6E1A1A", gold: "#8A6A4A" },
      marian: { fg: "#1F3F6E", gold: "#A8915C" },
    },
  },
  shapes: ["landscape-16-9", "portrait-3-4", "square-1-1", "ultrawide-21-9"],
  layouts: {
    core: ["text-image", "image-text", "image-overlay", "image-full", "free"],
    custom: catechismLayouts,
  },
  animations: {
    allow: ["fade-lift", "fade", "steps", "slow-zoom"],
    default: "fade-lift",
    budget: { "slow-zoom": 3 },
  },
  rules,
  motifs: MOTIFS,
  limits: { maxSlides: 40, maxMotifsPerSlide: 2 },
});
