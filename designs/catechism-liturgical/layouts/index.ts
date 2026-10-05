import type { LayoutDef } from "../../../src/schema/layout";
import { closingLayout } from "./Closing";
import { coverLayout } from "./Cover";
import { dividerLayout } from "./Divider";
import { doctrineLayout } from "./Doctrine";
import { prayerLayout } from "./Prayer";
import { reflectionLayout } from "./Reflection";
import { scriptureLayout } from "./Scripture";
import { summaryLayout } from "./Summary";

export const catechismLayouts: Record<string, LayoutDef> = Object.fromEntries(
  [coverLayout, scriptureLayout, doctrineLayout, reflectionLayout, prayerLayout, summaryLayout, dividerLayout, closingLayout].map(
    (layout) => [layout.name, layout],
  ),
);
