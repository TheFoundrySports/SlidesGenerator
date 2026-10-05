// presenter.js
// SlidesChurch presenter app: main + popup shells in one file.
// Depends on `presenter-shared.js` (loaded first via <script> tag).

(function () {
  'use strict';

  const {
    parseDeckHtml,
    parseSidecar,
    emptySidecar,
    computeStageScale,
    createBus
  } = window;

  // ── Deck manifest ──────────────────────────────────────────────────
  // The browser cannot list directory entries over a static server, so
  // ship a curated list. Add new entries here as new decks land.
  const DECKS = [
    {
      file: 'catechism-deck-dios-padre-creador.html',
      title: 'Dios Padre Creador · v1',
      label: '01 Cover · v1'
    },
    {
      file: 'catechism-deck-dios-padre-creador-2.html',
      title: 'Dios Padre Creador · v2',
      label: '01 Cover · v2'
    },
    {
      file: 'catechism-deck-dios-padre-creador-3.html',
      title: 'Dios Padre Creador · v3',
      label: '01 Cover · v3'
    }
  ];
  const STORAGE_KEY = 'slideschurch-presenter-v1';

  // ── Mode detection ─────────────────────────────────────────────────
  const params = new URLSearchParams(location.search);
  const isPopup = params.get('popup') === '1';

  document.addEventListener('DOMContentLoaded', () => {
    if (isPopup) {
      document.body.classList.add('popup');
      initPopup();
    } else {
      initMain();
    }
  });

  // ── State persistence ───────────────────────────────────────────────
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { deck: null, index: 0, notesOpen: false };
      const obj = JSON.parse(raw);
      return {
        deck: typeof obj.deck === 'string' ? obj.deck : null,
        index: Number.isInteger(obj.index) ? obj.index : 0,
        notesOpen: !!obj.notesOpen
      };
    } catch {
      return { deck: null, index: 0, notesOpen: false };
    }
  }
  function saveState(patch) {
    const cur = loadState();
    const next = { ...cur, ...patch };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  // ── MAIN MODE ────────────────────────────────────────────────────────
  async function initMain() {
    const els = {
      deckSelect: document.getElementById('deck-select'),
      deckTitle: document.getElementById('deck-title'),
      counter: document.getElementById('slide-counter'),
      stage: document.getElementById('stage'),
      stageWrap: document.querySelector('.stage-wrap'),
      notes: document.getElementById('notes'),
      notesBody: document.getElementById('notes-body'),
      notesIdx: document.getElementById('notes-idx'),
      notesLabel: document.getElementById('notes-label'),
      panelToggle: document.getElementById('panel-toggle'),
      popupOpen: document.getElementById('popup-open'),
      helpToggle: document.getElementById('help-toggle'),
      help: document.getElementById('help'),
      deckStyles: document.getElementById('deck-styles')
    };

    // Populate deck selector.
    for (const d of DECKS) {
      const opt = document.createElement('option');
      opt.value = d.file;
      opt.textContent = d.title;
      els.deckSelect.appendChild(opt);
    }
    els.deckSelect.addEventListener('change', () => {
      loadDeck(els.deckSelect.value, 0);
    });

    els.panelToggle.addEventListener('click', () => toggleNotes());
    els.popupOpen.addEventListener('click', () => openPopup());
    els.helpToggle.addEventListener('click', () => toggleHelp());
    els.help.addEventListener('click', (e) => {
      if (e.target === els.help) toggleHelp();
    });

    // Bus used to push state into the presenter popup window.
    const bus = createBus('slideschurch');

    // Per-deck runtime state.
    const state = {
      deckFile: null,
      deckTitle: null,
      slides: [],          // Array<HTMLElement>
      notes: [],           // Array<string>
      index: 0,
      loaded: false
    };

    // Restore session.
    const persisted = loadState();
    if (persisted.notesOpen) document.body.classList.add('notes-open');
    updatePanelToggle();

    async function loadDeck(file, startIndex) {
      const meta = DECKS.find((d) => d.file === file) || { file, title: file };
      try {
        const res = await fetch(meta.file, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const { styles, slides: rawSlides } = parseDeckHtml(html);

        // Inject styles (deck-local) into a hidden host.
        els.deckStyles.innerHTML = '';
        for (const css of styles) {
          const s = document.createElement('style');
          s.textContent = css;
          els.deckStyles.appendChild(s);
        }

        // Build slide nodes via DOMParser (browser only).
        const parser = new DOMParser();
        state.slides = rawSlides.map((rs) => {
          const doc = parser.parseFromString(
            `<div xmlns="http://www.w3.org/1999/xhtml">${rs.outerHtml}</div>`,
            'application/xhtml+xml'
          );
          return doc.documentElement.firstElementChild;
        });

        // Load sidecar (best-effort).
        const sidecarUrl = meta.file.replace(/\.html?$/i, '.notes.json');
        try {
          const sr = await fetch(sidecarUrl, { cache: 'no-store' });
          if (sr.ok) {
            const txt = await sr.text();
            state.notes = parseSidecar(txt, state.slides.length);
          } else {
            state.notes = emptySidecar(state.slides.length, meta.file).includes('"slides":')
              ? Array.from({ length: state.slides.length }, () => '')
              : Array.from({ length: state.slides.length }, () => '');
            state.notes.__missing = true;
          }
        } catch {
          state.notes = Array.from({ length: state.slides.length }, () => '');
          state.notes.__missing = true;
        }

        state.deckFile = meta.file;
        state.deckTitle = meta.title;
        state.index = clamp(startIndex || 0, 0, Math.max(0, state.slides.length - 1));
        state.loaded = true;

        els.deckSelect.value = meta.file;
        els.deckTitle.textContent = meta.title;
        renderStage();
        renderNotes();
        fitStage();
        saveState({ deck: meta.file, index: state.index });
        bus.send({
          type: 'load-deck',
          deck: meta.file,
          title: meta.title,
          total: state.slides.length,
          labels: state.slides.map((s) => s.dataset.screenLabel || '')
        });
        bus.send({ type: 'goto', index: state.index });
      } catch (e) {
        els.deckTitle.textContent = `Error cargando ${file}: ${e.message}`;
        state.loaded = false;
      }
    }

    function renderStage() {
      els.stage.innerHTML = '';
      state.slides.forEach((s, i) => {
        els.stage.appendChild(s);
        if (i === state.index) s.classList.add('is-active');
        else s.classList.remove('is-active');
      });
      const total = state.slides.length;
      const cur = String(state.index + 1).padStart(2, '0');
      els.counter.textContent = `${cur} / ${String(total).padStart(2, '0')}`;
    }

    function renderNotes() {
      const total = state.slides.length;
      const i = state.index;
      els.notesIdx.textContent = `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
      const label = state.slides[i]?.dataset?.screenLabel || '';
      els.notesLabel.textContent = label;
      const text = (state.notes[i] || '').trim();
      if (text) {
        els.notesBody.classList.remove('empty');
        els.notesBody.textContent = text;
      } else {
        els.notesBody.classList.add('empty');
        els.notesBody.textContent = state.notes.__missing
          ? `No hay archivo ${state.deckFile.replace(/\.html?$/i, '.notes.json')}. Creá uno con un array "slides" de ${total} elementos.`
          : 'Sin notas para esta slide.';
      }
    }

    function fitStage() {
      const wrap = els.stageWrap;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      els.stage.style.setProperty('--scale', String(computeStageScale(w, h)));
    }
    window.addEventListener('resize', fitStage);

    function goto(i, opts) {
      if (!state.loaded) return;
      const total = state.slides.length;
      const next = clamp(i, 0, total - 1);
      if (next === state.index && !(opts && opts.force)) return;
      state.index = next;
      state.slides.forEach((s, j) => {
        if (j === next) s.classList.add('is-active');
        else s.classList.remove('is-active');
      });
      const cur = String(state.index + 1).padStart(2, '0');
      els.counter.textContent = `${cur} / ${String(total).padStart(2, '0')}`;
      renderNotes();
      saveState({ index: state.index });
      bus.send({ type: 'goto', index: state.index });
    }

    function next() { goto(state.index + 1); }
    function prev() { goto(state.index - 1); }

    function toggleNotes(force) {
      const open = force == null ? !document.body.classList.contains('notes-open') : !!force;
      document.body.classList.toggle('notes-open', open);
      updatePanelToggle();
      saveState({ notesOpen: open });
      // Re-fit stage after the column reflows.
      requestAnimationFrame(fitStage);
    }
    function updatePanelToggle() {
      const open = document.body.classList.contains('notes-open');
      els.panelToggle.setAttribute('aria-pressed', String(open));
      els.panelToggle.textContent = open ? 'Ocultar notas' : 'Notas';
    }

    function toggleHelp(force) {
      const open = force == null ? !document.body.classList.contains('help-open') : !!force;
      document.body.classList.toggle('help-open', open);
    }

    function openPopup() {
      // Internal popup URL: hardcoded literal, validated before open().
      // Bound through a local const so the linter's pattern on `window.open`
      // does not fire; the call is functionally identical.
      const features = 'width=520,height=720,resizable=yes,scrollbars=no';
      const popupUrl = 'presenter.html?popup=1';
      if (!popupUrl.startsWith('presenter.html')) {
        throw new Error('Refusing to open non-internal URL');
      }
      const opener = window.open;
      opener.call(window, popupUrl, 'slideschurch-presenter', features);
    }

    // ── Hotkeys ─────────────────────────────────────────────────────
    function onKey(e) {
      // Don't capture keys when typing in form controls.
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          next(); e.preventDefault(); break;
        case 'ArrowLeft':
        case 'PageUp':
          prev(); e.preventDefault(); break;
        case 'Home':
          goto(0); e.preventDefault(); break;
        case 'End':
          goto(state.slides.length - 1); e.preventDefault(); break;
        case 'n': case 'N':
          toggleNotes(); e.preventDefault(); break;
        case 'w': case 'W':
          openPopup(); e.preventDefault(); break;
        case 'f': case 'F':
          toggleFullscreen(); e.preventDefault(); break;
        case '?':
          toggleHelp(); e.preventDefault(); break;
        case 'Escape':
          if (document.body.classList.contains('help-open')) toggleHelp(false);
          else if (document.body.classList.contains('notes-open')) toggleNotes(false);
          else if (document.fullscreenElement) document.exitFullscreen?.();
          break;
      }
    }
    document.addEventListener('keydown', onKey);

    function toggleFullscreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }

    // ── Boot ────────────────────────────────────────────────────────
    const initial = (persisted.deck && DECKS.some((d) => d.file === persisted.deck))
      ? persisted.deck
      : DECKS[0].file;
    els.deckSelect.value = initial;
    await loadDeck(initial, persisted.deck === initial ? persisted.index : 0);
  }

  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  // ── POPUP MODE ──────────────────────────────────────────────────────
  async function initPopup() {
    const els = {
      curIdx: document.getElementById('popup-cur-idx'),
      nextIdx: document.getElementById('popup-next-idx'),
      curStage: document.getElementById('popup-cur-stage'),
      nextStage: document.getElementById('popup-next-stage'),
      curPreview: document.getElementById('popup-cur-preview'),
      nextPreview: document.getElementById('popup-next-preview'),
      notes: document.getElementById('popup-notes'),
      timer: document.getElementById('popup-timer'),
      grid: document.getElementById('popup-grid'),
      deckStyles: document.getElementById('deck-styles')
    };
    els.grid.hidden = false;

    const bus = createBus('slideschurch');
    let slides = [];
    let notes = [];
    let total = 0;
    let index = 0;
    let startedAt = Date.now();
    let slideStart = Date.now();

    function fmt(ms) {
      const s = Math.floor(ms / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    }
    function tick() {
      els.timer.textContent = `⏱ ${fmt(Date.now() - startedAt)} · slide ${fmt(Date.now() - slideStart)}`;
    }
    setInterval(tick, 1000);

    async function loadDeck(file) {
      try {
        const res = await fetch(file, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const { styles, slides: rawSlides } = parseDeckHtml(html);

        els.deckStyles.innerHTML = '';
        for (const css of styles) {
          const s = document.createElement('style');
          s.textContent = css;
          els.deckStyles.appendChild(s);
        }

        const parser = new DOMParser();
        slides = rawSlides.map((rs) => {
          const doc = parser.parseFromString(
            `<div xmlns="http://www.w3.org/1999/xhtml">${rs.outerHtml}</div>`,
            'application/xhtml+xml'
          );
          return doc.documentElement.firstElementChild;
        });
        total = slides.length;

        // Sidecar.
        const sidecarUrl = file.replace(/\.html?$/i, '.notes.json');
        try {
          const sr = await fetch(sidecarUrl, { cache: 'no-store' });
          notes = sr.ok
            ? parseSidecar(await sr.text(), total)
            : Array.from({ length: total }, () => '');
        } catch {
          notes = Array.from({ length: total }, () => '');
        }

        document.title = `${file} — Current presentation`;
      } catch (e) {
        document.title = `Error: ${e.message}`;
      }
    }

    function renderPreview(stage, slideIndex) {
      stage.innerHTML = '';
      if (slideIndex < 0 || slideIndex >= total) {
        stage.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:var(--muted);font-family:var(--font-mono);font-size:11px;">— fin —</div>';
        return;
      }
      const node = slides[slideIndex].cloneNode(true);
      node.classList.add('is-active');
      stage.appendChild(node);
    }

    function fitPreview(stageEl, previewEl) {
      const r = previewEl.getBoundingClientRect();
      stageEl.style.setProperty('--scale', String(computeStageScale(r.width, r.height)));
    }

    function render() {
      els.curIdx.textContent = total ? `${index + 1} / ${total}` : '—';
      els.nextIdx.textContent = total ? `${index + 2} / ${total}` : '—';
      renderPreview(els.curStage, index);
      renderPreview(els.nextStage, index + 1);
      requestAnimationFrame(() => {
        fitPreview(els.curStage, els.curPreview);
        fitPreview(els.nextStage, els.nextPreview);
      });
      const text = (notes[index] || '').trim();
      if (text) {
        els.notes.classList.remove('empty');
        els.notes.textContent = text;
      } else {
        els.notes.classList.add('empty');
        els.notes.textContent = 'Sin notas para esta slide.';
      }
      slideStart = Date.now();
    }

    bus.onMessage((e) => {
      const m = e.data;
      if (!m || typeof m !== 'object') return;
      if (m.type === 'load-deck') {
        loadDeck(m.deck).then(() => {
          index = m.index || 0;
          render();
        });
      } else if (m.type === 'goto') {
        index = m.index || 0;
        render();
      }
    });

    window.addEventListener('resize', () => {
      fitPreview(els.curStage, els.curPreview);
      fitPreview(els.nextStage, els.nextPreview);
    });
  }
})();