import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import { buildDeck } from "../node/build";
import { loadDesigns } from "../node/project";
import { formatValidation, validateDeck } from "../node/validate";
import { shapeDimensions } from "../shapes/dimensions";

const SLUG = /^[a-z0-9][a-z0-9_-]*$/i;

export class PdfExportError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message);
    this.name = "PdfExportError";
  }
}

/** Chrome-family binaries, in the order we try them. `CHROME_PATH` wins. */
export const chromeCandidates = (platform = process.platform, envPath = process.env.CHROME_PATH): string[] => {
  const bundled =
    platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
      : platform === "win32"
        ? [
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
  return [envPath, ...bundled].filter((path): path is string => Boolean(path));
};

export const findChrome = (candidates = chromeCandidates()): string | undefined => candidates.find((candidate) => existsSync(candidate));

export interface PrintHtmlOptions {
  htmlPath: string;
  pdfPath: string;
  shape: string;
  chromePath?: string;
}

/** Prints a built deck HTML file to one PDF page per slide. */
export const printHtmlToPdf = async ({ htmlPath, pdfPath, shape, chromePath }: PrintHtmlOptions): Promise<void> => {
  const executablePath = chromePath ?? findChrome();
  if (!executablePath) {
    throw new PdfExportError("No Chrome, Chromium, or Edge found. Install Google Chrome or set CHROME_PATH.", 500);
  }

  const [width, height] = shapeDimensions(shape);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-first-run", "--no-default-browser-check", "--disable-extensions", "--allow-file-access-from-files"],
  });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(45_000);
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 45_000 });
    await page.evaluate(
      () =>
        Promise.race([
          document.fonts.ready,
          new Promise((resolve) => {
            setTimeout(resolve, 8000);
          }),
        ]),
    );
    await page.emulateMediaType("print");
    await page.pdf({
      path: pdfPath,
      printBackground: true,
      preferCSSPageSize: true,
      width: `${width}px`,
      height: `${height}px`,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await browser.close();
  }
};

export interface ExportedPdf {
  pdfPath: string;
  slides: number;
  bytes: number;
}

/** Validates, builds, and prints `decks/<slug>` to `dist/<slug>/<slug>.pdf`. */
export const exportDeckPdf = async (slug: string, options: { offline?: boolean } = {}): Promise<ExportedPdf> => {
  if (!SLUG.test(slug)) throw new PdfExportError("Invalid deck slug", 400);

  const registry = await loadDesigns();
  const result = validateDeck(slug, registry);
  if (!result.loaded) {
    const missing = result.schemaErrors.some((error) => error.includes("not found"));
    throw new PdfExportError(result.schemaErrors.join("; ") || "Deck not found", missing ? 404 : 422);
  }
  if (result.blocked) throw new PdfExportError(formatValidation(result).trim(), 422);

  const built = buildDeck(result.loaded, { inline: false, offline: Boolean(options.offline) });
  const pdfPath = join(built.outDir, `${slug}.pdf`);
  await printHtmlToPdf({ htmlPath: built.htmlPath, pdfPath, shape: result.loaded.deck.shape });
  return { pdfPath, slides: result.loaded.deck.slides.length, bytes: statSync(pdfPath).size };
};
