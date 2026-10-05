import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Lines } from "../../../src/components";
import { Ornament, motifField } from "./shared";

export const prayerLayout = defineLayout({
  name: "prayer",
  description: "E. Prayer — the full text of a prayer, closed by «Amén.».",
  content: {
    title: z.string().describe("Name of the prayer"),
    text: z.string().describe("Prayer body; \\n for line breaks, blank line for a stanza break"),
    amen: z.boolean().default(true),
    motif: motifField,
  },
  example: { title: "Padre Nuestro", text: "Padre nuestro, que estás en el cielo,\nsantificado sea tu Nombre;" },
  component: ({ slide, ctx }) => (
    <div className="prayer-wrap">
      <Ornament name={slide.motif} ctx={ctx} size="sm" />
      <h2 className="title">{slide.title}</h2>
      <p className="prayer">
        <Lines text={slide.text} />
      </p>
      {slide.amen && <p className="amen">Amén.</p>}
    </div>
  ),
});
