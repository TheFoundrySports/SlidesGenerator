import { relative } from "node:path";
import { ROOT, listDeckSlugs, loadDesigns } from "../src/node/project";

export interface Args {
  positional: string[];
  flags: Record<string, string | true>;
}

/** Tiny argv parser: `--flag`, `--key value`, `--key=value`, everything else positional. */
export const parseArgs = (argv: string[], valueFlags: string[] = []): Args => {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split("=", 2) as [string, string | undefined];
    if (inline !== undefined) flags[key] = inline;
    else if (valueFlags.includes(key)) flags[key] = argv[++i] ?? "";
    else flags[key] = true;
  }
  return { positional, flags };
};

export const fail = (message: string, code = 2): never => {
  console.error(message);
  process.exit(code);
};

/** Slugs from the command line, or every deck with `--all`. */
export const resolveSlugs = (args: Args, usage: string): string[] => {
  if (args.flags.all) return listDeckSlugs();
  if (args.positional.length === 0) fail(usage);
  return args.positional;
};

export const rel = (path: string): string => relative(ROOT, path);
export { loadDesigns };
