import { z } from "zod";
import type { ReactNode } from "react";
import type { ImageRef } from "../../../src/schema/core";
import type { RenderContext } from "../../../src/schema/layout";
import { Figure, Motif, stepProps } from "../../../src/components";
import { MOTIF_NAMES } from "../motifs";

export const motifField = z.enum(MOTIF_NAMES).optional().describe("Optional ornament drawn from the design's motif library");
export const imageFrameField = z
  .enum(["framed", "bare"])
  .default("framed")
  .describe("`framed` (default): image sits in a bordered plate. `bare`: no border or fill, for transparent PNG diagrams that should sit on the slide background");
export const citationField = z
  .string()
  .optional()
  .describe("Footer reference line in mono, e.g. «CEC 422-424 · YOUCAT 72»");

/** A numbered/term entry shared by doctrine and summary slides. */
export const PointSchema = z.object({
  term: z.string().optional().describe("Bold lead-in label (e.g. «Sacerdote»). If any point has a term, the list renders as terms."),
  text: z.string(),
});
export type Point = z.infer<typeof PointSchema>;

export const ColumnSchema = z.object({ heading: z.string().optional(), text: z.string() });

export const QuoteSchema = z.object({
  text: z.string(),
  source: z.string().optional().describe("Mono attribution line under the quote, e.g. «Ga 4, 4-5»"),
});

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** Long titles drop one size step so they stay on at most two lines. */
export const titleClass = (title: string): string => (title.length > 34 ? "title title--long" : "title");

export const Points = ({ points, numbering, ctx }: { points: Point[]; numbering: "roman" | "arabic"; ctx: RenderContext }) => {
  const asTerms = points.some((point) => point.term);
  return (
    <ol className={`points points--${asTerms ? "term" : numbering}`}>
      {points.map((point, i) => (
        <li key={i} {...stepProps(ctx)}>
          <span className="points__marker">
            {point.term ?? (numbering === "roman" ? `${ROMAN[i]}.` : `${i + 1}.`)}
          </span>
          <span className="points__text">{point.text}</span>
        </li>
      ))}
    </ol>
  );
};

/**
 * Lays a slide out either as a single centered column or, when it has an image, as a
 * text panel plus a framed plate (slots: right | left | top).
 */
export const Frame = ({
  images,
  ctx,
  imageFrame = "framed",
  children,
}: {
  images?: ImageRef[];
  ctx: RenderContext;
  imageFrame?: "framed" | "bare";
  children: ReactNode;
}) => {
  const image = images?.[0];
  if (!image || image.slot === "inset") return <div className="frame">{children}</div>;
  const text = <div className="frame frame--panel">{children}</div>;
  const plate = <Figure image={image} ctx={ctx} className={imageFrame === "bare" ? "plate plate--bare" : "plate"} />;
  return (
    <div className={`split split--${image.slot}`}>
      {image.slot === "right" ? (
        <>
          {text}
          {plate}
        </>
      ) : (
        <>
          {plate}
          {text}
        </>
      )}
    </div>
  );
};

export const Ornament = ({ name, ctx, size = "lg" }: { name?: string; ctx: RenderContext; size?: "lg" | "sm" }) => (
  <Motif name={name} ctx={ctx} className={`ornament ornament--${size}`} />
);
