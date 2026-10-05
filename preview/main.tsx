import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { lintDeck, lintHtml } from "../src/lint";
import { parseBriefNotes } from "../src/render/notes";
import { renderDeckHtml } from "../src/render/render-deck";
import { formatZodError, type Deck } from "../src/schema/core";
import type { Design, Issue } from "../src/schema/design-types";
import { getDesign, registryFromModules } from "../src/designs/registry";

/* ── Data: everything is bundled by Vite so edits hot-reload the page ─────────── */
const designModules = import.meta.glob<{ default: Design }>("/designs/*/design.config.ts", { eager: true });
const registry = registryFromModules(designModules);

const textFiles = import.meta.glob<string>(["/src/**/*.css", "/designs/**/*.css"], { query: "?raw", import: "default", eager: true });
const readText = (projectPath: string): string | undefined => textFiles[`/${projectPath}`];

const deckFiles = import.meta.glob<unknown>("/decks/*/deck.json", { eager: true, import: "default" });
const briefFiles = import.meta.glob<string>("/decks/*/brief.md", { query: "?raw", import: "default", eager: true });
const exampleFiles = import.meta.glob<unknown>("/designs/*/examples/full.deck.json", { eager: true, import: "default" });

const deckSlugs = Object.keys(deckFiles)
  .map((path) => path.split("/")[2] as string)
  .sort();

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
type ParsedDeck = { ok: true; deck: Deck; design: Design } | { ok: false; errors: string[] };

const parseDeck = (raw: unknown): ParsedDeck => {
  const designId = (raw as { design?: unknown } | null)?.design;
  if (typeof designId !== "string") return { ok: false, errors: ['deck.json needs a string "design" field'] };
  try {
    const design = getDesign(registry, designId);
    const parsed = design.deckSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, errors: formatZodError(parsed.error) };
    return { ok: true, deck: parsed.data, design };
  } catch (error) {
    return { ok: false, errors: [(error as Error).message] };
  }
};

const toBlobUrl = (html: string, hash = ""): string => `${URL.createObjectURL(new Blob([html], { type: "text/html" }))}${hash}`;

const useBlobUrl = (html: string | undefined, hash = ""): string | undefined => {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (html === undefined) return;
    const next = toBlobUrl(html, hash);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
    // The hash only seeds the initial slide; changing it must not reload the frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);
  return url;
};

const useQuery = (): URLSearchParams => {
  const [query, setQuery] = useState(() => new URLSearchParams(location.search));
  useEffect(() => {
    const handlePopState = () => setQuery(new URLSearchParams(location.search));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  return query;
};

/* ── Views ───────────────────────────────────────────────────────────────────── */
const IssueList = ({ issues, errors }: { issues: Issue[]; errors: string[] }) => {
  if (errors.length === 0 && issues.length === 0) return <p className="meta">✓ No issues</p>;
  return (
    <ul className="issues" aria-label="Validation issues">
      {errors.map((message) => (
        <li key={message} data-severity="P0">[P0] schema: {message}</li>
      ))}
      {issues.map((issue, i) => (
        <li key={`${issue.rule}-${i}`} data-severity={issue.severity}>
          [{issue.severity}] {issue.rule}
          {issue.slide ? ` (${issue.slide})` : ""}: {issue.message}
        </li>
      ))}
    </ul>
  );
};

const DeckView = ({ slug }: { slug: string }) => {
  const raw = deckFiles[`/decks/${slug}/deck.json`];
  const brief = briefFiles[`/decks/${slug}/brief.md`];
  const frameRef = useRef<HTMLIFrameElement>(null);
  const storageKey = `preview:${slug}`;

  const view = useMemo(() => {
    if (raw === undefined) return { errors: [`decks/${slug}/deck.json not found`], issues: [] as Issue[] };
    const parsed = parseDeck(raw);
    if (!parsed.ok) return { errors: parsed.errors, issues: [] as Issue[] };
    const { deck, design } = parsed;
    const html = renderDeckHtml(deck, design, { readText, baseHref: `${location.origin}/decks/${slug}/` });
    const issues = [...lintDeck({ deck, design }), ...lintHtml(html, design)];
    if (brief !== undefined) {
      for (const id of parseBriefNotes(brief, deck.slides.map((slide) => slide.id)).unknown) {
        issues.push({ rule: "notes-unknown-id", severity: "P1", message: `brief.md has notes for unknown slide id "${id}"` });
      }
    }
    return { errors: [] as string[], issues, html, deck, design };
  }, [raw, brief, slug]);

  const initialHash = sessionStorage.getItem(storageKey) ?? "";
  const frameUrl = useBlobUrl(view.html, initialHash);

  // Remember the current slide so a hot reload comes back to the same place.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const hash = frameRef.current?.contentWindow?.location.hash;
      if (hash) sessionStorage.setItem(storageKey, hash);
    }, 500);
    return () => window.clearInterval(timer);
  }, [storageKey]);

  const handleFrameLoad = () => frameRef.current?.contentWindow?.focus();

  return (
    <>
      <header>
        <h2>{view.deck?.title ?? slug}</h2>
        {view.deck && (
          <span className="meta">
            {view.deck.slides.length} slides · design {view.design.id} · {view.deck.shape}
          </span>
        )}
      </header>
      {frameUrl && (
        <div className="frame-wrap">
          <iframe ref={frameRef} title={`Deck ${slug}`} src={frameUrl} onLoad={handleFrameLoad} />
        </div>
      )}
      <IssueList issues={view.issues} errors={view.errors} />
    </>
  );
};

const Thumb = ({ deck, design, index }: { deck: Deck; design: Design; index: number }) => {
  const html = useMemo(
    () => renderDeckHtml(deck, design, { readText, baseHref: `${location.origin}/${design.dir}/examples/`, onlySlide: index }),
    [deck, design, index],
  );
  const url = useBlobUrl(html);
  const slide = deck.slides[index];
  return (
    <figure className="thumb">
      <div className="thumb__stage">
        {url && <iframe title={`${design.id} ${slide?.layout}`} src={url} tabIndex={-1} style={{ transform: "scale(var(--thumb-scale, 0.2))" }} />}
      </div>
      <figcaption>
        <strong>{slide?.layout}</strong> — {slide?.label}
      </figcaption>
    </figure>
  );
};

const DesignGallery = ({ id }: { id: string }) => {
  const design = registry.get(id);
  const raw = exampleFiles[`/designs/${id}/examples/full.deck.json`];
  const stageRef = useRef<HTMLDivElement>(null);

  // Scale the 1920px thumbnails to the card width.
  useEffect(() => {
    const update = () => {
      const width = stageRef.current?.querySelector(".thumb__stage")?.clientWidth;
      if (width) stageRef.current?.style.setProperty("--thumb-scale", String(width / 1920));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  if (!design) return <p className="empty">Unknown design "{id}".</p>;
  const parsed = raw === undefined ? undefined : parseDeck(raw);
  if (!parsed) return <p className="empty">designs/{id}/examples/full.deck.json is missing.</p>;
  if (!parsed.ok) return <IssueList issues={[]} errors={parsed.errors} />;

  return (
    <>
      <header>
        <h2>{design.name}</h2>
        <span className="meta">{design.description}</span>
      </header>
      <div className="gallery" ref={stageRef}>
        {parsed.deck.slides.map((slide, index) => (
          <Thumb key={slide.id} deck={parsed.deck} design={design} index={index} />
        ))}
      </div>
    </>
  );
};

const Nav = ({ query }: { query: URLSearchParams }) => {
  const currentDeck = query.get("deck");
  const currentDesign = query.get("design");
  return (
    <nav className="nav" aria-label="Decks and designs">
      <h1>SlidesChurch</h1>
      <h2>Decks</h2>
      {deckSlugs.map((slug) => (
        <a key={slug} href={`?deck=${slug}`} aria-current={currentDeck === slug ? "page" : undefined}>
          {slug}
        </a>
      ))}
      <h2>Designs</h2>
      {[...registry.keys()].map((id) => (
        <a key={id} href={`?design=${id}`} aria-current={currentDesign === id ? "page" : undefined}>
          {id}
        </a>
      ))}
    </nav>
  );
};

const App = () => {
  const query = useQuery();
  const deck = query.get("deck");
  const design = query.get("design");
  return (
    <div className="app">
      <Nav query={query} />
      <main className="main">
        {deck ? (
          <DeckView key={deck} slug={deck} />
        ) : design ? (
          <DesignGallery key={design} id={design} />
        ) : (
          <p className="empty">Pick a deck or a design on the left. URL: ?deck=&lt;slug&gt; or ?design=&lt;id&gt;.</p>
        )}
      </main>
    </div>
  );
};

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
