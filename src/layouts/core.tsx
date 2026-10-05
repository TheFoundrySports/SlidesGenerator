import { z } from "zod";
import { BoxSchema, ImageRefSchema } from "../schema/core";
import { defineLayout } from "../schema/layout";
import { Citation, Figure, Kicker, Lines, Paragraphs, firstImage, stepProps } from "../components";

const kicker = z.string().optional().describe("Small uppercase line above the title");
const citation = z.string().optional().describe("Source line, e.g. a reference");

export const titleLayout = defineLayout({
  name: "title",
  description: "Centered title with optional subtitle. Opens a deck or marks a single idea.",
  content: { kicker, title: z.string(), subtitle: z.string().optional(), citation },
  example: { title: "Title", subtitle: "Subtitle" },
  component: ({ slide }) => (
    <div className="stack stack--center">
      <Kicker>{slide.kicker}</Kicker>
      <h1 className="title">{slide.title}</h1>
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
      <Citation>{slide.citation}</Citation>
    </div>
  ),
});

export const titleBodyLayout = defineLayout({
  name: "title-body",
  description: "Title and free paragraphs (blank line = new paragraph).",
  content: { kicker, title: z.string(), body: z.string(), citation },
  example: { title: "Title", body: "First paragraph.\n\nSecond paragraph." },
  component: ({ slide }) => (
    <div className="stack">
      <Kicker>{slide.kicker}</Kicker>
      <h2 className="title">{slide.title}</h2>
      <div className="body">
        <Paragraphs text={slide.body} />
      </div>
      <Citation>{slide.citation}</Citation>
    </div>
  ),
});

export const bulletsLayout = defineLayout({
  name: "bullets",
  description: "Title with 1-7 short items; `animation.steps` reveals them one by one.",
  content: {
    kicker,
    title: z.string(),
    items: z.array(z.string()).min(1).max(7),
    ordered: z.boolean().default(false),
    citation,
  },
  example: { title: "Title", items: ["One", "Two", "Three"] },
  component: ({ slide, ctx }) => {
    const Tag = slide.ordered ? "ol" : "ul";
    return (
      <div className="stack">
        <Kicker>{slide.kicker}</Kicker>
        <h2 className="title">{slide.title}</h2>
        <Tag className="items">
          {slide.items.map((item, i) => (
            <li key={i} {...stepProps(ctx)}>
              {item}
            </li>
          ))}
        </Tag>
        <Citation>{slide.citation}</Citation>
      </div>
    );
  },
});

export const quoteLayout = defineLayout({
  name: "quote",
  description: "One quotation with attribution.",
  content: { text: z.string(), attribution: z.string().optional(), citation },
  example: { text: "A single memorable sentence.", attribution: "Author" },
  component: ({ slide }) => (
    <div className="stack stack--center">
      <blockquote className="quote">
        <Lines text={slide.text} />
      </blockquote>
      {slide.attribution && <p className="attribution">{slide.attribution}</p>}
      <Citation>{slide.citation}</Citation>
    </div>
  ),
});

const column = z.object({ heading: z.string().optional(), text: z.string() });

export const twoColumnLayout = defineLayout({
  name: "two-column",
  description: "Title and exactly two columns, each with an optional heading.",
  content: {
    kicker,
    title: z.string(),
    columns: z.tuple([column, column]),
    citation,
  },
  example: { title: "Title", columns: [{ heading: "Left", text: "Text" }, { heading: "Right", text: "Text" }] },
  component: ({ slide, ctx }) => (
    <div className="stack">
      <Kicker>{slide.kicker}</Kicker>
      <h2 className="title">{slide.title}</h2>
      <div className="cols cols--2">
        {slide.columns.map((col, i) => (
          <div key={i} className="col" {...stepProps(ctx)}>
            {col.heading && <h3 className="col__heading">{col.heading}</h3>}
            <Paragraphs text={col.text} />
          </div>
        ))}
      </div>
      <Citation>{slide.citation}</Citation>
    </div>
  ),
});

export const sectionLayout = defineLayout({
  name: "section",
  description: "Section divider: kicker, title and optional subtitle.",
  content: { kicker, title: z.string(), subtitle: z.string().optional() },
  example: { kicker: "Part one", title: "Section title" },
  component: ({ slide }) => (
    <div className="stack stack--center">
      <Kicker>{slide.kicker}</Kicker>
      <h2 className="title">{slide.title}</h2>
      {slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}
    </div>
  ),
});

const splitContent = {
  kicker,
  title: z.string().optional(),
  body: z.string(),
  citation,
};

export const textImageLayout = defineLayout({
  name: "text-image",
  description: "Text on the left, one image on the right (slot `right`).",
  imageSlots: ["right"],
  content: { ...splitContent, images: z.array(ImageRefSchema).length(1) },
  example: { title: "Title", body: "Body", images: [{ src: "assets/x.jpg", alt: "alt", slot: "right" }] },
  component: ({ slide, ctx }) => {
    const image = firstImage(slide, "right");
    return (
      <div className="split split--right">
        <div className="split__text stack">
          <Kicker>{slide.kicker}</Kicker>
          {slide.title && <h2 className="title">{slide.title}</h2>}
          <div className="body">
            <Paragraphs text={slide.body} />
          </div>
          <Citation>{slide.citation}</Citation>
        </div>
        {image && <Figure image={image} ctx={ctx} />}
      </div>
    );
  },
});

export const imageTextLayout = defineLayout({
  name: "image-text",
  description: "One image on the left (slot `left`), text on the right.",
  imageSlots: ["left"],
  content: { ...splitContent, images: z.array(ImageRefSchema).length(1) },
  example: { title: "Title", body: "Body", images: [{ src: "assets/x.jpg", alt: "alt", slot: "left" }] },
  component: ({ slide, ctx }) => {
    const image = firstImage(slide, "left");
    return (
      <div className="split split--left">
        {image && <Figure image={image} ctx={ctx} />}
        <div className="split__text stack">
          <Kicker>{slide.kicker}</Kicker>
          {slide.title && <h2 className="title">{slide.title}</h2>}
          <div className="body">
            <Paragraphs text={slide.body} />
          </div>
          <Citation>{slide.citation}</Citation>
        </div>
      </div>
    );
  },
});

export const imageOverlayLayout = defineLayout({
  name: "image-overlay",
  description: "Full-bleed background image (slot `background`) with a translucent text panel on top.",
  imageSlots: ["background"],
  content: { kicker, title: z.string(), body: z.string().optional(), citation, images: z.array(ImageRefSchema).length(1) },
  example: { title: "Title", images: [{ src: "assets/x.jpg", alt: "alt", slot: "background" }] },
  component: ({ slide, ctx }) => {
    const image = firstImage(slide, "background");
    return (
      <>
        {image && <Figure image={image} ctx={ctx} />}
        <div className="overlay-panel stack">
          <Kicker>{slide.kicker}</Kicker>
          <h2 className="title">{slide.title}</h2>
          {slide.body && (
            <div className="body">
              <Paragraphs text={slide.body} />
            </div>
          )}
          <Citation>{slide.citation}</Citation>
        </div>
      </>
    );
  },
});

export const imageFullLayout = defineLayout({
  name: "image-full",
  description: "A single image filling the slide (slot `full`) with an optional caption.",
  imageSlots: ["full"],
  content: { caption: z.string().optional(), citation, images: z.array(ImageRefSchema).length(1) },
  example: { images: [{ src: "assets/x.jpg", alt: "alt", slot: "full" }] },
  component: ({ slide, ctx }) => {
    const image = firstImage(slide, "full");
    return (
      <>
        {image && <Figure image={image} ctx={ctx} />}
        {(slide.caption || slide.citation) && (
          <div className="image-caption">
            {slide.caption && <p className="subtitle">{slide.caption}</p>}
            <Citation>{slide.citation}</Citation>
          </div>
        )}
      </>
    );
  },
});

const freeText = z.object({
  kind: z.literal("text"),
  text: z.string(),
  box: BoxSchema,
  size: z.number().min(10).max(240).default(28).describe("Font size in canvas pixels"),
  weight: z.number().min(300).max(900).optional(),
  italic: z.boolean().default(false),
  align: z.enum(["left", "center", "right"]).default("left"),
  family: z.enum(["display", "body", "mono"]).default("body"),
  color: z.enum(["fg", "muted", "accent"]).default("fg"),
});

export const freeLayout = defineLayout({
  name: "free",
  description: "Absolute positioning in percent of the canvas. Use only to reproduce an existing slide; images use `box`.",
  imageSlots: ["background", "inset", "full", "left", "right", "top"],
  content: { blocks: z.array(freeText).default([]) },
  example: { blocks: [{ kind: "text", text: "Free text", box: { x: 10, y: 10, w: 80, h: 20 } }] },
  component: ({ slide, ctx }) => (
    <>
      {slide.images?.map((image, i) => (
        <Figure key={i} image={image} ctx={ctx} className="figure--free" />
      ))}
      {slide.blocks.map((block, i) => (
        <div
          key={i}
          className={`free-block free-block--${block.family} free-block--${block.color}`}
          style={{
            left: `${block.box.x}%`,
            top: `${block.box.y}%`,
            width: `${block.box.w}%`,
            height: `${block.box.h}%`,
            fontSize: `${block.size}px`,
            fontWeight: block.weight,
            fontStyle: block.italic ? "italic" : "normal",
            textAlign: block.align,
          }}
        >
          <Lines text={block.text} />
        </div>
      ))}
    </>
  ),
});
