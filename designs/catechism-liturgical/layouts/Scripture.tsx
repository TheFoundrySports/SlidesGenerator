import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Lines } from "../../../src/components";
import { Frame, Ornament, citationField, motifField } from "./shared";

export const scriptureLayout = defineLayout({
  name: "scripture",
  description: "B. Scripture — one biblical passage is the slide; optional framed image (right | left | top).",
  imageSlots: ["right", "left", "top"],
  content: {
    reference: z.string().describe("Spanish citation, «Libro cap, vv» (e.g. «Mateo 16, 16»)"),
    text: z.string().describe("The passage wrapped in «» quotes; \\n for verse breaks"),
    commentary: z.string().optional().describe("One italic sentence of context"),
    citation: citationField,
    motif: motifField,
  },
  example: { reference: "Génesis 1, 1", text: "«En el principio creó Dios el cielo y la tierra.»", citation: "Gn 1, 1 · CEC 279" },
  component: ({ slide, ctx }) => (
    <Frame images={slide.images} ctx={ctx}>
      <p className="reference">{slide.reference}</p>
      <Ornament name={slide.motif} ctx={ctx} size="sm" />
      <blockquote className={`scripture${slide.text.length > 150 ? " scripture--long" : ""}`}>
        <Lines text={slide.text} />
      </blockquote>
      {slide.commentary && <p className="commentary">{slide.commentary}</p>}
      {slide.citation && <p className="citation">{slide.citation}</p>}
    </Frame>
  ),
});
