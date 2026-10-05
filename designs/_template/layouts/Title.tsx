import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";

export const titleLayout = defineLayout({
  name: "title",
  description: "Opening slide: a title, an optional subtitle and an eyebrow line.",
  content: {
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
  },
  example: { eyebrow: "EYEBROW", title: "A title", subtitle: "A subtitle" },
  component: ({ slide }) => (
    <div className="stack stack--center">
      {slide.eyebrow && <p className="kicker">{slide.eyebrow}</p>}
      <h1 className="title title--hero">{slide.title}</h1>
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
    </div>
  ),
});
