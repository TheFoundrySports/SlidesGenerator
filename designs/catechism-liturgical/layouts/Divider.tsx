import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Ornament, motifField } from "./shared";

export const dividerLayout = defineLayout({
  name: "divider",
  description: "G. Divider — sub-chapter mark: large ornament, kicker, title and a one-line subtitle.",
  content: {
    kicker: z.string().optional().describe("e.g. «PRIMERA PARTE»"),
    title: z.string(),
    subtitle: z.string().optional(),
    motif: motifField,
  },
  example: { kicker: "PRIMERA PARTE", title: "La Creación", motif: "compass" },
  component: ({ slide, ctx }) => (
    <div className="divider">
      <Ornament name={slide.motif} ctx={ctx} />
      {slide.kicker && <p className="kicker">{slide.kicker}</p>}
      <h2 className="title title--medium">{slide.title}</h2>
      <hr className="rule" />
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
    </div>
  ),
});
