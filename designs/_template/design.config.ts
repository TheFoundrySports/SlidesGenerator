import { defineDesign } from "../../src/schema/define-design";
import { templateLayouts } from "./layouts";
import { rules } from "./rules";

/**
 * Design pack skeleton. `npm run new:design -- <id> "<Name>"` copies this folder to
 * designs/<id>/ and replaces __ID__ and __NAME__.
 */
export default defineDesign({
  id: "__ID__",
  name: "__NAME__",
  description: "One sentence: who this design is for and what it feels like.",
  lang: ["en"],
  fonts: {
    display: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400&display=swap",
  },
  tokens: {
    colors: {
      bg: "#FFFFFF",
      surface: "#F3F4F6",
      fg: "#111827",
      muted: "#6B7280",
      border: "#D1D5DB",
      accent: "#2563EB",
    },
  },
  css: ["base.css"],
  variants: { default: "standard", options: ["standard"] },
  palettes: { default: "default", options: { default: {} } },
  shapes: ["landscape-16-9"],
  layouts: {
    // Engine layouts this design allows (see `npm run designs`).
    core: ["text-image", "image-text", "image-overlay", "image-full"],
    custom: templateLayouts,
  },
  animations: { allow: ["fade-lift", "fade", "steps"], default: "fade-lift" },
  rules,
  limits: { maxSlides: 40 },
});
