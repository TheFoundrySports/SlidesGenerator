import type { LayoutDef } from "../../../src/schema/layout";
import { statementLayout } from "./Statement";
import { titleLayout } from "./Title";

export const templateLayouts: Record<string, LayoutDef> = Object.fromEntries(
  [titleLayout, statementLayout].map((layout) => [layout.name, layout]),
);
