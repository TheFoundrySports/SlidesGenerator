/**
 * Browser runtime inlined into every built deck: scale-to-fit, keyboard and touch navigation
 * (swipe, tap on the left/right side), progressive `steps` reveal and the slide counter.
 *
 * It ships as a string so the very same text can be inlined by the CLI (Node) and by the
 * Vite preview (browser) without a bundling step. Keep it ES5-style and dependency-free.
 */
export const RUNTIME_SOURCE = `
(function () {
  'use strict';
  var stage = document.querySelector('.stage');
  if (!stage) return;
  var slides = Array.prototype.slice.call(stage.querySelectorAll('.slide'));
  var total = slides.length;
  var cNow = document.getElementById('cNow');
  var cTotal = document.getElementById('cTotal');
  var cur = 0;

  function pad(n) { return String(n).length < 2 ? '0' + n : String(n); }
  if (cTotal) cTotal.textContent = pad(total);

  function fit() {
    var s = Math.min(window.innerWidth / stage.offsetWidth, window.innerHeight / stage.offsetHeight);
    stage.style.setProperty('--scale', String(s));
  }
  window.addEventListener('resize', fit);
  fit();

  function stepsOf(i) {
    return slides[i].hasAttribute('data-steps')
      ? Array.prototype.slice.call(slides[i].querySelectorAll('[data-step]'))
      : [];
  }

  function show(i, revealAll) {
    cur = Math.max(0, Math.min(total - 1, i));
    slides.forEach(function (s, j) { s.classList.toggle('is-active', j === cur); });
    stepsOf(cur).forEach(function (el) { el.classList.toggle('is-revealed', !!revealAll); });
    if (cNow) cNow.textContent = pad(cur + 1);
    if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + (cur + 1));
  }

  function next() {
    var hidden = stepsOf(cur).filter(function (el) { return !el.classList.contains('is-revealed'); });
    if (hidden.length) { hidden[0].classList.add('is-revealed'); return; }
    show(cur + 1, false);
  }

  function prev() {
    var shown = stepsOf(cur).filter(function (el) { return el.classList.contains('is-revealed'); });
    if (shown.length) { shown[shown.length - 1].classList.remove('is-revealed'); return; }
    show(cur - 1, true);
  }

  document.addEventListener('keydown', function (e) {
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': next(); e.preventDefault(); break;
      case 'ArrowLeft': case 'PageUp': prev(); e.preventDefault(); break;
      case 'Home': show(0, false); e.preventDefault(); break;
      case 'End': show(total - 1, true); e.preventDefault(); break;
      case 'f': case 'F':
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
        else { document.exitFullscreen && document.exitFullscreen(); }
        break;
    }
  });

  // Touch: swipe left/right to move; a plain tap on the left third goes back, anywhere else forward.
  var touch = null;
  document.addEventListener('touchstart', function (e) {
    touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() } : null;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!touch || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - touch.x;
    var dy = e.changedTouches[0].clientY - touch.y;
    var x = touch.x;
    var quick = Date.now() - touch.t < 400;
    touch = null;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); return; }
    if (quick && Math.abs(dx) < 10 && Math.abs(dy) < 10) { if (x < window.innerWidth / 3) prev(); else next(); }
  }, { passive: true });

  var fromHash = parseInt((window.location.hash || '').replace('#', ''), 10);
  show(isNaN(fromHash) ? 0 : fromHash - 1, false);
})();
`;
