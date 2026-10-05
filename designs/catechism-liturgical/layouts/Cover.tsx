import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Lines } from "../../../src/components";
import { Ornament, motifField } from "./shared";

export const coverLayout = defineLayout({
  name: "cover",
  description: "A. Cover — opens the deck or a chapter: ornament, title, subtitle and an optional invocation.",
  content: {
    eyebrow: z.string().optional().describe("Mono line above (course name)"),
    lead: z.string().optional().describe("Italic line under the eyebrow (audience or series)"),
    title: z.string(),
    subtitle: z.string().optional(),
    reference: z.string().optional().describe("Mono source line, e.g. «CEC 422-682»"),
    invocation: z.string().optional().describe("Italic closing line at the foot, e.g. the Trinitarian formula"),
    motif: motifField,
  },
  example: { eyebrow: "CURSO DE CATEQUESIS", title: "Creo en Dios Padre", subtitle: "Creador del cielo y de la tierra", motif: "cross" },
  component: ({ slide, ctx }) => (
    <div className="cover">
      {slide.eyebrow && <p className="kicker">{slide.eyebrow}</p>}
      {slide.lead && <p className="lead">{slide.lead}</p>}
      <Ornament name={slide.motif} ctx={ctx} />
      <h1 className="title title--hero">{slide.title}</h1>
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
      {slide.reference && <p className="citation">{slide.reference}</p>}
      {slide.invocation && (
        <p className="invocation">
          <Lines text={slide.invocation} />
        </p>
      )}
    </div>
  ),
});
