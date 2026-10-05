/** Speaker notes live in `brief.md` under `## Notas` (or `## Notes`), one `### <slide-id>` block per slide. */
export interface ParsedNotes {
  /** Notes aligned with the deck's slide order ("" when a slide has none). */
  notes: string[];
  /** `###` headings that do not match any slide id. */
  unknown: string[];
}

const NOTES_HEADING_LINE = /^##\s+(notas|notes)\s*$/i;
const SECTION_LINE = /^##\s/;
const SLIDE_HEADING_LINE = /^###\s+(.+?)\s*$/;
/** A note line that would be read as a section / slide heading gets one extra leading backslash. */
const NEEDS_ESCAPE = /^\\*#{2,3}\s/;
const ESCAPED = /^\\+#{2,3}\s/;

export const escapeNoteLine = (line: string): string => (NEEDS_ESCAPE.test(line) ? `\\${line}` : line);
export const unescapeNoteLine = (line: string): string => (ESCAPED.test(line) ? line.slice(1) : line);

interface NotesBlock {
  id: string;
  /** Raw lines as written in the file (still escaped). */
  lines: string[];
}

interface NotesSection {
  /** Everything before the `## Notas` heading line. */
  before: string[];
  heading: string;
  /** Lines between the heading and the first `###` block. */
  preamble: string[];
  blocks: NotesBlock[];
  /** From the next `##` section to the end of the file. */
  after: string[];
}

const locateNotesSection = (markdown: string): NotesSection | null => {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => NOTES_HEADING_LINE.test(line));
  if (start < 0) return null;

  const nextSection = lines.findIndex((line, i) => i > start && SECTION_LINE.test(line));
  const end = nextSection < 0 ? lines.length : nextSection;

  const preamble: string[] = [];
  const blocks: NotesBlock[] = [];
  for (const line of lines.slice(start + 1, end)) {
    const heading = line.match(SLIDE_HEADING_LINE);
    if (heading) {
      blocks.push({ id: heading[1] as string, lines: [] });
      continue;
    }
    const block = blocks[blocks.length - 1];
    if (block) block.lines.push(line);
    else preamble.push(line);
  }
  return { before: lines.slice(0, start), heading: lines[start] as string, preamble, blocks, after: lines.slice(end) };
};

const blockText = (lines: string[]): string => lines.map(unescapeNoteLine).join("\n").trim();

export const parseBriefNotes = (markdown: string, slideIds: string[]): ParsedNotes => {
  const bySlide = new Map<string, string>();
  const unknown: string[] = [];

  for (const block of locateNotesSection(markdown)?.blocks ?? []) {
    if (slideIds.includes(block.id)) bySlide.set(block.id, blockText(block.lines));
    else unknown.push(block.id);
  }
  return { notes: slideIds.map((id) => bySlide.get(id) ?? ""), unknown };
};

const normalizeNote = (text: string): string => text.replace(/\r\n?/g, "\n").trim();

/** `### <id>` blocks (separated by blank lines) for every slide that has a note. */
const noteBlockLines = (slideIds: string[], notes: string[]): string[] =>
  slideIds.flatMap((id, i) => {
    const text = normalizeNote(notes[i] ?? "");
    if (!text) return [];
    return [`### ${id}`, "", ...text.split("\n").map(escapeNoteLine), ""];
  });

/** A complete `## Notas` section, ready to paste into a brief (used by the presenter's export). */
export const notesSectionMarkdown = (slideIds: string[], notes: string[]): string =>
  ["## Notas", "", ...noteBlockLines(slideIds, notes)].join("\n").trimEnd() + "\n";

/**
 * Inverse of `parseBriefNotes`: returns `markdown` with its `## Notas` block replaced by `notes`
 * (aligned with `slideIds`). Everything outside that block is preserved, and blocks for ids that
 * are not slides of the deck are kept after the known ones.
 */
export const serializeBriefNotes = (markdown: string, slideIds: string[], notes: string[]): string => {
  const section = locateNotesSection(markdown);

  if (!section) {
    if (!notes.some((note) => normalizeNote(note))) return markdown;
    return `${markdown.trimEnd()}\n\n${notesSectionMarkdown(slideIds, notes)}`;
  }

  const preamble = section.preamble.join("\n").trim();
  const orphans = section.blocks
    .filter((block) => !slideIds.includes(block.id))
    .flatMap((block) => [`### ${block.id}`, ...block.lines].join("\n").trimEnd().split("\n").concat(""));

  const body = [
    section.heading,
    "",
    ...(preamble ? [preamble, ""] : []),
    ...noteBlockLines(slideIds, notes),
    ...orphans,
  ];
  while (body[body.length - 1] === "") body.pop();

  const lines = [...section.before, ...body, ...(section.after.length ? ["", ...section.after] : [])];
  return lines.join("\n").replace(/\n*$/, "\n");
};

/** Sidecar consumed by the presenter (`<slug>.notes.json`). */
export const notesSidecar = (deckId: string, notes: string[]): string =>
  JSON.stringify({ deck: deckId, slides: notes }, null, 2) + "\n";
