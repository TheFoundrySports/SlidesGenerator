import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Lines } from "../../../src/components";
import { Ornament, motifField } from "./shared";

export const reflectionLayout = defineLayout({
  name: "reflection",
  description: "D. Reflection — one meditative sentence (or short passage) with attribution.",
  content: {
    kicker: z.string().optional(),
    title: z.string().optional(),
    text: z.string().describe("The meditative sentence; wrap quotations in «»"),
    attribution: z.string().optional().describe("Mono line under the text, e.g. «— San Agustín»"),
    motif: motifField,
  },
  example: { text: "«Antes de que la luz fuera luz, ya eras Tú.»", attribution: "— Adaptado de San Agustín" },
  component: ({ slide, ctx }) => (
    <div className="reflection-wrap">
      <Ornament name={slide.motif} ctx={ctx} size="sm" />
      {slide.kicker && <p className="kicker">{slide.kicker}</p>}
      {slide.title && <h2 className="title title--medium">{slide.title}</h2>}
      <hr className="rule" />
      <blockquote className={`reflection${slide.text.length > 160 ? " reflection--long" : ""}`}>
        <Lines text={slide.text} />
      </blockquote>
      {slide.attribution && <p className="citation">{slide.attribution}</p>}
    </div>
  ),
});
