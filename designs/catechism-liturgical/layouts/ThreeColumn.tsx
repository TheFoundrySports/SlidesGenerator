import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";
import { Paragraphs, stepProps } from "../../../src/components";
import { Backdrop, citationField, titleClass } from "./shared";

const columnSchema = z.object({
  heading: z.string().optional().describe("Short heading for this column"),
  text: z.string().describe("Column body; a blank line starts a new paragraph"),
});

export const threeColumnLayout = defineLayout({
  name: "three-column",
  description:
    "Three equal columns under a title. `animation.steps` reveals each column. An optional image with slot `background` fills the slide behind the type.",
  imageSlots: ["background"],
  content: {
    kicker: z.string().optional().describe("Uppercase mono topic line"),
    title: z.string().describe("Slide title"),
    subtitle: z.string().optional().describe("Italic line under the title"),
    columns: z.tuple([columnSchema, columnSchema, columnSchema]).describe("Exactly three columns, left to right"),
    citation: citationField,
  },
  example: {
    kicker: "EN TRES",
    title: "Fe, esperanza y caridad",
    columns: [
      { heading: "Fe", text: "Creer lo que Dios revela." },
      { heading: "Esperanza", text: "Esperar lo que Dios promete." },
      { heading: "Caridad", text: "Amar como Dios ama." },
    ],
    citation: "CEC 1812-1829",
  },
  component: ({ slide, ctx }) => (
    <>
      <Backdrop images={slide.images} ctx={ctx} />
      <div className="frame">
        {slide.kicker && <p className="kicker">{slide.kicker}</p>}
        <h2 className={titleClass(slide.title)}>{slide.title}</h2>
        {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
        <hr className="rule" />
        <div className="cols cols--3">
          {slide.columns.map((column, index) => (
            <div key={index} className="col" {...stepProps(ctx)}>
              {column.heading && <h3 className="col__heading">{column.heading}</h3>}
              <Paragraphs text={column.text} />
            </div>
          ))}
        </div>
        {slide.citation && <p className="citation">{slide.citation}</p>}
      </div>
    </>
  ),
});
