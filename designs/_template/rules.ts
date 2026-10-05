import type { Rule } from "../../src/schema/design-types";

/**
 * Design-specific lint on the deck JSON. Return Issues with severity P0 (blocks the build),
 * P1 (warning) or P2 (info). Core rules (ids, budgets, assets) run regardless.
 */
export const rules: Rule[] = [];
