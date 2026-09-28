/* =============================================================
   PORTAFOLIO — tema claro/oscuro, filtros, búsqueda y animaciones
   ============================================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ── Tema claro / oscuro (se recuerda en este navegador) ── */
  var toggle = document.getElementById('themeToggle');
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    }
    try { localStorage.setItem('portafolio-tema', theme); } catch (e) { /* almacenamiento no disponible */ }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
    toggle.setAttribute('aria-label', root.getAttribute('data-theme') === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  }

  /* ── Sombra de la barra al hacer scroll ── */
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Portadas que no cargan: se muestra el ícono del trabajo ── */
  document.querySelectorAll('.work-cover img').forEach(function (img) {
    function broken() { img.parentElement.classList.add('is-broken'); }
    if (img.complete && img.naturalWidth === 0) broken();
    img.addEventListener('error', broken);
  });

  /* ── Filtros por institución + búsqueda ── */
  var works = Array.prototype.slice.call(document.querySelectorAll('.work'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var search = document.getElementById('search');
  var empty = document.getElementById('empty');
  var filter = 'todos';

  function normalize(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function apply() {
    var q = normalize(search ? search.value.trim() : '');
    var shown = 0;
    works.forEach(function (w) {
      var okFilter = filter === 'todos' || w.getAttribute('data-inst') === filter;
      var okSearch = !q || normalize(w.textContent).indexOf(q) !== -1;
      w.hidden = !(okFilter && okSearch);
      if (!w.hidden) shown++;
    });
    if (empty) empty.classList.toggle('is-visible', shown === 0);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filter = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      apply();
    });
  });
  if (search) search.addEventListener('input', apply);

  /* ── Aparición al hacer scroll ── */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Conteo automático de trabajos y año ── */
  document.querySelectorAll('[data-count="trabajos"]').forEach(function (el) { el.textContent = works.length; });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
