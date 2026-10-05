// presenter-shared.js
// Pure helpers for the SlidesChurch presenter app.
// Dual-environment: Node (CommonJS) and browser (window globals).
//
// Why regex and not DOMParser?
//   This module is the *pure* layer. It must run in `node --test` without
//   bringing in jsdom. We only need raw text fragments out of the deck HTML:
//   <style> blocks and <section class="slide"> blocks. The catechism decks
//   use well-formed tags, so a simple non-greedy extraction is enough. In
//   the browser, `presenter.js` parses those fragments with DOMParser and
//   clones them into the stage.
//
// The browser side will never feed malformed HTML here — decks are authored
// by hand and follow a fixed pattern.

(function (factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') Object.assign(window, api);
})(function () {
  'use strict';

  // ── parseDeckHtml ──────────────────────────────────────────────────
  // Returns { styles: string[], slides: { attrs, inner, outerHtml }[] }.
  // `styles` contains the CSS body of every <style>...</style> block.
  // `slides` contains every <section> whose class list includes "slide".
  function parseDeckHtml(htmlString) {
    if (typeof htmlString !== 'string') {
      throw new TypeError('parseDeckHtml: expected string');
    }

    const styles = [];
    const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let m;
    while ((m = styleRe.exec(htmlString)) !== null) {
      styles.push(m[1]);
    }

    const slides = [];
    const sectionRe = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
    while ((m = sectionRe.exec(htmlString)) !== null) {
      const attrs = m[1];
      if (/\bclass\s*=\s*["'][^"']*\bslide\b/.test(attrs)) {
        slides.push({ attrs, inner: m[2], outerHtml: m[0] });
      }
    }

    return { styles, slides };
  }

  // ── parseSidecar ───────────────────────────────────────────────────
  // Accepts JSON text. Supports two forms:
  //   1. Bare array:                ["notes 1", "notes 2", ...]
  //   2. Object with .slides array: { deck: "...", slides: [...] }
  // Returns string[] of length `total`, padded with "" on the right if the
  // sidecar is shorter. Throws on malformed JSON.
  function parseSidecar(jsonText, total) {
    if (typeof jsonText !== 'string') {
      throw new TypeError('parseSidecar: expected string');
    }
    if (!Number.isInteger(total) || total < 0) {
      throw new TypeError('parseSidecar: total must be a non-negative integer');
    }
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      throw new SyntaxError('parseSidecar: invalid JSON: ' + e.message);
    }
    let raw;
    if (Array.isArray(data)) {
      raw = data;
    } else if (data && Array.isArray(data.slides)) {
      raw = data.slides;
    } else if (data == null) {
      raw = [];
    } else {
      throw new TypeError('parseSidecar: expected array or {slides: [...]}');
    }
    const padded = Array.from({ length: total }, () => '');
    for (let i = 0; i < Math.min(raw.length, total); i++) {
      padded[i] = raw[i] == null ? '' : String(raw[i]);
    }
    return padded;
  }

  // ── emptySidecar ───────────────────────────────────────────────────
  // Produces a copyable sidecar JSON template with `total` empty slots.
  function emptySidecar(total, deckName) {
    if (!Number.isInteger(total) || total < 0) {
      throw new TypeError('emptySidecar: total must be a non-negative integer');
    }
    return JSON.stringify(
      { deck: deckName || '', slides: Array.from({ length: total }, () => '') },
      null,
      2
    );
  }

  // ── computeStageScale ──────────────────────────────────────────────
  // 1920x1080 canvas, scale-to-fit while preserving aspect ratio.
  function computeStageScale(viewportW, viewportH, canvasW, canvasH) {
    canvasW = canvasW || 1920;
    canvasH = canvasH || 1080;
    if (!(viewportW > 0) || !(viewportH > 0)) return 1;
    return Math.min(viewportW / canvasW, viewportH / canvasH);
  }

  // ── createBus ──────────────────────────────────────────────────────
  // Cross-environment message bus. Uses BroadcastChannel when available
  // (browsers, modern Node). Falls back to a local pub-sub that does not
  // deliver across processes. Used by the presenter popup sync.
  function createBus(name) {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(name);
      const listeners = new Set();
      bc.addEventListener('message', function (e) {
        listeners.forEach(function (fn) { fn(e); });
      });
      return {
        send: function (msg) { bc.postMessage(msg); },
        onMessage: function (fn) { listeners.add(fn); },
        close: function () { listeners.clear(); bc.close(); }
      };
    }
    const listeners = new Set();
    return {
      send: function () { /* no-op in fallback */ },
      onMessage: function (fn) { listeners.add(fn); },
      close: function () { listeners.clear(); }
    };
  }

  return {
    parseDeckHtml,
    parseSidecar,
    emptySidecar,
    computeStageScale,
    createBus
  };
});