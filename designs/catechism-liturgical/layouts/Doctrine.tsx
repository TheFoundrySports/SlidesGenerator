import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Figure, Lines, Paragraphs } from "../../../src/components";
import { ColumnSchema, Frame, Ornament, PointSchema, Points, QuoteSchema, citationField, imageFrameField, motifField, titleClass } from "./shared";

export const doctrineLayout = defineLayout({
  name: "doctrine",
  description:
    "C. Doctrine — a doctrinal topic: title, optional quote, then numbered points OR 2-3 headed columns (and an optional closing statement). Optional framed image (right | left | top).",
  imageSlots: ["right", "left", "top", "inset"],
  content: {
    kicker: z.string().optional().describe("Uppercase mono topic line"),
    title: z.string(),
    subtitle: z.string().optional(),
    lead: z.string().optional().describe("Short explanatory paragraph under the title"),
    quote: QuoteSchema.optional(),
    points: z.array(PointSchema).min(1).max(8).optional().describe("Up to 5 recommended (P1 above)"),
    numbering: z.enum(["roman", "arabic"]).default("roman"),
    columns: z.array(ColumnSchema).min(2).max(3).optional(),
    closing: z.string().optional().describe("Italic closing statement under the points/columns"),
    citation: citationField,
    motif: motifField,
    imageFrame: imageFrameField,
  },
  example: {
    kicker: "DIOS PADRE",
    title: "Dios Padre, Creador",
    points: [{ text: "Creemos en un solo Dios." }, { text: "Este Dios crea todas las cosas por su Verbo." }],
    citation: "CEC 279",
  },
  component: ({ slide, ctx }) => (
    <Frame images={slide.images} imageFrame={slide.imageFrame} ctx={ctx}>
      <Ornament name={slide.motif} ctx={ctx} size="sm" />
      {slide.kicker && <p className="kicker">{slide.kicker}</p>}
      <h2 className={titleClass(slide.title)}>{slide.title}</h2>
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
      <hr className="rule" />
      {slide.lead && (
        <div className="lead-text">
          <Paragraphs text={slide.lead} />
        </div>
      )}
      {slide.quote && (
        <blockquote className="quote-block">
          <p className="quote-block__text">
            <Lines text={slide.quote.text} />
          </p>
          {slide.quote.source && <p className="citation">{slide.quote.source}</p>}
        </blockquote>
      )}
      {slide.images?.[0]?.slot === "inset" && (
        <Figure image={slide.images[0]} ctx={ctx} className={slide.imageFrame === "bare" ? "plate plate--bare" : "plate"} />
      )}
      {slide.points && <Points points={slide.points} numbering={slide.numbering} ctx={ctx} />}
      {slide.columns && (
        <div className={`cols cols--${slide.columns.length}`}>
          {slide.columns.map((column, i) => (
            <div key={i} className="col">
              {column.heading && <h3 className="col__heading">{column.heading}</h3>}
              <Paragraphs text={column.text} />
            </div>
          ))}
        </div>
      )}
      {slide.closing && <p className="closing-statement">{slide.closing}</p>}
      {slide.citation && <p className="citation">{slide.citation}</p>}
    </Frame>
  ),
});
