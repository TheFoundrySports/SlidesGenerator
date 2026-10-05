import type { Design } from "../schema/design-types";

export type DesignRegistry = Map<string, Design>;

interface DesignModule {
  default: Design;
}

/**
 * Builds a registry from `design.config.ts` modules keyed by path
 * (`/designs/<id>/design.config.ts`). Used by Node (dynamic import) and Vite (`import.meta.glob`).
 */
export const registryFromModules = (modules: Record<string, DesignModule>): DesignRegistry => {
  const registry: DesignRegistry = new Map();
  for (const [path, mod] of Object.entries(modules)) {
    const match = path.match(/designs\/([^/]+)\/design\.config\.ts$/);
    if (!match) continue;
    const folder = match[1] as string;
    if (folder.startsWith("_")) continue; // templates are not real designs
    const design = mod.default;
    if (design.id !== folder) {
      throw new Error(`designs/${folder}/design.config.ts declares id "${design.id}"; the folder name must match`);
    }
    registry.set(design.id, { ...design, dir: `designs/${folder}` });
  }
  return registry;
};

export const getDesign = (registry: DesignRegistry, id: string): Design => {
  const design = registry.get(id);
  if (!design) {
    const known = [...registry.keys()].join(", ") || "(none)";
    throw new Error(`Unknown design "${id}". Available: ${known}`);
  }
  return design;
};
