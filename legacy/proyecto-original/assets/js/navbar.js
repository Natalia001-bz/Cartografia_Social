/* =============================================================
   NAVBAR GLOBAL — Ecosistema Ciencia Política Latinoamérica
   Autocontenido: IDs/clases propias (gnav*) para no colisionar
   con el script.js interno de Cartografía Social.
   ============================================================= */
(function () {
  'use strict';

  var nav = document.getElementById('gnav');
  if (!nav) return;

  var toggle   = document.getElementById('gnavToggle');
  var menu     = document.getElementById('gnavMenu');
  var backdrop = document.getElementById('gnavBackdrop');

  /* ── Pestaña activa ─────────────────────────────────────────
     Se determina por el atributo data-active del <header>, con
     respaldo automático según la página actual. */
  var active = nav.getAttribute('data-active');
  if (!active) {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (path.indexOf('podcast') === 0) active = 'podcast';
    else if (path.indexOf('mini-documental') === 0) active = 'mini-documental';
    else if (location.pathname.indexOf('cartografia-social') !== -1) active = 'cartografia';
    else active = 'inicio';
  }
  var links = menu ? menu.querySelectorAll('a[data-nav]') : [];
  links.forEach(function (a) {
    if (a.getAttribute('data-nav') === active) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ── Menú hamburguesa (móvil) ───────────────────────────────── */
  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-visible', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('gnav-locked', open);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  /* ── Sombra al hacer scroll ─────────────────────────────────── */
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
