import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Figure, Lines, Paragraphs } from "../../../src/components";
import { Ornament, citationField, imageFrameField, motifField, titleClass } from "./shared";

export const triptychLayout = defineLayout({
  name: "triptych",
  description:
    "D. Triptych — a centred header row (kicker, title, subtitle) above three zones in one row: teaching text on the left, one image in the centre, an aside (heading, italic statement, source) on the right. Needs one image (slot right).",
  imageSlots: ["right"],
  content: {
    kicker: z.string().optional().describe("Uppercase mono topic line"),
    title: z.string(),
    subtitle: z.string().optional(),
    lead: z.string().optional().describe("Short explanatory paragraph under the title; blank line for a new paragraph"),
    leadHeading: z.string().optional().describe("Heading above the lead paragraph in the left zone (e.g. «Es Misterio»)"),
    aside: z.string().describe("Italic statement shown to the right of the image"),
    asideHeading: z.string().optional().describe("Heading above the aside statement (e.g. «Verdad y Amor»)"),
    asideSource: z.string().optional().describe("Mono attribution line under the aside, e.g. «CEC 214»"),
    citation: citationField,
    motif: motifField,
    imageFrame: imageFrameField,
  },
  example: {
    kicker: "DIOS, «EL QUE ES»",
    title: "Yo soy el que soy",
    leadHeading: "Es Misterio",
    lead: "«El que es», sin origen y sin fin.",
    aside: "«Dios, \"El que es\", se reveló a Israel como el que es \"rico en amor y fidelidad\".»",
    asideHeading: "Verdad y Amor",
    asideSource: "CEC 214",
    citation: "Ex 3, 14 · CEC 206",
    images: [{ src: "assets/plate.svg", alt: "Abstract circular plate with a cross", slot: "right", fit: "contain" }],
  },
  component: ({ slide, ctx }) => {
    const image = slide.images?.[0];
    return (
      <div className="split split--trio">
        <header className="trio-head">
          <Ornament name={slide.motif} ctx={ctx} size="sm" />
          {slide.kicker && <p className="kicker">{slide.kicker}</p>}
          <h2 className={titleClass(slide.title)}>{slide.title}</h2>
          {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
          <hr className="rule" />
        </header>
        <div className="frame frame--panel">
          {slide.leadHeading && <h3 className="col__heading">{slide.leadHeading}</h3>}
          {slide.lead && (
            <div className="lead-text">
              <Paragraphs text={slide.lead} />
            </div>
          )}
          {slide.citation && <p className="citation">{slide.citation}</p>}
        </div>
        {image && <Figure image={image} ctx={ctx} className={slide.imageFrame === "bare" ? "plate plate--bare" : "plate"} />}
        <div className="frame frame--panel frame--aside">
          {slide.asideHeading && <h3 className="col__heading">{slide.asideHeading}</h3>}
          <p className="closing-statement">
            <Lines text={slide.aside} />
          </p>
          {slide.asideSource && <p className="citation">{slide.asideSource}</p>}
        </div>
      </div>
    );
  },
});
