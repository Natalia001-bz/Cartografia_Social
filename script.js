'use strict';

/* ─── UTILIDADES ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── DATOS DE CARTOGRAFÍA ───────────────────────────────────────────────── */

const PIN_POSITIONS = {
  mexico:    { left: '22%', top: '12%' },
  cuba:      { left: '45%', top: '10%' },
  guatemala: { left: '25%', top: '21%' },
  costarica: { left: '27%', top: '27%' },
  panama:    { left: '30%', top: '31%' },
  colombia:  { left: '31%', top: '38%' },
  venezuela: { left: '42%', top: '34%' },
  peru:      { left: '27%', top: '53%' },
  brasil:    { left: '57%', top: '50%' },
  bolivia:   { left: '38%', top: '59%' },
  chile:     { left: '26%', top: '76%' },
  argentina: { left: '37%', top: '76%' },
  uruguay:   { left: '46%', top: '72%' },
};

const mapData = {

  /* 1930–1950 */
  '1920': {
    description: '1930–1950',
    pins: [
      {
        id: 'mexico',
        label: 'México',
        info: `Fundación de la Escuela Nacional de Ciencias Políticas y Sociales (UNAM, 1951) en un contexto de consolidación del Estado posrevolucionario y expansión de la educación superior.`
      },
      {
        id: 'panama',
        label: 'Panamá',
        info: `En 1935 se introducen asignaturas de ciencia política en la Facultad de Derecho, reflejo de la influencia estadounidense en la región.`
      },
      {
        id: 'uruguay',
        label: 'Uruguay',
        info: `En 1957 se crea la primera cátedra en la Facultad de Derecho de la Universidad de la República, en un país con tradición democrática temprana.`
      },
      {
        id: 'argentina',
        label: 'Argentina',
        info: `En 1957 se funda el Instituto de Ciencia Política en la Universidad del Salvador, en un contexto de crisis política tras el derrocamiento de Perón.`
      }
    ]
  },

  /* 1960–1970 */
  '1960': {
    description: '1960–1970',
    pins: [
      { id: 'argentina', label: 'Argentina', info: `Se crean licenciaturas y doctorados; la dictadura de Onganía (1966) provoca exilios y parálisis académica.` },
      { id: 'chile', label: 'Chile', info: `Fundación de la ELACP en FLACSO (1966) y del Instituto de Ciencia Política en la Universidad Católica (1969). El golpe de 1973 cierra la ELACP.` },
      { id: 'colombia', label: 'Colombia', info: `En 1968 se crea el Departamento de Ciencia Política en la Universidad de los Andes, en medio de un contexto de movilización estudiantil y violencia política.` },
      { id: 'venezuela', label: 'Venezuela', info: `Fundación del IEP (1958) y del Departamento de Estudios Políticos en la UCV (1959), en el marco de la transición democrática tras la caída de Pérez Jiménez.` },
      { id: 'brasil', label: 'Brasil', info: `En 1969 se funda el Departamento en la Universidad Federal de Minas Gerais y el IUPERJ en Río; pese al régimen militar, se expanden redes académicas.` },
      { id: 'guatemala', label: 'Guatemala', info: `En 1968 se crean escuelas de Ciencia Política, en medio de procesos de modernización universitaria.` },
      { id: 'costarica', label: 'Costa Rica', info: `En 1968 se crean escuelas de Ciencia Política, en medio de procesos de modernización universitaria.` },
      { id: 'cuba', label: 'Cuba', info: `En 1961 se crean escuelas de Ciencia Política, pero en los 70 son absorbidas por el Partido Comunista, perdiendo autonomía académica.` }
    ]
  },

  /* 1980–1990 */
  '1980': {
    description: '1980–1990',
    pins: [
      { id: 'argentina', label: 'Argentina', info: `Retorno democrático en 1983; en 1984 se presenta el Informe Strasser en la UBA para institucionalizar la carrera.` },
      { id: 'chile', label: 'Chile', info: `Fundación del Instituto de Ciencia Política en la Universidad de Chile (1981), posgrados en la Católica (1982) y la Asociación Chilena de Ciencia Política (1986).` },
      { id: 'uruguay', label: 'Uruguay', info: `En 1985 se crea el Instituto de Ciencia Política en la Facultad de Ciencias Sociales; en 1991 la Revista Uruguaya de Ciencia Política.` },
      { id: 'colombia', label: 'Colombia', info: `Décadas de 1980–1990: expansión de programas en universidades públicas y privadas, en medio de violencia política y auge del narcotráfico.` },
      { id: 'bolivia', label: 'Bolivia', info: `Entre 1983–1986 se crean carreras en universidades nacionales, coincidiendo con la transición democrática.` },
      { id: 'peru', label: 'Perú', info: `En los años 90 se consolidan programas autónomos, en un contexto de crisis política y el régimen de Fujimori.` }
    ]
  },

  /* Siglo XXI */
  '2000': {
    description: 'Siglo XXI',
    pins: [
      { id: 'mexico', label: 'México', info: `Consolidación de FLACSO-México y expansión de posgrados en UNAM y UAM; fuerte producción en políticas públicas y democracia.` },
      { id: 'argentina', label: 'Argentina', info: `Expansión de programas en UBA y universidades privadas; fortalecimiento de la Asociación Argentina de Ciencia Política.` },
      { id: 'chile', label: 'Chile', info: `La Revista de Ciencia Política (UC) se convierte en referente regional; análisis de transición y consolidación democrática.` },
      { id: 'brasil', label: 'Brasil', info: `La Asociación Brasileña de Ciencia Política (ABCP) lidera congresos internacionales; IUPERJ se consolida como centro de investigación.` },
      { id: 'colombia', label: 'Colombia', info: `Crecimiento de programas en universidades regionales; fortalecimiento de la Asociación Colombiana de Ciencia Política (ACCP).` },
      { id: 'uruguay', label: 'Uruguay', info: `Revistas y asociaciones nacionales consolidan la disciplina.` },
      { id: 'venezuela', label: 'Venezuela', info: `La crisis política limita su desarrollo.` }
    ]
  }
};
/* ─── MAPA INTERACTIVO ─── */
function initMap() {
  const tabs     = $$('.tab-btn');
  const pinsEl   = $('#mapPins');
  const periodEl = $('#periodDesc');
  const legendEl = $('#legendItems');

  let activePeriod = '1920';

  function renderPins(period) {
    pinsEl.innerHTML   = '';
    legendEl.innerHTML = '';

    const data = mapData[period];
    if (!data) return;

    periodEl.textContent = data.description;

    data.pins.forEach(pin => {
      const pos = PIN_POSITIONS[pin.id];
      if (!pos) return;

      const pinEl = document.createElement('div');
      pinEl.className = 'map-pin';
      pinEl.style.left = pos.left;
      pinEl.style.top  = pos.top;
      pinEl.setAttribute('role', 'button');
      pinEl.setAttribute('tabindex', '0');

      pinEl.innerHTML = `
        <div class="pin-icon">${pin.label.charAt(0)}</div>
        <span class="pin-label">${pin.label}</span>
      `;

      const openModal = () => openCountryModal(pin.label, pin.info);
      pinEl.addEventListener('click', openModal);
      pinEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openModal();
      });

      pinsEl.appendChild(pinEl);

      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<span class="legend-dot"></span><span>${pin.label}</span>`;
      item.addEventListener('click', openModal);
      legendEl.appendChild(item);
    });
  }

  function setActivePeriod(period) {
    activePeriod = period;
    renderPins(period);
    tabs.forEach(t => t.classList.toggle('active', t.dataset.period === period));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => setActivePeriod(tab.dataset.period));
  });

  setActivePeriod('1920');
}

/* ─── MODAL ─── */
function openCountryModal(title, body) {
  const overlay = $('#countryModalOverlay');
  $('#countryModalTitle').textContent = title;
  $('#countryModalBody').innerHTML    = body;
  overlay.classList.add('open');
}

function initCountryModal() {
  const overlay = $('#countryModalOverlay');

  $('#countryModalClose').addEventListener('click', () => {
    overlay.classList.remove('open');
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });
}

/* ─── RESTO IGUAL ─── */
function initActiveNav(){/* igual */}
function initHamburger(){/* igual */}
function initSmoothScroll(){/* igual */}
function initCarousel(){/* igual */}
function initConfig(){/* igual */}
function initAnimations(){/* igual */}

document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initHamburger();
  initSmoothScroll();
  initCarousel();
  initMap();
  initCountryModal();
  initConfig();
  initAnimations();
});


/* ─── NAVEGACIÓN ACTIVA (IntersectionObserver) ─── */
function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = navLinks.find(link => link.dataset.section === entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ─── MENÚ HAMBURGUESA ─── */
function initHamburger() {
  const hamburger = $('#hamburger');
  const sidebar   = $('#sidebar');
  const overlay   = $('#navOverlay');

  function toggle() {
    const open = sidebar.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    overlay.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
  }

  function close() {
    sidebar.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', false);
  }

  hamburger.addEventListener('click', toggle);
  overlay.addEventListener('click', close);

  // Cerrar al hacer click en un link (móvil)
  $$('.nav-link').forEach(link => link.addEventListener('click', close));
}

/* ─── SMOOTH SCROLL ─── */
function initSmoothScroll() {
  $$('.nav-link, .hero-cta').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── CARRUSEL (Modal Presentación) ─── */
function initCarousel() {
  const modal   = $('#modalOverlay');
  const track   = $('#carouselTrack');
  const dotsEl  = $('#carouselDots');
  const btnOpen  = $('#btnOpenModal');
  const btnClose = $('#modalClose');
  const btnPrev  = $('#carouselPrev');
  const btnNext  = $('#carouselNext');
  const thumbs   = $$('.slide-thumb');

  const slides = $$('.slide', track);
  let current = 0;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    $$('.dot', dotsEl).forEach((d, i) => d.classList.toggle('active', i === current));
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  // Swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'Escape')     closeModal();
  });

  // Thumbs
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      openModal();
      goTo(i);
    });
  });

  function openModal()  { modal.classList.add('open'); modal.setAttribute('aria-hidden', false); goTo(0); }
  function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', true); }

  btnOpen.addEventListener('click', openModal);
  btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
}

/* ─── CONFIGURACIÓN (Modo oscuro + Tamaño texto) ─── */
function initConfig() {
  const btnConfig  = $('#btnConfig');
  const configPanel = $('#configPanel');
  const configClose = $('#configClose');
  const darkToggle  = $('#darkModeToggle');
  const fsIncrease  = $('#fsIncrease');
  const fsDecrease  = $('#fsDecrease');
  const fsCurrent   = $('#fsCurrent');

  // Cargar preferencias guardadas
  const savedDark = localStorage.getItem('darkMode') === 'true';
  const savedFs   = parseInt(localStorage.getItem('fontSize') || '100', 10);
  let fontSize = savedFs;

  if (savedDark) { document.body.classList.add('dark-mode'); darkToggle.checked = true; }
  applyFontSize(fontSize);

  // Abrir/cerrar panel
  btnConfig.addEventListener('click', () => {
    configPanel.classList.toggle('open');
    configPanel.setAttribute('aria-hidden', !configPanel.classList.contains('open'));
  });
  configClose.addEventListener('click', () => {
    configPanel.classList.remove('open');
    configPanel.setAttribute('aria-hidden', true);
  });

  // Modo oscuro
  darkToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', darkToggle.checked);
    localStorage.setItem('darkMode', darkToggle.checked);
  });

  // Tamaño de texto
  function applyFontSize(size) {
    document.documentElement.style.fontSize = (size / 100) * 16 + 'px';
    fsCurrent.textContent = size + '%';
    localStorage.setItem('fontSize', size);
  }

  fsIncrease.addEventListener('click', () => {
    if (fontSize >= 130) return;
    fontSize += 10;
    applyFontSize(fontSize);
  });

  fsDecrease.addEventListener('click', () => {
    if (fontSize <= 80) return;
    fontSize -= 10;
    applyFontSize(fontSize);
  });
}

/* ─── ANIMACIONES DE ENTRADA (cards) ─── */
function initAnimations() {
  const targets = $$('.card, .team-card, .conclusion-card, .history-block, .bib-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

/* ─── INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initHamburger();
  initSmoothScroll();
  initCarousel();
  initMap();
  initCountryModal();
  initConfig();
  initAnimations();

  console.log('✅ Ciencia Política en Latinoamérica — Sitio cargado correctamente.');
});



// // Correciones _______________________

// //________ MODALES___________
// function initCarousel() {
//   const modal = $('#modalOverlay');
//   const openBtn = $('#btnOpenModal');
//   const closeBtn = $('#modalClose');

//   const track = $('#carouselTrack');
//   const slides = $$('.slide');
//   const prev = $('#carouselPrev');
//   const next = $('#carouselNext');
//   const dotsContainer = $('#carouselDots');

//   let index = 0;

//   function update() {
//     track.style.transform = `translateX(-${index * 100}%)`;
//     $$('.dot').forEach((d, i) => {
//       d.classList.toggle('active', i === index);
//     });
//   }

//   function createDots() {
//     slides.forEach((_, i) => {
//       const dot = document.createElement('div');
//       dot.className = 'dot';
//       if (i === 0) dot.classList.add('active');
//       dot.addEventListener('click', () => {
//         index = i;
//         update();
//       });
//       dotsContainer.appendChild(dot);
//     });
//   }

//   openBtn.addEventListener('click', () => {
//     modal.classList.add('open');
//   });

//   closeBtn.addEventListener('click', () => {
//     modal.classList.remove('open');
//   });

//   modal.addEventListener('click', (e) => {
//     if (e.target === modal) modal.classList.remove('open');
//   });

//   prev.addEventListener('click', () => {
//     index = (index - 1 + slides.length) % slides.length;
//     update();
//   });

//   next.addEventListener('click', () => {
//     index = (index + 1) % slides.length;
//     update();
//   });

//   document.addEventListener('keydown', (e) => {
//     if (!modal.classList.contains('open')) return;
//     if (e.key === 'Escape') modal.classList.remove('open');
//   });

//   createDots();
// }

// //______________  Coonfiguraciones _______

// function initConfig() {
//   const panel = $('#configPanel');
//   const btn = $('#btnConfig');
//   const close = $('#configClose');

//   const toggle = $('#darkModeToggle');
//   const increase = $('#fsIncrease');
//   const decrease = $('#fsDecrease');
//   const current = $('#fsCurrent');

//   let size = 100;

//   btn.addEventListener('click', () => panel.classList.toggle('open'));
//   close.addEventListener('click', () => panel.classList.remove('open'));

//   toggle.addEventListener('change', () => {
//     document.body.classList.toggle('dark-mode');
//   });

//   increase.addEventListener('click', () => {
//     size += 10;
//     document.documentElement.style.fontSize = size + '%';
//     current.textContent = size + '%';
//   });

//   decrease.addEventListener('click', () => {
//     size -= 10;
//     document.documentElement.style.fontSize = size + '%';
//     current.textContent = size + '%';
//   });
// }