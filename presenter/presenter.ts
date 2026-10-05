/**
 * Presenter app: deck selector, scaled stage, speaker notes, step reveal and a second
 * "presenter" window (current + next slide, notes, timers) synced over BroadcastChannel.
 *
 * It reads the files written by `npm run build`:
 *   dist/decks.json                    index of built decks
 *   dist/<slug>/<slug>.html            the deck (only <style> and <section class="slide"> are used)
 *   dist/<slug>/<slug>.notes.json      speaker notes
 */
import {
  computeStageScale,
  createBus,
  extractShape,
  parseDeckHtml,
  parseDecksIndex,
  parseSidecar,
  shapeDimensions,
  sidecarPath,
  slideScopeStyles,
  renderNotesMarkdown,
  type DeckIndexEntry,
} from "./shared";
import { notesSectionMarkdown } from "../src/render/notes";

const STORAGE_KEY = "slideschurch-presenter-v2";
const BUS_NAME = "slideschurch";
const DIST_URL = new URL("../", location.href);
// Absolute on purpose: loading a deck sets <base href> to the deck folder, which would
// turn a relative URL into dist/<slug>/index.html (404).
const POPUP_URL = new URL("?popup=1", location.href).href;

/** Pause after the last keystroke before the notes are written to brief.md. */
const AUTOSAVE_DELAY_MS = 600;

const isPopup = new URLSearchParams(location.search).get("popup") === "1";

/* ── DOM helpers ─────────────────────────────────────────────────────────────── */
const byId = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`presenter: missing #${id}`);
  return element as T;
};

const pad = (n: number): string => String(n).padStart(2, "0");
const clamp = (n: number, low: number, high: number): number => Math.max(low, Math.min(high, n));
const formatClock = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
};

/** Same breakpoint as the stacked layout in presenter.css (stage on top, notes below). */
const STACKED_LAYOUT_QUERY = "(max-width: 760px), (max-width: 1024px) and (orientation: portrait)";

/* ── Persisted state ─────────────────────────────────────────────────────────── */
interface PersistedState {
  deck: string | null;
  index: number;
  /** `null` until the user toggles the panel; then the default depends on the screen size. */
  notesOpen: boolean | null;
}

const loadState = (): PersistedState => {
  const fallback: PersistedState = { deck: null, index: 0, notesOpen: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      deck: typeof parsed.deck === "string" ? parsed.deck : null,
      index: Number.isInteger(parsed.index) ? (parsed.index as number) : 0,
      notesOpen: typeof parsed.notesOpen === "boolean" ? parsed.notesOpen : null,
    };
  } catch {
    return fallback;
  }
};

const saveState = (patch: Partial<PersistedState>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...loadState(), ...patch }));
  } catch {
    // Private mode / quota: persistence is best effort.
  }
};

/* ── Deck loading (shared by main and popup) ─────────────────────────────────── */
interface LoadedDeck {
  entryFile: string;
  slides: HTMLElement[];
  notes: string[];
  notesMissing: boolean;
  shape: string;
}

const toElement = (outerHtml: string): HTMLElement => {
  const template = document.createElement("template");
  template.innerHTML = outerHtml.trim();
  return template.content.firstElementChild as HTMLElement;
};

/** Sets <base> so deck-relative asset paths (`assets/x.jpg`) resolve from the deck's folder. */
const applyDeckBase = (deckUrl: URL): void => {
  let base = document.querySelector<HTMLBaseElement>("base#deck-base");
  if (!base) {
    base = document.createElement("base");
    base.id = "deck-base";
    document.head.appendChild(base);
  }
  base.href = deckUrl.href.replace(/[^/]+$/, "");
};

const applyDeckStyles = (styles: string[], links: string[]): void => {
  const host = byId("deck-styles");
  host.replaceChildren(
    ...styles.map((css) => {
      const style = document.createElement("style");
      style.textContent = css;
      return style;
    }),
  );
  document.head.querySelectorAll("link[data-deck-font]").forEach((link) => link.remove());
  for (const href of links) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.deckFont = "";
    document.head.appendChild(link);
  }
};

const fetchText = async (url: URL): Promise<string> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status} (${url.pathname})`);
  return response.text();
};

const loadDeckFiles = async (entryFile: string): Promise<LoadedDeck> => {
  const deckUrl = new URL(entryFile, DIST_URL);
  applyDeckBase(deckUrl);

  const html = await fetchText(deckUrl);
  const parsed = parseDeckHtml(html);
  applyDeckStyles(slideScopeStyles(parsed), parsed.links);

  const slides = parsed.slides.map((slide) => toElement(slide.outerHtml));
  let notes = slides.map(() => "");
  let notesMissing = false;
  try {
    notes = parseSidecar(await fetchText(new URL(sidecarPath(entryFile), DIST_URL)), slides.length);
  } catch {
    notesMissing = true;
  }

  return { entryFile, slides, notes, notesMissing, shape: extractShape(html) };
};

/* ── Steps (progressive reveal) ──────────────────────────────────────────────── */
const stepsOf = (slide: HTMLElement | undefined): HTMLElement[] =>
  slide && slide.hasAttribute("data-steps") ? Array.from(slide.querySelectorAll<HTMLElement>("[data-step]")) : [];

const applyRevealed = (slide: HTMLElement | undefined, revealed: number): void =>
  stepsOf(slide).forEach((element, i) => element.classList.toggle("is-revealed", i < revealed));

const setStageSize = (stage: HTMLElement, shape: string): readonly [number, number] => {
  const [width, height] = shapeDimensions(shape);
  stage.style.width = `${width}px`;
  stage.style.height = `${height}px`;
  // Narrow screens size the stage frame from the deck's aspect ratio (see presenter.css).
  document.documentElement.style.setProperty("--shape-ratio", `${width} / ${height}`);
  return [width, height];
};

/* ── MAIN MODE ───────────────────────────────────────────────────────────────── */
const initMain = async (): Promise<void> => {
  const deckSelect = byId<HTMLSelectElement>("deck-select");
  const deckTitle = byId("deck-title");
  const counter = byId("slide-counter");
  const stage = byId("stage");
  const stageWrap = document.querySelector<HTMLElement>(".stage-wrap") as HTMLElement;
  const notesBody = byId("notes-body");
  const notesIdx = byId("notes-idx");
  const notesLabel = byId("notes-label");
  const notesEdit = byId<HTMLButtonElement>("notes-edit");
  const notesExport = byId<HTMLButtonElement>("notes-export");
  const notesStatus = byId<HTMLButtonElement>("notes-status");
  const notesEditor = byId<HTMLTextAreaElement>("notes-editor");
  const panelToggle = byId<HTMLButtonElement>("panel-toggle");
  const popupOpen = byId<HTMLButtonElement>("popup-open");
  const helpToggle = byId<HTMLButtonElement>("help-toggle");
  const help = byId("help");
  const navCounter = byId("nav-counter");
  const navPrev = byId<HTMLButtonElement>("nav-prev");
  const navNext = byId<HTMLButtonElement>("nav-next");

  const bus = createBus(BUS_NAME);
  let decks: DeckIndexEntry[] = [];
  let current: LoadedDeck | null = null;
  let index = 0;
  let revealed = 0;
  let dimensions: readonly [number, number] = shapeDimensions("landscape-16-9");
  /** True when `npm run serve` answers `/api/capabilities`; static hosts only get read + export. */
  let canEdit = false;
  let editing = false;
  let dirty = false;
  let saveTimer: number | undefined;
  let saving: Promise<void> = Promise.resolve();

  const entryTitle = (file: string): string => decks.find((deck) => deck.file === file)?.title ?? file;
  const slideLabel = (slide: HTMLElement | undefined): string => slide?.dataset.screenLabel ?? "";

  const fitStage = (): void => {
    const scale = computeStageScale(stageWrap.clientWidth, stageWrap.clientHeight, dimensions[0], dimensions[1]);
    stage.style.setProperty("--scale", String(scale));
  };

  const renderCounter = (): void => {
    const total = current?.slides.length ?? 0;
    counter.textContent = `${pad(index + 1)} / ${pad(total)}`;
    navCounter.textContent = counter.textContent;
  };

  const renderNotes = (): void => {
    if (!current) return;
    notesIdx.textContent = `${pad(index + 1)} / ${pad(current.slides.length)}`;
    notesLabel.textContent = slideLabel(current.slides[index]);
    const raw = current.notes[index] ?? "";
    if (editing) {
      if (notesEditor.value !== raw) notesEditor.value = raw;
      return;
    }
    const text = raw.trim();
    notesBody.classList.toggle("empty", !text);
    notesBody.classList.toggle("rendered", Boolean(text));
    if (text) {
      notesBody.innerHTML = renderNotesMarkdown(text);
      return;
    }
    notesBody.textContent = current.notesMissing && !canEdit
      ? `No hay archivo ${sidecarPath(current.entryFile)}. Escribí las notas en la sección «## Notas» de brief.md y volvé a construir.`
      : canEdit
        ? "Sin notas para esta slide. Pulsá «Editar» (E) para escribirlas."
        : "Sin notas para esta slide.";
  };

  /* ── Notes editing: autosave to brief.md through `npm run serve` ───────────── */
  const slugOf = (file: string): string => decks.find((deck) => deck.file === file)?.slug ?? "";

  const setStatus = (state: "saving" | "saved" | "error" | "idle"): void => {
    notesStatus.hidden = state === "idle" || !canEdit;
    notesStatus.dataset.state = state;
    notesStatus.textContent = { saving: "Guardando…", saved: "Guardado", error: "Error · reintentar", idle: "" }[state];
    notesStatus.disabled = state !== "error";
  };

  const putNotes = async (slug: string, slides: string[]): Promise<void> => {
    const response = await fetch(new URL(`api/notes/${encodeURIComponent(slug)}`, DIST_URL), {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-SlidesChurch": "1" },
      body: JSON.stringify({ slides }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  };

  /** Saves queued edits now. Writes are serialized so an older request can never overwrite a newer one. */
  const flushSave = (): Promise<void> => {
    window.clearTimeout(saveTimer);
    saving = saving.then(async () => {
      if (!dirty || !current || !canEdit) return;
      const deck = current;
      dirty = false;
      setStatus("saving");
      try {
        await putNotes(slugOf(deck.entryFile), deck.notes);
        if (!dirty) setStatus("saved");
      } catch {
        dirty = true;
        setStatus("error");
      }
    });
    return saving;
  };

  const handleEditorInput = (): void => {
    if (!current) return;
    current.notes[index] = notesEditor.value;
    dirty = true;
    setStatus("saving");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => void flushSave(), AUTOSAVE_DELAY_MS);
    bus.send({ type: "notes", index, text: notesEditor.value });
  };

  const setEditing = (force: boolean): void => {
    const next = force && canEdit && current !== null;
    if (next === editing) return;
    editing = next;
    notesEdit.setAttribute("aria-pressed", String(editing));
    notesEdit.textContent = editing ? "Listo" : "Editar";
    notesBody.hidden = editing;
    notesEditor.hidden = !editing;
    if (editing) {
      document.body.classList.add("notes-open");
      updatePanelToggle();
      requestAnimationFrame(fitStage);
    }
    renderNotes();
    if (editing) notesEditor.focus();
    else void flushSave();
  };

  const handleEditorKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    setEditing(false);
    notesEdit.focus();
  };

  const downloadNotes = (): void => {
    if (!current) return;
    const ids = current.slides.map((slide) => slide.dataset.slideId ?? "");
    const blob = new Blob([notesSectionMarkdown(ids, current.notes)], { type: "text/markdown;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slugOf(current.entryFile) || "deck"}-notas.md`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const renderStage = (): void => {
    if (!current) return;
    stage.replaceChildren(...current.slides);
    current.slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    applyRevealed(current.slides[index], revealed);
    renderCounter();
  };

  const publish = (): void => bus.send({ type: "goto", index, revealed });
  /** The popup receives the notes in memory, so it never shows stale text from the built sidecar. */
  const publishDeck = (): void => {
    if (current) bus.send({ type: "load-deck", file: current.entryFile, index, revealed, notes: current.notes });
  };

  const goto = (target: number, revealAll = false): void => {
    if (!current) return;
    const next = clamp(target, 0, current.slides.length - 1);
    const slide = current.slides[next];
    index = next;
    revealed = revealAll ? stepsOf(slide).length : 0;
    current.slides.forEach((item, i) => item.classList.toggle("is-active", i === next));
    applyRevealed(slide, revealed);
    renderCounter();
    renderNotes();
    saveState({ index });
    publish();
  };

  const next = (): void => {
    if (!current) return;
    const steps = stepsOf(current.slides[index]);
    if (revealed < steps.length) {
      revealed += 1;
      applyRevealed(current.slides[index], revealed);
      publish();
      return;
    }
    goto(index + 1);
  };

  const prev = (): void => {
    if (!current) return;
    if (revealed > 0) {
      revealed -= 1;
      applyRevealed(current.slides[index], revealed);
      publish();
      return;
    }
    goto(index - 1, true);
  };

  const loadDeck = async (file: string, startIndex: number): Promise<void> => {
    setEditing(false);
    await flushSave(); // pending edits belong to the deck that is still loaded
    try {
      current = await loadDeckFiles(file);
    } catch (error) {
      deckTitle.textContent = `Error cargando ${file}: ${(error as Error).message}`;
      current = null;
      return;
    }
    index = clamp(startIndex, 0, Math.max(0, current.slides.length - 1));
    revealed = 0;
    dimensions = setStageSize(stage, current.shape);
    deckSelect.value = file;
    deckTitle.textContent = entryTitle(file);
    renderStage();
    renderNotes();
    fitStage();
    saveState({ deck: file, index });
    publishDeck();
  };

  const updatePanelToggle = (): void => {
    const open = document.body.classList.contains("notes-open");
    panelToggle.setAttribute("aria-pressed", String(open));
    panelToggle.textContent = open ? "Ocultar notas" : "Notas";
  };

  const toggleNotes = (force?: boolean): void => {
    const open = force ?? !document.body.classList.contains("notes-open");
    if (!open) setEditing(false);
    document.body.classList.toggle("notes-open", open);
    updatePanelToggle();
    saveState({ notesOpen: open });
    requestAnimationFrame(fitStage);
  };

  const toggleHelp = (force?: boolean): void => {
    document.body.classList.toggle("help-open", force ?? !document.body.classList.contains("help-open"));
  };

  const toggleFullscreen = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      return;
    }
    void document.documentElement.requestFullscreen?.();
  };

  const openPopup = (): void => {
    window.open(POPUP_URL, "slideschurch-presenter", "width=520,height=720,resizable=yes,scrollbars=no");
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const tag = (event.target as HTMLElement | null)?.tagName ?? "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    const actions: Record<string, () => void> = {
      ArrowRight: next,
      PageDown: next,
      " ": next,
      ArrowLeft: prev,
      PageUp: prev,
      Home: () => goto(0),
      End: () => goto((current?.slides.length ?? 1) - 1, true),
      e: () => setEditing(true),
      E: () => setEditing(true),
      n: () => toggleNotes(),
      N: () => toggleNotes(),
      w: openPopup,
      W: openPopup,
      f: toggleFullscreen,
      F: toggleFullscreen,
      "?": () => toggleHelp(),
    };
    if (event.key === "Escape") {
      if (document.body.classList.contains("help-open")) toggleHelp(false);
      else if (document.body.classList.contains("notes-open")) toggleNotes(false);
      else if (document.fullscreenElement) void document.exitFullscreen?.();
      return;
    }
    const action = actions[event.key];
    if (!action) return;
    action();
    event.preventDefault();
  };

  /* Touch: swipe left/right on the stage to move (vertical drags are left to the browser). */
  const SWIPE_MIN_PX = 48;
  let touchStart: { x: number; y: number } | null = null;
  const handleTouchStart = (event: TouchEvent): void => {
    const touch = event.touches[0];
    touchStart = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const handleTouchEnd = (event: TouchEvent): void => {
    const touch = event.changedTouches[0];
    if (!touchStart || !touch) return;
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  const handleDeckChange = (): void => void loadDeck(deckSelect.value, 0);
  const handleHelpClick = (event: MouseEvent): void => {
    if (event.target === help) toggleHelp();
  };

  /* Boot */
  try {
    decks = parseDecksIndex(await fetchText(new URL("decks.json", DIST_URL)));
  } catch (error) {
    deckTitle.textContent = `No se pudo leer dist/decks.json (${(error as Error).message}). Ejecutá «npm run build -- --all».`;
    return;
  }
  try {
    const capabilities = (await (await fetch(new URL("api/capabilities", DIST_URL), { cache: "no-store" })).json()) as { notesWrite?: boolean };
    canEdit = capabilities.notesWrite === true;
  } catch {
    canEdit = false; // static host or plain file server: read-only notes + export
  }
  notesEdit.hidden = !canEdit;
  if (decks.length === 0) {
    deckTitle.textContent = "No hay decks construidos. Ejecutá «npm run build -- --all».";
    return;
  }

  deckSelect.replaceChildren(
    ...decks.map((deck) => {
      const option = document.createElement("option");
      option.value = deck.file;
      option.textContent = deck.title;
      return option;
    }),
  );

  deckSelect.addEventListener("change", handleDeckChange);
  panelToggle.addEventListener("click", () => toggleNotes());
  notesEdit.addEventListener("click", () => setEditing(!editing));
  notesExport.addEventListener("click", downloadNotes);
  notesStatus.addEventListener("click", () => void flushSave());
  notesEditor.addEventListener("input", handleEditorInput);
  notesEditor.addEventListener("keydown", handleEditorKeyDown);
  notesEditor.addEventListener("blur", () => void flushSave());
  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
  });
  popupOpen.addEventListener("click", openPopup);
  helpToggle.addEventListener("click", () => toggleHelp());
  help.addEventListener("click", handleHelpClick);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", fitStage);
  navPrev.addEventListener("click", prev);
  navNext.addEventListener("click", next);
  stageWrap.addEventListener("touchstart", handleTouchStart, { passive: true });
  stageWrap.addEventListener("touchend", handleTouchEnd, { passive: true });
  // Layout changes that do not fire `resize` (notes panel, mobile toolbars, orientation).
  new ResizeObserver(fitStage).observe(stageWrap);

  bus.onMessage((event) => {
    // A freshly opened presenter window asks for the current state.
    if ((event.data as { type?: string } | null)?.type === "hello") publishDeck();
  });

  const persisted = loadState();
  // Phones have the room under the stage, so notes default to open there.
  const notesOpen = persisted.notesOpen ?? window.matchMedia(STACKED_LAYOUT_QUERY).matches;
  if (notesOpen) document.body.classList.add("notes-open");
  updatePanelToggle();

  const requested = new URLSearchParams(location.search).get("deck");
  const bySlug = requested ? decks.find((deck) => deck.slug === requested) : undefined;
  const remembered = decks.find((deck) => deck.file === persisted.deck);
  const initial = bySlug ?? remembered ?? (decks[0] as DeckIndexEntry);
  await loadDeck(initial.file, initial === remembered && !bySlug ? persisted.index : 0);
};

/* ── POPUP MODE (presenter window) ───────────────────────────────────────────── */
const initPopup = async (): Promise<void> => {
  document.body.classList.add("popup");
  byId("popup-grid").hidden = false;

  const idxCurrent = byId("popup-cur-idx");
  const idxNext = byId("popup-next-idx");
  const stageCurrent = byId("popup-cur-stage");
  const stageNext = byId("popup-next-stage");
  const previewCurrent = byId("popup-cur-preview");
  const previewNext = byId("popup-next-preview");
  const notesBox = byId("popup-notes");
  const timer = byId("popup-timer");

  const bus = createBus(BUS_NAME);
  let current: LoadedDeck | null = null;
  let index = 0;
  let revealed = 0;
  let dimensions: readonly [number, number] = shapeDimensions("landscape-16-9");
  const startedAt = Date.now();
  let slideStart = Date.now();

  const fitPreview = (stage: HTMLElement, preview: HTMLElement): void => {
    const box = preview.getBoundingClientRect();
    stage.style.setProperty("--scale", String(computeStageScale(box.width, box.height, dimensions[0], dimensions[1])));
  };
  const fitAll = (): void => {
    fitPreview(stageCurrent, previewCurrent);
    fitPreview(stageNext, previewNext);
  };

  const renderPreview = (stage: HTMLElement, slideIndex: number, revealCount: number): void => {
    const slide = current?.slides[slideIndex];
    if (!slide) {
      const end = document.createElement("div");
      end.className = "preview-end";
      end.textContent = "— fin —";
      stage.replaceChildren(end);
      return;
    }
    const clone = slide.cloneNode(true) as HTMLElement;
    clone.classList.add("is-active");
    applyRevealed(clone, revealCount);
    stage.replaceChildren(clone);
  };

  const render = (): void => {
    if (!current) return;
    const total = current.slides.length;
    idxCurrent.textContent = `${index + 1} / ${total}`;
    idxNext.textContent = index + 1 < total ? `${index + 2} / ${total}` : "—";
    renderPreview(stageCurrent, index, revealed);
    renderPreview(stageNext, index + 1, 0);
    requestAnimationFrame(fitAll);
    const text = (current.notes[index] ?? "").trim();
    notesBox.classList.toggle("empty", !text);
    notesBox.classList.toggle("rendered", Boolean(text));
    if (text) notesBox.innerHTML = renderNotesMarkdown(text);
    else notesBox.textContent = "Sin notas para esta slide.";
  };

  const handleMessage = (event: { data: unknown }): void => {
    const message = event.data as {
      type?: string;
      file?: string;
      index?: number;
      revealed?: number;
      notes?: unknown;
      text?: unknown;
    } | null;
    if (!message || typeof message !== "object") return;

    if (message.type === "load-deck" && message.file) {
      void loadDeckFiles(message.file)
        .then((deck) => {
          if (Array.isArray(message.notes)) deck.notes = deck.slides.map((_, i) => String((message.notes as unknown[])[i] ?? ""));
          current = deck;
          dimensions = setStageSize(stageCurrent, deck.shape);
          setStageSize(stageNext, deck.shape);
          document.title = `${message.file} — Presentador`;
          index = message.index ?? 0;
          revealed = message.revealed ?? 0;
          slideStart = Date.now();
          render();
        })
        .catch((error: Error) => {
          document.title = `Error: ${error.message}`;
        });
      return;
    }
    if (message.type === "notes" && current && typeof message.text === "string") {
      current.notes[message.index ?? 0] = message.text;
      if ((message.index ?? 0) === index) render();
      return;
    }
    if (message.type === "goto") {
      const changed = (message.index ?? 0) !== index;
      index = message.index ?? 0;
      revealed = message.revealed ?? 0;
      if (changed) slideStart = Date.now();
      render();
    }
  };

  bus.onMessage(handleMessage);
  window.addEventListener("resize", fitAll);
  window.setInterval(() => {
    timer.textContent = `⏱ ${formatClock(Date.now() - startedAt)} · slide ${formatClock(Date.now() - slideStart)}`;
  }, 1000);

  bus.send({ type: "hello" });
};

document.addEventListener("DOMContentLoaded", () => void (isPopup ? initPopup() : initMain()));
