import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Ornament, PointSchema, Points, citationField, motifField, titleClass } from "./shared";

export const summaryLayout = defineLayout({
  name: "summary",
  description: "F. Summary — 3-6 takeaways, numbered or labelled with a term. `animation.steps` reveals them one by one.",
  content: {
    kicker: z.string().optional().describe("Usually «EN RESUMEN»"),
    title: z.string(),
    items: z.array(PointSchema).min(2).max(6),
    numbering: z.enum(["arabic", "roman"]).default("arabic"),
    citation: citationField,
    motif: motifField,
  },
  example: { kicker: "EN RESUMEN", title: "En resumen", items: [{ text: "Dios es Padre." }, { text: "Crea por amor." }, { text: "Sostiene lo creado." }] },
  component: ({ slide, ctx }) => (
    <div className="frame">
      <Ornament name={slide.motif} ctx={ctx} size="sm" />
      {slide.kicker && <p className="kicker">{slide.kicker}</p>}
      <h2 className={titleClass(slide.title)}>{slide.title}</h2>
      <hr className="rule" />
      <Points points={slide.items} numbering={slide.numbering} ctx={ctx} />
      {slide.citation && <p className="citation">{slide.citation}</p>}
    </div>
  ),
});
