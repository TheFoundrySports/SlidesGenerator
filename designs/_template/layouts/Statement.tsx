import { z } from "zod";
import { defineLayout } from "../../../src/schema/layout";

export const statementLayout = defineLayout({
  name: "statement",
  description: "One strong statement with an optional source line.",
  content: {
    text: z.string().describe("The statement"),
    source: z.string().optional().describe("Attribution or reference"),
  },
  example: { text: "One idea, said plainly.", source: "Source" },
  component: ({ slide }) => (
    <div className="statement">
      <p className="statement__text">{slide.text}</p>
      {slide.source && <p className="citation">{slide.source}</p>}
    </div>
  ),
});
