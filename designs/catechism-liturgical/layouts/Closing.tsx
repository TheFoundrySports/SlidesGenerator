import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Lines } from "../../../src/components";
import { Ornament, motifField } from "./shared";

export const closingLayout = defineLayout({
  name: "closing",
  description: "H. Closing — blessing or final passage, ending with «Amén.».",
  content: {
    kicker: z.string().optional(),
    text: z.string().describe("Blessing / exhortation; \\n for line breaks"),
    reference: z.string().optional().describe("Mono source line, e.g. «1 Juan 1, 3»"),
    amen: z.boolean().default(true),
    motif: motifField,
  },
  example: { text: "«El Señor os bendiga y os guarde;\nhaga resplandecer su rostro sobre vosotros\ny os conceda su paz.»", motif: "cross" },
  component: ({ slide, ctx }) => (
    <div className="closing">
      <Ornament name={slide.motif} ctx={ctx} />
      {slide.kicker && <p className="kicker">{slide.kicker}</p>}
      <p className="blessing">
        <Lines text={slide.text} />
      </p>
      {slide.reference && <p className="citation">{slide.reference}</p>}
      {slide.amen && <p className="amen">Amén.</p>}
    </div>
  ),
});
