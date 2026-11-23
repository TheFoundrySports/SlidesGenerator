import type { LayoutDef } from "../../../src/schema/layout";
import { closingLayout } from "./Closing";
import { coverLayout } from "./Cover";
import { dividerLayout } from "./Divider";
import { doctrineLayout } from "./Doctrine";
import { prayerLayout } from "./Prayer";
import { reflectionLayout } from "./Reflection";
import { scriptureLayout } from "./Scripture";
import { summaryLayout } from "./Summary";
import { threeColumnLayout } from "./ThreeColumn";
import { triptychLayout } from "./Triptych";

export const catechismLayouts: Record<string, LayoutDef> = Object.fromEntries(
  [
    coverLayout,
    scriptureLayout,
    doctrineLayout,
    threeColumnLayout,
    reflectionLayout,
    prayerLayout,
    summaryLayout,
    dividerLayout,
    closingLayout,
    triptychLayout,
  ].map((layout) => [layout.name, layout]),
);
