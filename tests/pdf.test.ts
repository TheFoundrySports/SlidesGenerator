import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findChrome, printHtmlToPdf } from "../src/exporters/pdf";
import { renderDeckHtml } from "../src/render/render-deck";
import { CATECHISM, getDesign, parseDeck, readExample, readProjectText } from "./helpers";

describe("findChrome", () => {
  it("returns the first candidate that exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "slideschurch-chrome-"));
    const hit = join(dir, "chrome");
    writeFileSync(hit, "");
    expect(findChrome([join(dir, "missing"), hit])).toBe(hit);
    expect(findChrome([join(dir, "missing")])).toBeUndefined();
    rmSync(dir, { recursive: true, force: true });
  });
});

/** Largest `/Count` in the page tree. Compressed content streams do not include this. */
const pdfPageCount = (buffer: Buffer): number => {
  const counts = [...buffer.toString("latin1").matchAll(/\/Count\s+(\d+)/g)].map((match) => Number(match[1]));
  return counts.length > 0 ? Math.max(...counts) : 0;
};

describe("printHtmlToPdf", () => {
  const chrome = findChrome();

  it.skipIf(!chrome)("prints one page per slide", async () => {
    const design = await getDesign();
    const deck = parseDeck(design, readExample(CATECHISM, "minimal"));
    const dir = mkdtempSync(join(tmpdir(), "slideschurch-pdf-"));
    const htmlPath = join(dir, "deck.html");
    const pdfPath = join(dir, "deck.pdf");
    writeFileSync(htmlPath, renderDeckHtml(deck, design, { readText: readProjectText, offline: true }));

    await printHtmlToPdf({ htmlPath, pdfPath, shape: deck.shape, chromePath: chrome });

    const pdf = readFileSync(pdfPath);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdfPageCount(pdf)).toBe(deck.slides.length);
    rmSync(dir, { recursive: true, force: true });
  }, 60_000);
});
