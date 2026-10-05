import { describe, expect, it } from "vitest";
import { notesSectionMarkdown, notesSidecar, parseBriefNotes, serializeBriefNotes } from "../src/render/notes";

const ids = ["portada", "creador", "cierre"];

describe("parseBriefNotes", () => {
  it("aligns notes with slide order and pads missing ones", () => {
    const md = "# T\n\n## Notas\n\n### portada\nHola\n\nmás\n\n### cierre\nAdiós\n";
    expect(parseBriefNotes(md, ids)).toEqual({ notes: ["Hola\n\nmás", "", "Adiós"], unknown: [] });
  });

  it("accepts `## Notes` case-insensitively", () => {
    expect(parseBriefNotes("## notes\n### creador\nx", ids).notes).toEqual(["", "x", ""]);
  });

  it("reports unknown ids and ignores them", () => {
    const result = parseBriefNotes("## Notas\n### fantasma\nboo\n### portada\nok", ids);
    expect(result.unknown).toEqual(["fantasma"]);
    expect(result.notes[0]).toBe("ok");
  });

  it("stops at the next `##` section", () => {
    const md = "## Notas\n### portada\nuno\n## Apéndice\n### creador\nno debe entrar";
    expect(parseBriefNotes(md, ids).notes).toEqual(["uno", "", ""]);
  });

  it("returns empty notes when the section is missing", () => {
    expect(parseBriefNotes("# Solo intención", ids)).toEqual({ notes: ["", "", ""], unknown: [] });
  });

  it("writes the sidecar format the presenter reads", () => {
    expect(JSON.parse(notesSidecar("demo", ["a", ""]))).toEqual({ deck: "demo", slides: ["a", ""] });
  });
});

describe("serializeBriefNotes", () => {
  const brief = "# Intención\n\nTexto.\n\n## Notas\n\n### portada\n\nHola\n\n### cierre\n\nAdiós\n\n## Apéndice\n\nNo tocar.\n";

  it("replaces only the notes block and keeps the rest", () => {
    const updated = serializeBriefNotes(brief, ids, ["Nuevo", "", "Adiós"]);
    expect(updated).toBe("# Intención\n\nTexto.\n\n## Notas\n\n### portada\n\nNuevo\n\n### cierre\n\nAdiós\n\n## Apéndice\n\nNo tocar.\n");
  });

  it("is a fixed point when nothing changed", () => {
    const notes = parseBriefNotes(brief, ids).notes;
    expect(serializeBriefNotes(brief, ids, notes)).toBe(brief);
  });

  it("writes blocks in slide order and drops emptied notes", () => {
    const updated = serializeBriefNotes(brief, ids, ["", "medio", ""]);
    expect(parseBriefNotes(updated, ids).notes).toEqual(["", "medio", ""]);
    expect(updated).not.toContain("### portada");
  });

  it("appends a section when the brief has none, and stays untouched when there is nothing to add", () => {
    const bare = "# Solo intención\n";
    expect(serializeBriefNotes(bare, ids, ["", "", ""])).toBe(bare);
    const added = serializeBriefNotes(bare, ids, ["a", "", ""]);
    expect(added).toBe("# Solo intención\n\n## Notas\n\n### portada\n\na\n");
  });

  it("keeps blocks of ids that are not slides", () => {
    const md = "## Notas\n\n### fantasma\n\nboo\n\n### portada\n\nok\n";
    const updated = serializeBriefNotes(md, ids, ["ok2", "", ""]);
    expect(parseBriefNotes(updated, ids)).toEqual({ notes: ["ok2", "", ""], unknown: ["fantasma"] });
    expect(updated).toContain("boo");
  });

  it("round-trips notes that contain heading-like lines", () => {
    const notes = ["## Idea\n### Detalle\n\\## ya escapado\n#### cuatro", "", ""];
    const updated = serializeBriefNotes(brief, ids, notes);
    expect(parseBriefNotes(updated, ids).notes).toEqual(notes);
    expect(updated).toContain("## Apéndice");
  });

  it("builds a pasteable section for the export", () => {
    expect(notesSectionMarkdown(ids, ["uno", "", "tres"])).toBe("## Notas\n\n### portada\n\nuno\n\n### cierre\n\ntres\n");
  });
});
