/* =============================================================
   SITE.JS — Interacciones ligeras del ecosistema
   Reveal on scroll + año dinámico del footer.
   ============================================================= */
(function () {
  'use strict';

  /* ── Reveal on scroll ─────────────────────────────────────── */
  var items = document.querySelectorAll('.reveal');
  if (items.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Año dinámico ─────────────────────────────────────────── */
  var y = document.querySelectorAll('[data-year]');
  y.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
