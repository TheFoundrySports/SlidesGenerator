import { Fragment, type ReactNode } from "react";
import type { ImageRef } from "../schema/core";
import type { RenderContext } from "../schema/layout";

/** `\n` becomes <br/>; an empty line keeps its vertical gap. */
export const Lines = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
};

/** Splits on blank lines and renders one <p> per paragraph. */
export const Paragraphs = ({ text, className }: { text: string; className?: string }) => (
  <>
    {text
      .split(/\n{2,}/)
      .filter((part) => part.trim().length > 0)
      .map((part, i) => (
        <p key={i} className={className}>
          <Lines text={part} />
        </p>
      ))}
  </>
);

/** Spread on any element that should be revealed progressively when the slide enables `steps`. */
export const stepProps = (ctx: RenderContext): { "data-step"?: string } => (ctx.steps ? { "data-step": "" } : {});

export const Motif = ({ name, ctx, className = "ornament" }: { name?: string; ctx: RenderContext; className?: string }) => {
  if (!name) return null;
  const svg = ctx.motif(name);
  if (!svg) return null;
  return <div className={className} aria-hidden="true" data-motif={name} dangerouslySetInnerHTML={{ __html: svg }} />;
};

interface FigureProps {
  image: ImageRef;
  ctx: RenderContext;
  className?: string;
}

/** Image with the engine's lazy-loading defaults, focal point and optional animation preset. */
export const Figure = ({ image, ctx, className = "" }: FigureProps) => {
  const position = image.focal ? `${image.focal.x * 100}% ${image.focal.y * 100}%` : undefined;
  const style: Record<string, string> = {};
  if (image.box) {
    style.left = `${image.box.x}%`;
    style.top = `${image.box.y}%`;
    style.width = `${image.box.w}%`;
    style.height = `${image.box.h}%`;
  }
  return (
    <figure
      className={`figure figure--${image.slot} ${className}`.trim()}
      data-anim={ctx.imageAnim !== "none" ? ctx.imageAnim : undefined}
      style={Object.keys(style).length ? style : undefined}
    >
      <img
        src={ctx.asset(image.src)}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        style={{ objectFit: image.fit, objectPosition: position }}
      />
      {image.caption && <figcaption className="figure__caption">{image.caption}</figcaption>}
    </figure>
  );
};

export const Kicker = ({ children }: { children?: ReactNode }) =>
  children ? <p className="kicker">{children}</p> : null;

export const Citation = ({ children }: { children?: ReactNode }) =>
  children ? <p className="citation">{children}</p> : null;

export const firstImage = (slide: { images?: ImageRef[] }, slot?: string): ImageRef | undefined =>
  slot ? slide.images?.find((img) => img.slot === slot) : slide.images?.[0];
