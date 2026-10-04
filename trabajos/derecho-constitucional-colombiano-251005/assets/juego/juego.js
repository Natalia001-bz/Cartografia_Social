'use strict';
/* =========================================================
   El Encanto: la defensa del territorio · motor del recorrido
   ========================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pausa = ms => new Promise(r => setTimeout(r, ms));
const clic = el => new Promise(r => el.addEventListener('click', r, { once: true }));
const SIN_MOVIMIENTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CLAVE = 'encanto-recorrido-v1';
const ENERGIA_MAX = 5;

/* ---------- Estado ---------- */
const NUEVO = () => ({ avatar: null, semillas: 0, energia: ENERGIA_MAX, inv: { pista: 1, asesoria: 0, agua: 0 },
  hechos: {}, insignias: [], normasVistas: [], mejorRuta: 0, sonido: true, musica: true, intro: false });
let nivelActual = 0, ganadoNivel = 0;
const COSTO_ASISTENCIA = 10, COSTO_GUIA = 5;
let E = NUEVO();
try { const g = JSON.parse(localStorage.getItem(CLAVE)); if (g && g.inv) E = Object.assign(NUEVO(), g); } catch (e) { /* sin almacenamiento */ }
const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) { /* sin almacenamiento */ } };
const yo = () => PERSONAJES[E.avatar];
const vecinos = () => AVATARES.filter(a => a !== E.avatar);

/* ---------- Sonido (sintetizado, sin archivos) ---------- */
const Audio_ = {
  ctx: null, musicaNodo: null, temporizador: null, realce: 1.5,
  iniciar() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tono(f, dur, tipo = 'sine', vol = 0.12, cuando = 0, destino) {
    if (!this.ctx) return;
    if (!destino) vol = Math.min(0.5, vol * this.realce);
    const t = this.ctx.currentTime + cuando;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(destino || this.ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  },
  sfx(n) {
    if (!E.sonido || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const s = {
      clic: () => this.tono(520, 0.07, 'triangle', 0.06),
      paso: () => this.tono(330, 0.09, 'sine', 0.05),
      bien: () => { this.tono(523, 0.14, 'triangle'); this.tono(659, 0.14, 'triangle', 0.12, 0.1); this.tono(784, 0.25, 'triangle', 0.12, 0.2); },
      mal: () => { this.tono(196, 0.22, 'sawtooth', 0.07); this.tono(155, 0.3, 'sawtooth', 0.07, 0.12); },
      premio: () => [523, 659, 784, 1047, 1319].forEach((f, i) => this.tono(f, 0.3, 'triangle', 0.1, i * 0.09)),
      lanzar: () => { if (!this.ctx) return; const t = this.ctx.currentTime, o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.25);
        g.gain.setValueAtTime(Math.min(0.4, 0.07 * this.realce), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + 0.32); },
      golpe: () => { this.tono(140, 0.25, 'sine', 0.2); this.tono(880, 0.4, 'triangle', 0.08, 0.05); },
      compra: () => { this.tono(880, 0.08, 'square', 0.05); this.tono(1175, 0.15, 'square', 0.05, 0.08); },
      nivel: () => { [196, 262, 349, 523].forEach((f, i) => this.tono(f, 0.5, 'sine', 0.09, i * 0.11)); },
      gota: () => { this.tono(900, 0.08, 'sine', 0.1); this.tono(600, 0.15, 'sine', 0.08, 0.06); }
    }[n];
    if (s) s();
  },
  // Música generada: Re menor · Si bemol · Fa · Do, a 110 pulsos por minuto.
  // Comparte tonalidad (Fa mayor) y tempo con la pista de la balanza para que el paso de una a otra sea natural.
  generativa(activa) {
    clearInterval(this.temporizador); this.temporizador = null;
    if (this.musicaNodo) { this.musicaNodo.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8); this.musicaNodo = null; }
    if (!activa || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const salida = this.ctx.createGain(); salida.gain.value = 0;
    salida.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 1.5);
    const filtro = this.ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 1500;
    salida.connect(filtro); filtro.connect(this.ctx.destination);
    this.musicaNodo = salida;
    const pulso = 60 / 110, compasDoble = pulso * 8;
    const acordes = [[146.8, 174.6, 220], [116.5, 146.8, 174.6], [174.6, 220, 261.6], [130.8, 164.8, 196]];
    const bajos = [73.4, 58.3, 87.3, 65.4];
    const escala = [349.2, 392, 440, 523.3, 587.3, 698.5];
    let paso = 0;
    const compas = () => {
      if (this.musicaNodo !== salida) return;
      const k = paso % acordes.length;
      acordes[k].forEach(f => { this.tono(f, compasDoble, 'sine', 0.05, 0, salida); this.tono(f * 1.003, compasDoble, 'triangle', 0.018, 0, salida); });
      [0, 4].forEach(b => this.tono(bajos[k], 0.5, 'sine', 0.09, b * pulso, salida));
      [2, 6].forEach(b => this.tono(bajos[k] * 2, 0.22, 'sine', 0.03, b * pulso, salida));
      for (let b = 0; b < 8; b++) if (Math.random() > 0.55) this.tono(escala[Math.floor(Math.random() * escala.length)], 0.8, 'triangle', 0.032, b * pulso, salida);
      paso++;
    };
    compas(); this.temporizador = setInterval(compas, compasDoble * 1000);
  },
  // Pista grabada para el nivel de la balanza (se descarga solo al entrar a ese nivel).
  pista: null, desvanecer: null,
  pistaBalanza(activa) {
    clearInterval(this.desvanecer);
    if (activa && !this.pista) { this.pista = new Audio(PISTA_BALANZA); this.pista.loop = true; this.pista.volume = 0; this.pista.preload = 'auto'; }
    const p = this.pista; if (!p) return;
    const meta = activa ? 0.14 : 0;
    if (activa) p.play().catch(() => {});
    this.desvanecer = setInterval(() => {
      const v = p.volume + Math.sign(meta - p.volume) * 0.02;
      if (Math.abs(meta - p.volume) <= 0.02) { p.volume = meta; clearInterval(this.desvanecer); if (!activa) p.pause(); } else p.volume = Math.max(0, Math.min(1, v));
    }, 60);
  },
  atenuar(si) {
    if (this.musicaNodo) this.musicaNodo.gain.setTargetAtTime(si ? 0.1 : 0.5, this.ctx.currentTime, 0.4);
  },
  // Decide qué debe sonar según el lugar del recorrido y la preferencia del jugador.
  ambiente() {
    const enBalanza = document.body.dataset.modo === 'nivel3';
    this.realce = enBalanza ? 2.6 : 1.5;
    this.pistaBalanza(E.musica && enBalanza);
    const quiereGen = E.musica && !enBalanza && !!this.ctx;
    if (quiereGen && !this.musicaNodo) this.generativa(true);
    if (!quiereGen && this.musicaNodo) this.generativa(false);
  }
};

/* ---------- Elementos fijos ---------- */
const videosAusentes = new Set(), ambientesOidos = new Set();
let ambienteT = null;
const elFondo = $('#fondo'), elImg = $('#escenaImg'), elVideo = $('#escenaVideo'), elMarco = $('.marco'), elCapa = $('#capa'), elRotulo = $('#rotulo'),
  elPanel = $('#panel'), elModal = $('#modal'), elCaja = $('#modalCaja'), elAvisos = $('#avisos'), elHud = $('#hud');

let escenaActual = '';
function escena(img, rotulo = '') {
  const src = IMG + img; escenaActual = src;
  elFondo.style.backgroundImage = `url("${src}")`;
  if (!elImg.src.endsWith(src)) {
    elImg.classList.add('cambio');
    setTimeout(() => { elImg.src = src; elImg.classList.remove('cambio'); }, SIN_MOVIMIENTO ? 0 : 220);
  }
  elRotulo.textContent = rotulo; elRotulo.hidden = !rotulo;
  const base = img.replace(/\.\w+$/, '');
  clearTimeout(ambienteT); elVideo.pause(); elVideo.muted = true; elVideo.classList.remove('visible'); elMarco.classList.remove('con-video');
  elVideo.onended = elVideo.ontimeupdate = elVideo.oncanplay = null;
  if (!ANIMABLES.includes(base) || videosAusentes.has(base) || SIN_MOVIMIENTO) { elVideo.removeAttribute('src'); return; }
  elVideo.oncanplay = () => {
    if (escenaActual !== src || elVideo.classList.contains('visible')) return;
    elMarco.classList.add('con-video'); elVideo.classList.add('visible');
    // Sonido ambiente del video: solo la primera vez que se llega a la escena, unos segundos, y luego se apaga.
    if (E.sonido && CON_AMBIENTE.includes(base) && !ambientesOidos.has(base) && Audio_.ctx) {
      ambientesOidos.add(base); elVideo.muted = false; elVideo.volume = 0.45; Audio_.atenuar(true);
      let pasos = 0;
      const bajar = () => { pasos++; elVideo.volume = Math.max(0, 0.45 - pasos * 0.03); if (elVideo.volume > 0) ambienteT = setTimeout(bajar, 100); else { elVideo.muted = true; Audio_.atenuar(false); } };
      ambienteT = setTimeout(bajar, 4500);
    }
    elVideo.play().catch(() => { elVideo.muted = true; Audio_.atenuar(false); elVideo.play().catch(() => {}); });
  };
  // Bucle sin salto: al acercarse el final se funde hacia la imagen fija y vuelve a empezar.
  elVideo.ontimeupdate = () => { if (elVideo.duration && elVideo.currentTime > elVideo.duration - 1) elVideo.classList.add('saliendo'); };
  elVideo.onended = () => { elVideo.muted = true; elVideo.currentTime = 0; elVideo.classList.remove('saliendo'); elVideo.play().catch(() => {}); };
  elVideo.onerror = () => { videosAusentes.add(base); elMarco.classList.remove('con-video'); };
  elVideo.classList.remove('saliendo'); elVideo.src = `${VIDEO}${base}.mp4`; elVideo.load();
}
function panel(html) { elPanel.innerHTML = html; elPanel.scrollTop = 0; return elPanel; }
function capa(html = '') { elCapa.innerHTML = html; return elCapa; }

function aviso(texto, tipo = '') {
  const a = document.createElement('div');
  a.className = `aviso ${tipo}`; a.textContent = texto; elAvisos.append(a);
  setTimeout(() => a.classList.add('fuera'), 2600); setTimeout(() => a.remove(), 3100);
}

/* ---------- Modal ---------- */
function modal(html, botones = [{ t: 'Continuar', v: true, c: 'primario' }], clase = '') {
  return new Promise(res => {
    elCaja.className = `modal-caja ${clase}`;
    elCaja.innerHTML = `<div class="modal-cuerpo">${html}</div><div class="modal-pie">${botones.map((b, i) =>
      `<button class="btn ${b.c || ''}" data-i="${i}">${b.t}</button>`).join('')}</div>`;
    elModal.hidden = false;
    $('.modal-cuerpo', elCaja).scrollTop = 0;
    const primero = $('.btn.primario', elCaja) || $('.btn', elCaja); if (primero) primero.focus({ preventScroll: true });
    $$('.modal-pie .btn', elCaja).forEach(b => b.addEventListener('click', () => {
      Audio_.sfx('clic'); elModal.hidden = true; res(botones[b.dataset.i].v);
    }));
  });
}

/* ---------- Tablero (HUD) ---------- */
function hud(nivelTexto) {
  if (!E.avatar) { elHud.hidden = true; return; }
  elHud.hidden = false;
  if (nivelTexto !== undefined) elHud.dataset.nivel = nivelTexto;
  $('#hudRetrato').src = IMG + yo().img;
  $('#hudNombre').textContent = yo().nombre;
  $('#hudNivel').textContent = elHud.dataset.nivel || 'El camino';
  $('#hudEnergia').innerHTML = Array.from({ length: ENERGIA_MAX }, (_, i) =>
    `<span class="gota ${i < E.energia ? '' : 'vacia'}">💧</span>`).join('');
  $('#hudEnergia').setAttribute('aria-label', `Energía: ${E.energia} de ${ENERGIA_MAX}`);
  $('#hudSemillas').textContent = E.semillas;
  $('#hudInsignias').textContent = E.insignias.length;
  const ay = $('#hudAyudas');
  ay.innerHTML = Object.keys(TIENDA).filter(k => E.inv[k] > 0).map(k =>
    `<button class="ayuda" data-ayuda="${k}" title="${TIENDA[k].nombre}: ${TIENDA[k].t}">${TIENDA[k].icono}<b>${E.inv[k]}</b></button>`).join('');
  $$('.ayuda', ay).forEach(b => b.addEventListener('click', () => usarAyuda(b.dataset.ayuda)));
  $('#btnSonido').setAttribute('aria-pressed', E.sonido); $('#btnSonido').textContent = E.sonido ? '🔊' : '🔇';
  $('#btnMusica').setAttribute('aria-pressed', E.musica);
  const bs = $('#saltarNivel'), enNivel = nivelActual > 1 && /^nivel/.test(document.body.dataset.modo || '');
  bs.hidden = !enNivel;
  if (enNivel) {
    const costo = costoSalto(), falta = costo - E.semillas;
    bs.setAttribute('aria-disabled', falta > 0);
    bs.innerHTML = falta > 0 ? `⏭ Saltar nivel · <b>te faltan ${falta} 🌱</b>` : `⏭ Saltar nivel · <b>${costo} 🌱</b>`;
    bs.title = falta > 0 ? `Saltar cuesta ${costo} semillas y tienes ${E.semillas}. Sigue jugando para ganarlas.` : `Saltar este nivel por ${costo} semillas: verás la conclusión, sin insignia ni premio.`;
  }
  guardar();
}
function ganar(n, motivo) {
  E.semillas += n; ganadoNivel += n; hud();
  const s = $('#hudSemillas').parentElement; s.classList.remove('salto'); void s.offsetWidth; s.classList.add('salto');
  if (motivo) aviso(`+${n} 🌱 ${motivo}`, 'bien');
}
async function perderEnergia() {
  E.energia = Math.max(0, E.energia - 1); hud(); Audio_.sfx('gota');
  $('#hudEnergia').classList.remove('sacude'); void $('#hudEnergia').offsetWidth; $('#hudEnergia').classList.add('sacude');
  if (E.energia > 0) return;
  if (E.inv.agua > 0) {
    await modal(`<p class="ante">Sin energía</p><h2>Tienes agua fresca en tu morral</h2><p>Bebes del cántaro y recuperas fuerzas para seguir.</p>`, [{ t: 'Beber y seguir', v: 1, c: 'primario' }]);
    E.inv.agua--; E.energia = 2;
  } else {
    const costo = Math.min(20, E.semillas);
    await modal(`<p class="ante">Sin energía</p><h2>La comunidad no te deja solo</h2>
      <p>Una vecina te ofrece agua de panela y un rato de sombra. Recuperas tres gotas de energía${costo ? ` y compartes ${costo} semillas con la olla comunitaria` : ''}.</p>`,
      [{ t: 'Retomar el camino', v: 1, c: 'primario' }]);
    E.semillas -= costo; E.energia = 3;
  }
  hud();
}

/* Ayudas: la pregunta activa registra aquí cómo atenderlas. */
let preguntaActiva = null;
function usarAyuda(k) {
  if (k === 'agua') {
    if (E.energia >= ENERGIA_MAX) return aviso('Tu energía ya está completa.');
    E.inv.agua--; E.energia++; Audio_.sfx('gota'); hud(); return aviso('Recuperas una gota de energía.', 'bien');
  }
  if (!preguntaActiva) return aviso(`Guarda tu ${TIENDA[k].nombre.toLowerCase()} para cuando haya una pregunta.`);
  preguntaActiva(k);
}

/* ---------- Diálogos ---------- */
function retrato(q) {
  if (q === 'n') return '';
  const p = q === 'yo' ? yo() : PERSONAJES[q];
  return `<img class="dlg-retrato" src="${IMG}${p.img}" alt="" />`;
}
function nombreDe(q) {
  if (q === 'n') return ['Narración', ''];
  const p = q === 'yo' ? yo() : PERSONAJES[q];
  return [p.nombre, q === 'yo' ? 'Tú' : p.rol];
}
async function decir(q, texto, boton = 'Continuar') {
  const [nom, rol] = nombreDe(q);
  panel(`<div class="dlg ${q === 'n' ? 'narra' : ''} ${q === 'yo' ? 'propio' : ''}">
      <div class="dlg-cab">${retrato(q)}<p><b>${nom}</b><span>${rol}</span></p></div>
      <p class="dlg-texto" id="dlgTexto"></p>
    </div>
    <button class="btn primario ancho" id="dlgSeguir">${boton} ›</button>`);
  const p = $('#dlgTexto'), b = $('#dlgSeguir');
  let listo = SIN_MOVIMIENTO, i = 0;
  if (listo) p.textContent = texto;
  else {
    const t = setInterval(() => {
      if (listo) { clearInterval(t); p.textContent = texto; return; }
      i += 2; p.textContent = texto.slice(0, i);
      if (i >= texto.length) { listo = true; clearInterval(t); }
    }, 22);
  }
  for (;;) { await clic(b); if (listo) break; listo = true; p.textContent = texto; }
  Audio_.sfx('paso');
}
async function charla(lineas) { for (const [q, t] of lineas) await decir(q, t); }

/* ---------- Preguntas ---------- */
// q: { t, o: [[texto, correcta, porqué]], pista }. Devuelve el número de fallos.
function preguntar(q, titulo = '') {
  return new Promise(res => {
    let fallos = 0, pistaVista = false;
    const orden = q.o.map((o, i) => i);
    panel(`${titulo ? `<p class="ante">${titulo}</p>` : ''}<h3 class="preg">${q.t}</h3>
      <div class="opciones">${orden.map(i => `<button class="opcion" data-i="${i}">${q.o[i][0]}</button>`).join('')}</div>
      <div class="respuesta" id="resp" aria-live="polite"></div>
      <div class="ayudas-preg" id="ayPreg"></div>`);
    const resp = $('#resp'), ay = $('#ayPreg');
    const pintarAyudas = invitar => {
      const b = [];
      if (q.pista && !pistaVista) b.push(E.inv.pista > 0
        ? `<button class="btn mini ${invitar ? 'late' : ''}" data-a="pista">🔎 Usar pista (${E.inv.pista})</button>`
        : (E.semillas >= TIENDA.pista.precio ? `<button class="btn mini" data-c="pista">🔎 Comprar pista · ${TIENDA.pista.precio} 🌱</button>` : ''));
      const quedan = $$('.opcion:not(:disabled)', elPanel).length;
      if (quedan > 2) b.push(E.inv.asesoria > 0
        ? `<button class="btn mini ${invitar ? 'late' : ''}" data-a="asesoria">⚖️ Pedir asesoría (${E.inv.asesoria})</button>`
        : (E.semillas >= TIENDA.asesoria.precio ? `<button class="btn mini" data-c="asesoria">⚖️ Contratar asesoría · ${TIENDA.asesoria.precio} 🌱</button>` : ''));
      ay.innerHTML = b.join('');
      $$('[data-a]', ay).forEach(x => x.addEventListener('click', () => ayuda(x.dataset.a)));
      $$('[data-c]', ay).forEach(x => x.addEventListener('click', () => {
        const k = x.dataset.c; E.semillas -= TIENDA[k].precio; E.inv[k]++; Audio_.sfx('compra'); hud(); ayuda(k);
      }));
    };
    const ayuda = k => {
      if (k === 'pista') {
        if (!q.pista || pistaVista) return aviso('Ya usaste la pista de esta pregunta.');
        if (E.inv.pista < 1) return aviso('No te quedan pistas. Pasa por el consultorio.');
        E.inv.pista--; pistaVista = true; Audio_.sfx('clic');
        resp.innerHTML = `<div class="nota-lucia"><img src="${IMG}${PERSONAJES.asesora.img}" alt="" /><p><b>Lucía:</b> ${q.pista}</p></div>`;
      } else if (k === 'asesoria') {
        const malas = $$('.opcion:not(:disabled)', elPanel).filter(b => !q.o[b.dataset.i][1]);
        if (malas.length < 2) return aviso('Ya solo queda una opción por descartar: confía en ti.');
        if (E.inv.asesoria < 1) return aviso('No tienes asesorías. Pasa por el consultorio.');
        E.inv.asesoria--; Audio_.sfx('clic');
        const b = malas[0]; b.disabled = true; b.classList.add('descartada');
        resp.innerHTML = `<div class="nota-lucia"><img src="${IMG}${PERSONAJES.asesora.img}" alt="" /><p><b>Lucía:</b> Descarta esta: «${q.o[b.dataset.i][0]}». ${q.o[b.dataset.i][2]}</p></div>`;
      }
      hud(); pintarAyudas(false);
    };
    preguntaActiva = ayuda;
    pintarAyudas(false);
    $$('.opcion', elPanel).forEach(b => b.addEventListener('click', async () => {
      const [, ok, por] = q.o[b.dataset.i];
      if (ok) {
        preguntaActiva = null;
        $$('.opcion', elPanel).forEach(x => x.disabled = true);
        b.classList.add('correcta'); Audio_.sfx('bien');
        const puntos = [20, 10, 5][Math.min(fallos, 2)];
        resp.innerHTML = `<p class="por bien"><b>${fallos ? 'Ahora sí.' : '¡Correcto!'}</b> ${por}</p>`;
        ay.innerHTML = '';
        ganar(puntos);
        const s = document.createElement('button'); s.className = 'btn primario ancho'; s.textContent = `Seguir · +${puntos} 🌱 ›`;
        elPanel.append(s); s.scrollIntoView({ block: 'nearest' }); await clic(s); res(fallos);
      } else {
        fallos++; b.disabled = true; b.classList.add('incorrecta'); Audio_.sfx('mal');
        resp.innerHTML = `<p class="por mal"><b>No es esta.</b> ${por}</p>`;
        await perderEnergia(); pintarAyudas(true);
      }
    }));
  });
}

/* ---------- Tienda e insignias ---------- */
async function tienda() {
  for (;;) {
    const v = await modal(`<div class="tienda-cab"><img src="${IMG}${PERSONAJES.asesora.img}" alt="" />
        <div><p class="ante">Consultorio jurídico</p><h2>¿En qué te ayudo?</h2>
        <p>Tienes <b>${E.semillas} 🌱 semillas</b>. Cambia las que ganaste por apoyo para el camino.</p></div></div>
      <div class="tienda">${Object.entries(TIENDA).map(([k, a]) => `<button class="articulo-t" data-k="${k}" ${E.semillas < a.precio ? 'disabled' : ''}>
        <span class="ico">${a.icono}</span><b>${a.nombre}</b><small>${a.t}</small>
        <em>${a.precio} 🌱 · tienes ${E.inv[k]}</em></button>`).join('')}</div>`,
      [{ t: 'Salir del consultorio', v: null, c: 'primario' }], 'ancha');
    if (v === null) return;
  }
}
// La compra se resuelve por delegación para no cerrar el modal.
elCaja.addEventListener('click', ev => {
  const b = ev.target.closest('.articulo-t'); if (!b || b.disabled) return;
  const k = b.dataset.k, a = TIENDA[k];
  E.semillas -= a.precio; E.inv[k]++; Audio_.sfx('compra'); hud(); aviso(`Obtienes: ${a.nombre}`, 'bien');
  $$('.articulo-t', elCaja).forEach(x => { const t = TIENDA[x.dataset.k]; x.disabled = E.semillas < t.precio; $('em', x).textContent = `${t.precio} 🌱 · tienes ${E.inv[x.dataset.k]}`; });
  $('.tienda-cab b', elCaja).textContent = `${E.semillas} 🌱 semillas`;
});
function verInsignias() {
  return modal(`<p class="ante">Tu morral</p><h2>Insignias y ayudas</h2>
    <div class="insignias">${NIVELES.map(n => { const t = E.insignias.includes(n.id);
      return `<div class="insignia ${t ? '' : 'bloqueada'}"><span>${t ? n.insignia[0] : '🔒'}</span><b>${n.insignia[1]}</b><small>Nivel ${n.id}: ${n.nombre}</small></div>`; }).join('')}</div>
    <p class="morral">${Object.entries(TIENDA).map(([k, a]) => `${a.icono} ${a.nombre}: <b>${E.inv[k]}</b>`).join(' · ')} · 🌱 Semillas: <b>${E.semillas}</b></p>`,
    [{ t: 'Cerrar', v: 1, c: 'primario' }], 'ancha');
}

/* ---------- Transición de nivel: cortina en iris con el título ---------- */
async function cortina(id) {
  const n = NIVELES[id - 1];
  if (SIN_MOVIMIENTO) return;
  const c = document.createElement('div');
  c.className = `cortina ${id === 3 ? 'noche' : ''}`;
  c.innerHTML = `<div><span>${n.insignia[0]}</span><p>Nivel ${id} · ${n.lugar}</p><h2>${n.nombre}</h2><i></i></div>`;
  document.body.append(c); Audio_.sfx('nivel');
  setTimeout(() => c.remove(), 2300);
  await pausa(800);
}

// Entrada a la balanza: transición en video, del día a la noche, con su propio sonido.
function transicionBalanza() {
  if (SIN_MOVIMIENTO) return Promise.resolve();
  return new Promise(res => {
    const c = document.createElement('div'); c.className = 'cortina-video';
    c.innerHTML = `<video src="${TRANSICION_BALANZA}" playsinline></video><div><p>Nivel 3 · El claro</p><h2>La balanza</h2></div><button class="btn mini" type="button">Saltar ›</button>`;
    const v = $('video', c); let hecho = false;
    const fin = () => { if (hecho) return; hecho = true; c.classList.add('fuera'); setTimeout(() => c.remove(), 600); res(); };
    v.muted = !E.sonido; v.volume = 0.8;
    v.onended = fin; v.onerror = () => { c.remove(); if (!hecho) { hecho = true; cortina(3).then(res); } };
    $('button', c).addEventListener('click', fin);
    document.body.append(c); Audio_.generativa(false);
    v.play().catch(() => { v.muted = true; v.play().catch(fin); });
    setTimeout(fin, 7000);
  });
}

/* ---------- Conclusión de cada nivel (se muestra al terminarlo, al saltarlo o al salir) ---------- */
function conclusion(id) {
  if (id === 1) return modal(`<p class="ante">Conclusión del nivel 1</p><h2>Lo que el territorio dijo</h2>
    <p>En cada lugar de la vereda hay un hecho con relevancia constitucional. Juntos muestran derechos colectivos, derechos fundamentales, un déficit de participación y unas autoridades que no actúan.</p>
    <div class="normas">${ESTACIONES.map(e => `<article><b>${e.nombre}</b><div><h4>${e.pregunta.o.find(o => o[1])[0]}</h4><p>Arts. ${e.normas.join(', ')} C. P.</p></div></article>`).join('')}</div>`,
    [{ t: 'Continuar ›', v: 1, c: 'primario' }], 'ancha');
  if (id === 2) { return modal(`<p class="ante">Conclusión del nivel 2</p><h2>El problema jurídico del caso</h2>
    <blockquote class="pieza completa">${ARCHIVO.filter(a => a.pieza).map(a => a.pieza).join(' ')}</blockquote>
    <div class="desglose">
      <div><b>¿Quién?</b><p>Las autoridades que tienen el deber de proteger: administración municipal y autoridad ambiental.</p></div>
      <div><b>¿Qué derechos?</b><p>Los principios del Estado social de derecho y los derechos al ambiente sano, la salud, el agua y la participación.</p></div>
      <div><b>¿Qué conducta?</b><p>La omisión de medidas y de participación, excusada en que existen licencias vigentes.</p></div>
    </div>
    <h3>Problematización</h3><p>${PROBLEMATIZACION}</p>
    <h3>Subproblemas</h3><ol class="subp">${SUBPROBLEMAS.map(s => `<li>${s}</li>`).join('')}</ol>`,
    [{ t: 'Continuar ›', v: 1, c: 'primario' }], 'ancha'); }
  if (id === 3) { return modal(`<p class="ante">Lo que revela la balanza</p><h2>Dos maneras de leer el mismo caso</h2>
    <div class="tabla-d"><table class="lecturas"><thead><tr><th></th><th>Lectura formalista</th><th>Lectura desde el Estado social de derecho</th></tr></thead>
    <tbody>${LECTURAS.map(l => `<tr><th>${l[0]}</th><td>${l[1]}</td><td>${l[2]}</td></tr>`).join('')}</tbody></table></div>
    <p class="conclusion"><b>Conclusión.</b> La respuesta «hay licencia» pertenece a la primera lectura. La Constitución de 1991 exige la segunda: la actuación de las autoridades se mide por la protección efectiva de las personas, no solo por la regularidad de un trámite.</p>`,
    [{ t: 'Continuar ›', v: 1, c: 'primario' }], 'ancha'); }
  if (id === 4) return modal(`<p class="ante">Conclusión del nivel 4</p><h2>La decisión del juez</h2>
    <p>Una buena decisión protege a la comunidad sin desbordar las competencias del juez.</p>
    <div class="normas">${MEDIDAS.map(m => `<article><b>${m[1] ? '✔ Procede' : '✖ No procede'}</b><div><h4>${m[0]}</h4><p>${m[2]}</p></div></article>`).join('')}</div>`,
    [{ t: 'Continuar ›', v: 1, c: 'primario' }], 'ancha');
  return modal(`<p class="ante">Síntesis</p><h2>La ruta recomendada</h2>
    <ol class="ruta">${RUTA.map(p => `<li><b>${p[0]}</b>${p[1]}</li>`).join('')}</ol>
    <h3>Los mecanismos, lado a lado</h3>
    <div class="tabla-d"><table class="lecturas matriz"><thead><tr><th>Mecanismo</th><th>Fundamento</th><th>Qué protege</th><th>Aporte en El Encanto</th><th>Límite</th></tr></thead>
    <tbody>${MATRIZ.map(f => `<tr><th>${f[0]}</th>${f.slice(1).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
    [{ t: 'Continuar ›', v: 1, c: 'primario' }], 'ancha');
}

/* ---------- Cierre de nivel ---------- */
async function cerrarNivel(id, fallos, extra = '') {
  const n = NIVELES[id - 1], primera = !E.insignias.includes(id);
  E.hechos[id] = true;
  let bono = 0;
  if (primera) { E.insignias.push(id); bono = 50 + (fallos === 0 ? 30 : 0); E.semillas += bono; E.energia = Math.min(ENERGIA_MAX, E.energia + 1); }
  hud(); Audio_.sfx('premio');
  const v = await modal(`<div class="logro"><span class="logro-ico">${n.insignia[0]}</span>
      <p class="ante">Nivel ${id} superado</p><h2>${n.insignia[1]}</h2>
      ${extra}
      ${primera ? `<ul class="botin"><li>🏅 Nueva insignia</li><li>🌱 +50 semillas</li>${fallos === 0 ? '<li>✨ +30 por precisión: ni un solo error</li>' : ''}<li>💧 +1 gota de energía</li></ul>` : '<p>Ya tenías esta insignia: repasaste el nivel.</p>'}
      <p class="estado-j">Ahora tienes <b>${E.semillas} 🌱</b>, <b>${E.energia} 💧</b> y ${Object.entries(TIENDA).map(([k, a]) => `${a.icono} ${E.inv[k]}`).join(' ')}.</p>
      <p>¿Quieres pasar por el consultorio jurídico antes de seguir?</p></div>`,
    [{ t: 'Abrir el consultorio', v: 't' }, { t: id < 5 ? 'Seguir el camino' : 'Ver el desenlace', v: 's', c: 'primario' }]);
  if (v === 't') await tienda();
}

/* =========================================================
   Pantallas
   ========================================================= */
function modo(m) { document.body.dataset.modo = m; capa(); Audio_.ambiente(); if (m === 'camino' || m === 'final' || m === 'portada') $('#saltarNivel').hidden = true; }

async function portada() {
  modo('portada'); hud(); escena('fondo-portada.jpg');
  const hay = E.avatar && (E.intro || Object.keys(E.hechos).length);
  panel(`<p class="ante">Recorrido interactivo · Derecho Constitucional Colombiano I</p>
    <h1 class="titulo">El Encanto<em>La defensa del territorio</em></h1>
    <p class="entrada">El agua de la vereda está en riesgo y las autoridades dicen que todo está en regla. Camina el territorio, arma el caso y decide con tu comunidad cómo defenderlo con la Constitución en la mano.</p>
    <div class="col">
      ${hay ? `<button class="btn primario ancho" id="bCont">Continuar como ${yo().nombre} ›</button>` : ''}
      <button class="btn ${hay ? '' : 'primario'} ancho" id="bNuevo">${hay ? 'Empezar de nuevo' : 'Comenzar ›'}</button>
    </div>
    <p class="fino">Cinco niveles · unos 20 minutos · tu avance se guarda en este navegador. La música y los efectos de sonido vienen activados; puedes apagarlos en el tablero.</p>
    <a class="enlace" href="index.html">← Volver a la página del caso</a>`);
  const arrancar = () => { Audio_.iniciar(); Audio_.sfx('clic'); };
  if (hay) $('#bCont').addEventListener('click', () => { arrancar(); camino(); });
  $('#bNuevo').addEventListener('click', async () => {
    arrancar();
    if (hay && !(await modal('<h2>¿Empezar de nuevo?</h2><p>Se borrará tu avance, tus semillas y tus insignias.</p>',
      [{ t: 'Cancelar', v: false }, { t: 'Sí, empezar de nuevo', v: true, c: 'primario' }]))) return;
    const s = E.sonido; E = NUEVO(); E.sonido = s; guardar(); elegirAvatar();
  });
}

async function elegirAvatar() {
  modo('avatar'); hud(); escena('escena-asamblea-rio.jpg');
  panel(`<p class="ante">Antes de empezar</p><h2>¿Quién eres en El Encanto?</h2>
    <p>Elige con quién quieres recorrer el caso. Los demás serán tus vecinos en la reunión comunitaria.</p>
    <div class="avatares">${AVATARES.map(k => { const p = PERSONAJES[k];
      return `<button class="avatar" data-k="${k}" aria-pressed="false"><img src="${IMG}${p.img}" alt="" />
        <b>${p.nombre}</b><small>${p.rol}</small><span>${p.lema}</span><em>${p.don}</em></button>`; }).join('')}</div>
    <button class="btn primario ancho" id="bOk" disabled>Elige un personaje</button>`);
  let sel = null;
  $$('.avatar', elPanel).forEach(b => b.addEventListener('click', () => {
    sel = b.dataset.k; Audio_.sfx('clic');
    $$('.avatar', elPanel).forEach(x => x.setAttribute('aria-pressed', x === b));
    const ok = $('#bOk'); ok.disabled = false; ok.textContent = `Soy ${PERSONAJES[sel].nombre} ›`;
  }));
  await clic($('#bOk'));
  E.avatar = sel;
  const r = yo().regalo;
  if (r.semillas) E.semillas += r.semillas; else Object.keys(r).forEach(k => E.inv[k] += r[k]);
  hud('El comienzo'); Audio_.sfx('premio');
  introduccion();
}

async function introduccion() {
  modo('historia'); escena('escena-asamblea-rio.jpg', 'Vereda El Encanto, suroccidente colombiano');
  await charla([
    ['n', 'Desde que la empresa agroindustrial amplió sus operaciones, el agua baja turbia, el aire huele a quema y los cultivos se secan. La comunidad ha escrito muchas veces a la alcaldía y a la autoridad ambiental.'],
    ['n', 'La respuesta siempre es la misma: «la empresa tiene licencias vigentes». Hoy la vereda se reúne junto al río.'],
    ['yo', 'No podemos seguir esperando. Tiene que haber una manera de defender lo nuestro sin dejar de respetar la ley.'],
    ['asesora', `La hay, ${yo().nombre}. Soy Lucía, del consultorio jurídico. La ley que más pesa en este país es la Constitución, y está de su lado. Pero antes de hablar de normas hay que caminar el territorio.`],
    ['asesora', 'Mira tu tablero: las gotas 💧 son tu energía y se gastan cuando te equivocas. Las semillas 🌱 se ganan acertando y sirven en mi consultorio para pedir pistas o asesoría. Si te quedas sin energía, la comunidad te ayuda a levantarte.']
  ]);
  E.intro = true; guardar(); camino();
}

/* ---------- El camino (mapa de niveles) ---------- */
function camino() {
  nivelActual = 0;
  modo('camino'); hud('El camino'); escena('fondo-portada.jpg', 'El camino de la defensa');
  const siguiente = NIVELES.find(n => !E.hechos[n.id]);
  const todo = !siguiente;
  panel(`<p class="ante">El camino de la defensa</p>
    <h2>${todo ? 'Has recorrido todo el camino' : `Nivel ${siguiente.id}: ${siguiente.nombre}`}</h2>
    <p>${todo ? 'Puedes ver el desenlace o repetir cualquier nivel.' : siguiente.resumen}</p>
    <ol class="niveles">${NIVELES.map(n => { const hecho = E.hechos[n.id], abierto = hecho || n === siguiente;
      return `<li class="${hecho ? 'hecho' : ''} ${n === siguiente ? 'actual' : ''} ${abierto ? '' : 'cerrado'}">
        <button data-n="${n.id}" ${abierto ? '' : 'disabled'}><span>${hecho ? (E.insignias.includes(n.id) ? n.insignia[0] : '⏭') : (abierto ? n.id : '🔒')}</span>
        <b>${n.nombre}</b><small>${hecho ? (E.insignias.includes(n.id) ? 'Superado · repetir' : 'Saltado · juégalo para ganar la insignia') : (abierto ? n.lugar : 'Bloqueado')}</small></button></li>`; }).join('')}</ol>
    ${todo ? '<button class="btn primario ancho" id="bFin">Ver el desenlace ›</button>' : `<button class="btn primario ancho" id="bIr">Entrar al nivel ${siguiente.id} ›</button>`}
    <button class="btn ancho" id="bTienda">⚖️ Consultorio jurídico</button>`);
  const entrar = id => { Audio_.sfx('clic'); [nivel1, nivel2, nivel3, nivel4, nivel5][id - 1](); };
  $$('.niveles button', elPanel).forEach(b => b.addEventListener('click', () => entrar(+b.dataset.n)));
  if (todo) $('#bFin').addEventListener('click', final_); else $('#bIr').addEventListener('click', () => entrar(siguiente.id));
  $('#bTienda').addEventListener('click', async () => { await tienda(); camino(); });
}

/* ---------- Nivel 1: el territorio habla ---------- */
async function nivel1() {
  nivelActual = 1; ganadoNivel = 0;
  await cortina(1);
  modo('nivel1'); hud('Nivel 1 · El territorio habla');
  let fallos = 0;
  const hechas = new Set();
  const mapa = actual => {
    escena('fondo-territorio.jpg', 'Vereda El Encanto');
    capa(`<svg class="trazo" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${ESTACIONES.map(e => `${e.x},${e.y}`).join(' ')}" /></svg>
      ${ESTACIONES.map((e, i) => `<button class="punto ${hechas.has(i) ? 'hecho' : ''} ${i === actual ? 'actual' : ''}" style="left:${e.x}%;top:${e.y}%"
        data-i="${i}" ${i === actual ? '' : 'disabled'} aria-label="${e.nombre}">${hechas.has(i) ? '✓' : i + 1}</button>`).join('')}
      <img class="ficha" id="ficha" src="${IMG}${yo().img}" alt="" style="left:${actual > 0 ? ESTACIONES[actual - 1].x : 30}%;top:${actual > 0 ? ESTACIONES[actual - 1].y : 68}%" />`);
  };
  mapa(-1);
  await charla([
    ['asesora', 'Un caso no empieza en los códigos, empieza en los hechos. Vamos a recorrer siete lugares de la vereda. En cada uno, mira qué está pasando y pregúntate qué derecho hay detrás.'],
  ]);
  for (let i = 0; i < ESTACIONES.length; i++) {
    const e = ESTACIONES[i];
    mapa(i);
    panel(`<p class="ante">Estación ${i + 1} de ${ESTACIONES.length}</p><h2>${e.nombre}</h2>
      <p>Toca el punto que brilla en el mapa para caminar hasta allá.</p>
      <div class="avance"><span style="width:${(i / ESTACIONES.length) * 100}%"></span></div>
      <button class="btn primario ancho" id="bIr">Ir a ${e.nombre.toLowerCase()} ›</button>`);
    await Promise.race([clic($('.punto.actual', elCapa)), clic($('#bIr'))]);
    Audio_.sfx('paso');
    const f = $('#ficha'); f.style.left = e.x + '%'; f.style.top = e.y + '%';
    await pausa(SIN_MOVIMIENTO ? 0 : 900);
    capa(); escena(e.img[0], e.nombre);
    for (let k = 0; k < e.relato.length; k++) {
      if (e.img[1] && k === e.relato.length - 1) escena(e.img[1], e.nombre);
      await decir(e.relato[k][0], e.relato[k][1]);
    }
    fallos += await preguntar(e.pregunta, `${e.nombre} · ¿qué derecho hay detrás?`);
    hechas.add(i);
    for (;;) {
      panel(`<p class="ante">${e.nombre}</p><h3>Lo que la Constitución dice de este lugar</h3>
        <p class="normas-linea">Arts. ${e.normas.join(', ')} C. P.</p>
        <button class="btn ancho late" id="bNormas">📖 Ver las normas</button>
        <button class="btn primario ancho" id="bSeguir">${i < ESTACIONES.length - 1 ? 'Volver al mapa' : 'Terminar el recorrido'} ›</button>`);
      const v = await Promise.race([clic($('#bNormas')).then(() => 'n'), clic($('#bSeguir')).then(() => 's')]);
      if (v === 's') break;
      Audio_.sfx('clic');
      const nuevas = !E.normasVistas.includes(e.id);
      await modal(`<p class="ante">${e.nombre}</p><h2>Normas constitucionales en juego</h2>
        <div class="normas">${e.normas.map(n => `<article><b>Art. ${n}</b><div><h4>${NORMAS[n][0]}</h4><p>${NORMAS[n][1]}</p></div></article>`).join('')}</div>`,
        [{ t: nuevas ? 'Entendido · +5 🌱' : 'Entendido', v: 1, c: 'primario' }], 'ancha');
      if (nuevas) { E.normasVistas.push(e.id); ganar(5, 'por estudiar las normas'); }
    }
  }
  escena('escena-asamblea-rio.jpg', 'La comunidad se organiza');
  await charla([
    ['yo', 'Lo vimos con nuestros propios ojos: el agua, el aire, la tierra, los niños, los abuelos. Y nadie nos preguntó nada.'],
    ['asesora', 'Eso que acabas de decir ya es un análisis constitucional. Hay derechos colectivos, derechos fundamentales, un déficit de participación y unas autoridades que no actúan. Ahora hay que convertirlo en una pregunta precisa.']
  ]);
  await conclusion(1);
  await cerrarNivel(1, fallos, '<p>Recorriste la vereda e identificaste los derechos que se afectan en cada lugar.</p>');
  camino();
}

/* ---------- Nivel 2: el archivo ---------- */
async function nivel2() {
  nivelActual = 2; ganadoNivel = 0;
  await cortina(2);
  modo('nivel2'); hud('Nivel 2 · El archivo de la Constitución');
  escena('fondo-institucional.jpg', 'El archivo de la Constitución');
  const pos = [[50, 90], [38, 82], [58, 75], [44, 68], [55, 62], [47, 57], [51, 52]];
  const pintar = actual => capa(`${pos.map((p, i) => `<span class="nodo ${i < actual ? 'hecho' : ''} ${i === actual ? 'actual' : ''}"
      style="left:${p[0]}%;top:${p[1]}%;--e:${1 - i * 0.07}">${i < actual ? '✓' : i + 1}</span>`).join('')}
    <img class="ficha" src="${IMG}${yo().img}" alt="" style="left:${pos[Math.min(actual, 6)][0]}%;top:${pos[Math.min(actual, 6)][1] - 9}%;--e:${1 - Math.min(actual, 6) * 0.07}" />`);
  pintar(0);
  await charla([
    ['n', 'Un salón alto y luminoso guarda la memoria de la Constitución de 1991. Al fondo, una puerta deja ver el valle. Para llegar a ella hay que cruzar siete estantes.'],
    ['asesora', 'Un problema jurídico es la pregunta que el juez debe responder. Tiene que decir quién, qué hizo y qué norma está en juego, y poder contestarse con un sí o un no argumentado.'],
    ['asesora', 'Los tres primeros estantes te darán las piezas de esa pregunta. Los cuatro siguientes, las herramientas para defenderla. Si dudas, usa una pista: para eso estoy.']
  ]);
  let fallos = 0; const piezas = [];
  for (let i = 0; i < ARCHIVO.length; i++) {
    const a = ARCHIVO[i]; pintar(i);
    fallos += await preguntar(a, `Estante ${i + 1} de ${ARCHIVO.length} · ${a.titulo}`);
    if (a.pieza) {
      piezas.push(a.pieza); Audio_.sfx('premio');
      await modal(`<p class="ante">Pieza ${piezas.length} de 3</p><h2>Obtuviste una pieza del problema jurídico</h2>
        <blockquote class="pieza">${piezas.map((p, k) => `<span class="${k === piezas.length - 1 ? 'nueva' : ''}">${p}</span>`).join(' ')}${piezas.length < 3 ? ' <i>[ … ]</i>' : ''}</blockquote>`);
    }
  }
  pintar(7);
  await conclusion(2);
  await cerrarNivel(2, fallos, '<p>Formulaste el problema jurídico y reuniste las herramientas para defenderlo.</p>');
  camino();
}

/* ---------- Nivel 3: la balanza ---------- */
async function nivel3() {
  nivelActual = 3; ganadoNivel = 0;
  await transicionBalanza();
  modo('nivel3'); hud('Nivel 3 · La balanza'); escena('fondo-balanza.jpg');
  await charla([
    ['n', 'Cae la tarde y el monte guarda silencio. En un claro, un haz de luz ilumina una balanza antigua. En uno de sus platillos alguien dejó tres pesas: la licencia, la libertad de empresa y la propiedad.'],
    ['asesora', 'Esas razones son legítimas, por eso no se ignoran: se ponderan. En tu morral llevas lo que recogiste en el territorio. Lánzalo, pieza por pieza, al platillo de la comunidad.']
  ]);
  await modal(`<p class="ante">Antes de lanzar</p><h2>Cómo se juega la balanza</h2>
    <ol class="instrucciones">
      <li><span>🤲</span><div><b>Toma el objeto</b>Aparece junto a tu personaje. Cada uno representa un principio o un derecho de la Constitución.</div></li>
      <li><span>↙️</span><div><b>Arrástralo hacia atrás</b>Como una cauchera: mantén presionado y tira en dirección contraria al platillo. Cuanto más estires, más fuerza.</div></li>
      <li><span>〰️</span><div><b>Mira la línea de puntos</b>Te muestra el camino que seguirá el objeto. Ajusta la dirección y la fuerza hasta que caiga sobre el platillo verde, y suelta.</div></li>
      <li><span>🎯</span><div><b>Si fallas dos veces</b>Con ese objeto podrás activar la guía de color (${COSTO_GUIA} 🌱), que pinta la línea de naranja o cian según el tiro entre o no, o pedir puntería asistida (${COSTO_ASISTENCIA} 🌱). El siguiente objeto empieza otra vez sin ayudas.</div></li>
    </ol>
    <p class="fino">Fallar un lanzamiento no gasta energía. Acertar a la primera da más semillas.</p>`,
    [{ t: 'Estoy listo ›', v: 1, c: 'primario' }], 'ancha');
  hud();
  const O = { x: 150, y: 330 }, P = { x: 545, y: 150 }, L = 140, G = 900;
  let puestas = 0, fallos = 0, guiaColor = false;
  // Zona de acierto: sin ayudas solo cuenta el centro del platillo; con la guía de color, el platillo completo.
  const zona = () => guiaColor ? 62 : 24;
  const ang = () => Math.max(-13.5, Math.min(13.5, (puestas - 3) * 4.5)) * Math.PI / 180;
  const plato = lado => ({ x: P.x + lado * L * Math.cos(ang()), y: P.y + lado * L * Math.sin(ang()) + 78 });
  capa(`<div class="luciernagas">${Array.from({ length: 22 }, () => `<i style="left:${Math.random() * 100}%;top:${20 + Math.random() * 75}%;animation-delay:-${(Math.random() * 9).toFixed(1)}s;animation-duration:${(6 + Math.random() * 7).toFixed(1)}s"></i>`).join('')}</div>
    <svg id="lienzo" viewBox="0 0 832 448" role="img" aria-label="Balanza de ponderación">
      <defs><clipPath id="rc"><circle cx="70" cy="366" r="40" /></clipPath>
        <radialGradient id="halo"><stop offset="0" stop-color="#fcb400" stop-opacity=".55" /><stop offset="1" stop-color="#fcb400" stop-opacity="0" /></radialGradient></defs>
      <rect x="${P.x - 7}" y="${P.y}" width="14" height="230" rx="5" fill="#0b3a52" stroke="#fcb400" stroke-opacity=".35" />
      <rect x="${P.x - 80}" y="${P.y + 224}" width="160" height="14" rx="7" fill="#0b3a52" stroke="#fcb400" stroke-opacity=".35" />
      <g id="brazo"><rect x="${P.x - L - 8}" y="${P.y - 5}" width="${L * 2 + 16}" height="10" rx="5" fill="#d9a520" /></g>
      <circle cx="${P.x}" cy="${P.y}" r="12" fill="#fcb400" stroke="#06202e" stroke-width="3" />
      <g id="pIzq"><path d="M0 -78 L-50 0 M0 -78 L50 0" stroke="#9fb4c2" stroke-width="1.5" /><path d="M-62 0 H62 Q50 28 0 28 Q-50 28 -62 0Z" fill="#33495a" stroke="#9fb4c2" />
        <g font-size="22" text-anchor="middle"><text x="-30" y="-6">📄</text><text x="0" y="-6">🏭</text><text x="30" y="-6">🔑</text></g>
        <text y="50" class="rot">Licencia · empresa · propiedad</text></g>
      <g id="pDer"><circle r="90" cy="-20" fill="url(#halo)" id="haloD" opacity="0" /><path d="M0 -78 L-50 0 M0 -78 L50 0" stroke="#9fb4c2" stroke-width="1.5" /><path d="M-62 0 H62 Q50 28 0 28 Q-50 28 -62 0Z" fill="#1f5a45" stroke="#7fd3a0" />
        <g id="enPlato" font-size="20" text-anchor="middle"></g><text y="50" class="rot">Comunidad</text></g>
      <circle cx="70" cy="366" r="44" fill="#06202e" stroke="#fcb400" stroke-width="3" /><image href="${IMG}${yo().img}" x="30" y="326" width="80" height="80" clip-path="url(#rc)" preserveAspectRatio="xMidYMid slice" />
      <g id="guia"></g><line id="liga" stroke="#7ff4ff" stroke-width="2.5" stroke-dasharray="5 4" opacity="0" />
      <g id="objeto" tabindex="0"><circle r="64" fill="transparent" stroke="none" /><circle r="26" fill="#06202e" stroke="#fcb400" stroke-width="2.5" /><text id="objIco" text-anchor="middle" y="9" font-size="26"></text></g>
      <g id="chispas"></g>
    </svg>`);
  const svg = $('#lienzo'), obj = $('#objeto'), guia = $('#guia'), liga = $('#liga');
  const colocar = () => {
    const a = ang() * 180 / Math.PI;
    $('#brazo').setAttribute('transform', `rotate(${a} ${P.x} ${P.y})`);
    const i = plato(-1), d = plato(1);
    $('#pIzq').setAttribute('transform', `translate(${i.x} ${i.y})`);
    $('#pDer').setAttribute('transform', `translate(${d.x} ${d.y})`);
  };
  const aSvg = ev => { const m = svg.getScreenCTM().inverse(); return new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m); };
  const mover = (x, y) => obj.setAttribute('transform', `translate(${x} ${y})`);
  colocar();

  const lanzar = (vx, vy) => new Promise(res => {
    let x = O.x, y = O.y, t0 = null; Audio_.sfx('lanzar');
    const paso = t => {
      if (t0 === null) t0 = t;
      const dt = Math.min(0.032, (t - t0) / 1000); t0 = t;
      const py = y; x += vx * dt; vy += G * dt; y += vy * dt;
      mover(x, y);
      const d = plato(1);
      if (vy > 0 && py <= d.y - 6 && y >= d.y - 6 && Math.abs(x - d.x) < zona()) return res(true);
      if (y > 470 || x > 860 || x < -30) return res(false);
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  });
  // ¿Con esta velocidad el objeto cae en el platillo de la comunidad?
  const acierta = (vx, vy) => {
    let x = O.x, y = O.y; const d = plato(1);
    for (let k = 0; k < 400; k++) {
      const py = y; x += vx * 0.012; vy += G * 0.012; y += vy * 0.012;
      if (vy > 0 && py <= d.y - 6 && y >= d.y - 6 && Math.abs(x - d.x) < zona()) return true;
      if (y > 470 || x > 860 || x < -30) return false;
    }
    return false;
  };
  const velAsistida = () => { const d = plato(1), T = 1.05; return [(d.x - O.x) / T, (d.y - 10 - O.y - 0.5 * G * T * T) / T]; };

  const turno = pesa => new Promise(res => {
    let fallosAqui = 0, arrastrando = false, ocupado = false;
    guiaColor = false;   // cada objeto empieza sin ayudas
    $('#objIco').textContent = pesa.icono; mover(O.x, O.y); obj.style.display = '';
    const ficha = asist => panel(`<p class="ante">En tu mano · ${puestas + 1} de ${PESAS.length}</p>
      <div class="pesa-card"><span>${pesa.icono}</span><div><h3>${pesa.nombre}</h3><small>${pesa.norma}</small></div></div>
      <p>${pesa.t}</p>
      <p class="fino">${guiaColor ? 'Guía de color activa: suelta cuando la línea de puntos se ponga <b class="tiro-bien">cian</b>; si está <b class="tiro-mal">naranja</b>, el tiro no llega.' : 'Arrastra el objeto hacia atrás, como una cauchera, y suéltalo para lanzarlo al platillo verde.'}</p>
      ${asist && !guiaColor ? `<button class="btn ancho" id="bGuia" ${E.semillas >= COSTO_GUIA ? '' : 'disabled'}>🌈 Guía de color para este objeto · ${E.semillas >= COSTO_GUIA ? COSTO_GUIA + ' 🌱' : 'te faltan ' + (COSTO_GUIA - E.semillas) + ' 🌱'}</button>` : ''}
      ${asist ? `<button class="btn ancho late" id="bAsis">🎯 Puntería asistida para este tiro · ${E.semillas >= COSTO_ASISTENCIA ? COSTO_ASISTENCIA + ' 🌱' : 'cortesía de la comunidad'}</button>` : ''}
      <div class="avance"><span style="width:${(puestas / PESAS.length) * 100}%"></span></div>`);
    const resolver = async (vx, vy) => {
      if (ocupado) return; ocupado = true; guia.innerHTML = ''; liga.setAttribute('opacity', 0);
      const dentro = await lanzar(vx, vy);
      if (dentro) { limpiar(); return res(fallosAqui); }
      fallosAqui++; Audio_.sfx('mal'); aviso(['Casi. Ajusta la fuerza.', 'Un poco más. Mira la línea de puntos.', 'Con calma: puedes usar la puntería asistida.'][Math.min(fallosAqui - 1, 2)]);
      mover(O.x, O.y); ocupado = false; ficha(fallosAqui >= 2); enlazar();
    };
    const asistir = () => {
      if (ocupado) return;
      if (E.semillas >= COSTO_ASISTENCIA) { E.semillas -= COSTO_ASISTENCIA; hud(); aviso(`−${COSTO_ASISTENCIA} 🌱 por la puntería asistida`); }
      resolver(...velAsistida());
    };
    const enlazar = () => {
      const b = $('#bAsis'); if (b) b.addEventListener('click', asistir);
      const g = $('#bGuia'); if (g) g.addEventListener('click', () => {
        if (ocupado || E.semillas < COSTO_GUIA) return;
        E.semillas -= COSTO_GUIA; guiaColor = true; Audio_.sfx('compra'); hud();
        aviso('Guía de color activada: naranja no llega, cian acierta', 'bien');
        ficha(true); enlazar();
      });
    };
    const abajo = ev => { if (ocupado) return; arrastrando = true; obj.setPointerCapture(ev.pointerId); ev.preventDefault(); };
    const mueve = ev => {
      if (!arrastrando) return;
      const p = aSvg(ev); let dx = O.x - p.x, dy = O.y - p.y; const d = Math.hypot(dx, dy), max = 125;
      if (d > max) { dx *= max / d; dy *= max / d; }
      mover(O.x - dx, O.y - dy);
      liga.setAttribute('x1', O.x); liga.setAttribute('y1', O.y); liga.setAttribute('x2', O.x - dx); liga.setAttribute('y2', O.y - dy); liga.setAttribute('opacity', 1);
      // Sin la guía de color la línea solo muestra la trayectoria; con ella, avisa si el tiro entra.
      const bueno = guiaColor && acierta(dx * 8.5, dy * 8.5), color = !guiaColor ? '#f1f7fb' : (bueno ? '#a8fbff' : '#ff6a1a');
      guia.setAttribute('class', !guiaColor ? '' : (bueno ? 'bien' : 'mal')); liga.setAttribute('stroke', color);
      let x = O.x, y = O.y, vx = dx * 8.5, vy = dy * 8.5, s = '';
      for (let k = 0; k < 16; k++) { x += vx * 0.07; vy += G * 0.07; y += vy * 0.07; s += `<circle cx="${x}" cy="${y}" r="${5 - k * 0.18}" fill="${color}" stroke="#03202c" stroke-width="1" opacity="${1 - k * 0.04}" />`; }
      guia.innerHTML = s; obj._v = [dx * 8.5, dy * 8.5, d];
    };
    const arriba = () => {
      if (!arrastrando) return; arrastrando = false;
      const v = obj._v; obj._v = null;
      if (!v || v[2] < 18) { mover(O.x, O.y); guia.innerHTML = ''; liga.setAttribute('opacity', 0); return; }
      resolver(v[0], v[1]);
    };
    const tecla = ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); asistir(); } };
    const limpiar = () => { obj.removeEventListener('pointerdown', abajo); obj.removeEventListener('pointermove', mueve);
      obj.removeEventListener('pointerup', arriba); obj.removeEventListener('pointercancel', arriba); obj.removeEventListener('keydown', tecla); };
    obj.addEventListener('pointerdown', abajo); obj.addEventListener('pointermove', mueve);
    obj.addEventListener('pointerup', arriba); obj.addEventListener('pointercancel', arriba); obj.addEventListener('keydown', tecla);
    ficha(false);
  });

  const reacciones = ['La balanza apenas se mueve. La licencia todavía pesa más.', 'El platillo de la comunidad empieza a ganar peso.',
    'Equilibrio. La licencia ya no es un argumento que cierre la discusión.', 'La balanza cede: ahora hay que justificar por qué debería prevalecer el permiso.',
    'El platillo de la comunidad baja con fuerza.', 'La balanza se inclina del todo hacia la protección de la comunidad.'];
  for (const pesa of PESAS) {
    const f = await turno(pesa); fallos += f;
    obj.style.display = 'none'; puestas++; Audio_.sfx('golpe');
    const k = puestas - 1;
    $('#enPlato').insertAdjacentHTML('beforeend', `<text x="${[-36, -12, 12, 36, -24, 0][k]}" y="${k < 4 ? -4 : -26}">${pesa.icono}</text>`);
    colocar();
    const d = plato(1), ch = $('#chispas');
    ch.innerHTML = Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2, r = 46 + Math.random() * 30;
      return `<circle cx="${d.x}" cy="${d.y - 10}" r="3" fill="${i % 2 ? '#fcb400' : '#7fd3a0'}"><animate attributeName="cx" to="${d.x + Math.cos(a) * r}" dur=".7s" fill="freeze" /><animate attributeName="cy" to="${d.y - 10 + Math.sin(a) * r}" dur=".7s" fill="freeze" /><animate attributeName="opacity" to="0" dur=".7s" fill="freeze" /></circle>`; }).join('');
    $('#haloD').setAttribute('opacity', 1); setTimeout(() => $('#haloD') && $('#haloD').setAttribute('opacity', 0), 700);
    ganar(f ? 10 : 20);
    panel(`<p class="ante">${puestas} de ${PESAS.length} en la balanza</p>
      <div class="pesa-card dentro"><span>${pesa.icono}</span><div><h3>${pesa.nombre}</h3><small>${pesa.norma}</small></div></div>
      <p class="por bien">${reacciones[k]}</p>
      <div class="medidor"><i style="left:${(puestas / PESAS.length) * 100}%"></i></div>
      <div class="medidor-r"><span>Formalismo legal</span><span>Garantía sustancial</span></div>
      <button class="btn primario ancho" id="bS">${puestas < PESAS.length ? 'Tomar el siguiente ›' : 'Leer la balanza ›'}</button>`);
    await clic($('#bS'));
  }
  await decir('asesora', 'Mira bien: la libertad de empresa no desapareció del platillo. Sigue ahí, porque es un derecho. Lo que cambió es que ya no puede ejercerse sacrificando el agua, la salud y el ambiente de la vereda. Ponderar no es sumar fichas: es justificar qué principio debe prevalecer en este caso.');
  await conclusion(3);
  await cerrarNivel(3, fallos, '<p>Ponderaste los principios en juego y viste hacia dónde se inclina la Constitución.</p>');
  camino();
}

/* ---------- Nivel 4: la audiencia ---------- */
async function nivel4() {
  nivelActual = 4; ganadoNivel = 0;
  await cortina(4);
  modo('nivel4'); hud('Nivel 4 · La audiencia'); escena('fondo-audiencia.jpg', 'Juzgado del municipio');
  const com = E.avatar === 'lideresa' ? 'campesina' : 'lideresa';
  const quien = v => v.quien === 'comunidad' ? com : v.quien;
  await modal(`<div class="logro"><span class="logro-ico">👩‍⚖️</span><p class="ante">Nueva habilidad</p><h2>La toga del juez</h2>
    <p>Por este nivel dejas tu lugar en la comunidad y ocupas el estrado. Tu tarea es escuchar a todos con el mismo cuidado, valorar cada postura y decidir qué medidas proceden.</p></div>`,
    [{ t: 'Ponerme la toga ›', v: 1, c: 'primario' }]);
  let fallos = 0; const oidas = new Set();
  const sala = () => capa(`<div class="sala">${VOCES.map((v, i) => { const p = PERSONAJES[quien(v)];
    return `<button class="voz ${oidas.has(i) ? 'oida' : ''}" data-i="${i}" ${oidas.has(i) ? 'disabled' : ''}><img src="${IMG}${p.img}" alt="" /><span>${v.quien === 'comunidad' ? 'Comunidad de El Encanto' : p.nombre}</span></button>`; }).join('')}</div>`);
  while (oidas.size < VOCES.length) {
    sala();
    panel(`<p class="ante">Intervenciones · ${oidas.size} de ${VOCES.length}</p><h2>¿A quién le da la palabra?</h2>
      <p>Toque a un interviniente para escucharlo. Puede oírlos en el orden que prefiera.</p>
      <div class="avance"><span style="width:${(oidas.size / VOCES.length) * 100}%"></span></div>`);
    const i = await new Promise(r => $$('.voz:not(:disabled)', elCapa).forEach(b => b.addEventListener('click', () => r(+b.dataset.i))));
    const v = VOCES[i], q = quien(v), p = PERSONAJES[q];
    Audio_.sfx('clic'); $$('.voz', elCapa).forEach(b => { b.disabled = true; b.classList.toggle('habla', +b.dataset.i === i); });
    await decir(q, `«${v.alegato}»`, 'Ver el análisis');
    panel(`<p class="ante">Análisis dogmático</p><h3>${v.quien === 'comunidad' ? 'Comunidad de El Encanto' : p.nombre}</h3>
      <p>${v.analisis}</p><p class="normas-linea">${v.normas}</p>
      <button class="btn primario ancho" id="bV">Valorar la postura ›</button>`);
    await clic($('#bV'));
    fallos += await preguntar({ t: '¿Cómo valora esta postura a la luz de la Constitución?',
      o: VALORACIONES.map((t, k) => [t, k === v.valor, k === v.valor
        ? ['Constata un permiso y da por cumplido su deber: el trámite sustituye la protección.', 'Ejerce un derecho real, pero la Constitución le fija límites: el ambiente y el bien común.', 'Pide que los derechos sean efectivos en la realidad, no solo en el papel.'][k]
        : 'Vuelva sobre el análisis: ¿la postura pide proteger derechos, invoca un derecho propio con límites, o se queda en el trámite?']),
      pista: ['Fíjese en qué hace la autoridad con la licencia: ¿la usa para proteger o para no actuar?', 'La empresa invoca un derecho que sí existe. La pregunta es si tiene límites.', 'Quien reclama agua, salud y participación no está pidiendo un trámite.'][v.valor] },
      'Su valoración');
    oidas.add(i);
  }
  sala();
  await decir('n', 'Ha escuchado a todas las partes. Llega el momento de decidir. Se le proponen seis medidas: adopte las que procedan y descarte las que no.');
  let bien = 0;
  for (let i = 0; i < MEDIDAS.length; i++) {
    const [t, ok, por] = MEDIDAS[i];
    panel(`<p class="ante">Medida ${i + 1} de ${MEDIDAS.length}</p><h3 class="preg">${t}</h3>
      <div class="dos"><button class="btn ancho" data-v="1">✔ Adoptar</button><button class="btn ancho" data-v="0">✖ No adoptar</button></div>
      <div class="respuesta" id="resp"></div>`);
    const v = await new Promise(r => $$('[data-v]', elPanel).forEach(b => b.addEventListener('click', () => r(b.dataset.v === '1'))));
    $$('[data-v]', elPanel).forEach(b => b.disabled = true);
    const acierto = v === ok;
    if (acierto) { bien++; Audio_.sfx('bien'); ganar(15); } else { fallos++; Audio_.sfx('mal'); await perderEnergia(); }
    $('#resp').innerHTML = `<p class="por ${acierto ? 'bien' : 'mal'}"><b>${acierto ? 'Decisión acertada.' : 'Decisión equivocada.'}</b> ${por}</p>
      <button class="btn primario ancho" id="bS">${i < MEDIDAS.length - 1 ? 'Siguiente medida' : 'Firmar la decisión'} ›</button>`;
    $('#bS').scrollIntoView({ block: 'nearest' }); await clic($('#bS'));
  }
  await conclusion(4);
  await cerrarNivel(4, fallos, `<p>Decidió bien ${bien} de ${MEDIDAS.length} medidas. Una buena decisión protege a la comunidad sin desbordar las competencias del juez.</p>`);
  camino();
}

/* ---------- Nivel 5: la ruta de la comunidad ---------- */
async function nivel5() {
  nivelActual = 5; ganadoNivel = 0;
  await cortina(5);
  modo('nivel5'); hud('Nivel 5 · La ruta de la comunidad'); escena('fondo-reunion.jpg', 'Caseta comunal de El Encanto');
  const vs = vecinos(), voz = { popular: vs[0], tutela: vs[1], peticion: vs[2], nulidad: 'asesora', cumplimiento: vs[0] };
  const circulo = habla => capa(`<div class="sala">${[...vs, 'asesora'].map(k => `<span class="voz fija ${k === habla ? 'habla' : ''}"><img src="${IMG}${PERSONAJES[k].img}" alt="" /><span>${PERSONAJES[k].nombre}</span></span>`).join('')}</div>`);
  circulo();
  await charla([
    ['n', 'Devuelves la toga y regresas a tu silla de plástico en la caseta comunal. Esta tarde la junta decide qué camino tomar.'],
    ['yo', 'Vecinos, ya sabemos qué nos está pasando y qué dice la Constitución. Ahora hay que escoger cómo reclamar. Escuchémonos.']
  ]);
  for (const k of ORDEN_VIAS) {
    const v = VIAS[k]; circulo(voz[k]);
    await decir(voz[k], v.propuesta, 'Escuchar');
    capa(elCapa.innerHTML + `<button class="evento" id="evento"><span>${v.icono}</span>Conocer: ${v.nombre}</button>`);
    panel(`<p class="ante">Una propuesta sobre la mesa</p><h3>${v.nombre}</h3>
      <p>Toca el aviso que apareció en la escena para conocer este mecanismo antes de opinar.</p>
      <button class="btn primario ancho late" id="bEv">${v.icono} Conocer el mecanismo ›</button>`);
    await Promise.race([clic($('#evento')), clic($('#bEv'))]); Audio_.sfx('clic');
    await modal(tarjetaVia(k), [{ t: 'Entendido · +5 🌱', v: 1, c: 'primario' }], 'ancha');
    ganar(5);
  }
  circulo('asesora');
  await decir('asesora', 'Ya conocen las cinco vías. No todas sirven para lo mismo ni se pueden combinar de cualquier manera. La decisión es de ustedes.');
  let fallos = 0, intento = 0;
  for (;;) {
    intento++;
    const sel = new Set();
    panel(`<p class="ante">La decisión de la comunidad</p><h2>¿Qué mecanismos van a usar?</h2>
      <p>Elige uno o varios. Piensa en qué detiene el daño, qué protege lo urgente y qué les da pruebas.</p>
      <div class="vias">${ORDEN_VIAS.map(k => `<button class="via-op" data-k="${k}" aria-pressed="false"><span>${VIAS[k].icono}</span>${VIAS[k].nombre}</button>`).join('')}</div>
      <button class="btn primario ancho" id="bOk" disabled>Elige al menos un mecanismo</button>`);
    $$('.via-op', elPanel).forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k;
      if (!sel.has(k)) {
        const choque = k === 'cumplimiento' ? ['popular', 'tutela'].find(x => sel.has(x)) : (['popular', 'tutela'].includes(k) && sel.has('cumplimiento') ? 'cumplimiento' : null);
        if (choque) { Audio_.sfx('mal');
          modal(`<div class="nota-lucia grande"><img src="${IMG}${PERSONAJES.asesora.img}" alt="" /><div><p class="ante">Lucía pide la palabra</p><h2>Esas dos vías no se combinan</h2>
            <p>La acción de cumplimiento es improcedente cuando existe otro medio judicial eficaz para lograr lo mismo (Ley 393 de 1997, art. 9). Si van a usar la ${VIAS[k === 'cumplimiento' ? choque : k].nombre.toLowerCase()}, el juez rechazaría la de cumplimiento. Escojan una de las dos.</p></div></div>`,
            [{ t: 'Entendido', v: 1, c: 'primario' }]);
          return; }
        sel.add(k);
      } else sel.delete(k);
      Audio_.sfx('clic'); b.setAttribute('aria-pressed', sel.has(k));
      const ok = $('#bOk'); ok.disabled = !sel.size; ok.textContent = sel.size ? `Presentar la estrategia (${sel.size}) ›` : 'Elige al menos un mecanismo';
    }));
    await clic($('#bOk'));
    const tiene = k => sel.has(k);
    let r, detalle = '';
    if (tiene('popular') && tiene('tutela')) {
      r = RESULTADOS.optimo;
      detalle = (tiene('peticion') ? 'La petición les dio las pruebas y cumplió la reclamación previa. ' : 'Les habría servido empezar por la petición, para llegar al juez con las licencias y los informes en la mano. ')
        + (tiene('nulidad') ? 'La nulidad de la ampliación sigue su curso, más lento, como complemento.' : '');
    } else if (tiene('popular')) { r = RESULTADOS.bueno; detalle = 'El juez popular suspende vertimientos y quemas, pero los niños y los adultos mayores siguen sin agua segura mientras avanza el proceso. Faltó la tutela para lo urgente.'; }
    else if (tiene('tutela')) { r = RESULTADOS.bueno; detalle = 'El juez de tutela ordena agua potable y atención en salud para las personas afectadas, pero la fuente de la contaminación sigue activa. Faltó la acción popular, que es la que protege el ambiente de toda la vereda.'; }
    else { r = RESULTADOS.parcial;
      detalle = tiene('cumplimiento') ? 'Es probable que el juez declare improcedente la acción de cumplimiento, porque existe la acción popular para proteger los mismos derechos.'
        : tiene('nulidad') ? 'La nulidad puede prosperar, pero tarda. Mientras se decide, los vertimientos y las quemas continúan.'
          : 'Obtienen las licencias y los informes, y dejan constancia de la omisión. Es un buen primer paso, pero por sí solo no hace cesar el daño.'; }
    capa(); escena(r.img, 'El resultado más probable'); Audio_.sfx(r.nivel === 3 ? 'premio' : 'bien');
    const puntos = [0, 15, 35, 60][r.nivel], suma = Math.max(0, puntos - E.mejorRuta);
    E.mejorRuta = Math.max(E.mejorRuta, puntos); if (suma) ganar(suma);
    panel(`<p class="ante">El resultado más probable</p><h2>${r.titulo}</h2>
      <div class="rio"><span>Salud del río</span><div><i style="width:0%" data-w="${[0, 30, 65, 100][r.nivel]}"></i></div></div>
      <p>${r.t}</p><p class="por ${r.nivel === 3 ? 'bien' : 'mal'}">${detalle}</p>
      ${r.nivel < 3 ? '<button class="btn ancho" id="bRe">↺ Replantear la estrategia</button>' : ''}
      <button class="btn primario ancho" id="bS">${r.nivel === 3 ? 'Ver la ruta completa' : 'Aceptar este resultado'} ›</button>`);
    setTimeout(() => { const i = $('.rio i'); if (i) i.style.width = i.dataset.w + '%'; }, 80);
    const b = $('#bRe');
    const v = await Promise.race([clic($('#bS')).then(() => 's'), b ? clic(b).then(() => 'r') : new Promise(() => {})]);
    if (v === 's') { if (r.nivel < 3) fallos++; break; }
    escena('fondo-reunion.jpg', 'Caseta comunal de El Encanto'); circulo('asesora');
    if (intento === 1) await decir('asesora', 'Pregúntense dos cosas: ¿qué vía detiene el daño para todos? ¿Y cuál protege ya mismo a quienes no pueden esperar?');
  }
  await conclusion(5);
  await cerrarNivel(5, fallos, '<p>La comunidad tiene una estrategia jurídica clara y sabe para qué sirve cada mecanismo.</p>');
  final_();
}
function tarjetaVia(k) {
  const v = VIAS[k];
  return `<div class="via-card"><span class="via-ico">${v.icono}</span><div><p class="ante">Mecanismo de protección</p><h2>${v.nombre}</h2><p class="normas-linea">${v.base}</p></div></div>
    <dl class="via-dl">${v.filas.map(f => `<div><dt>${f[0]}</dt><dd>${f[1]}</dd></div>`).join('')}</dl>
    <p class="alerta"><b>Ten en cuenta.</b> ${v.alerta}</p>`;
}

/* ---------- Final ---------- */
function final_() {
  modo('final'); hud('El desenlace'); escena('fondo-final.jpg', 'El Encanto, un tiempo después');
  Audio_.sfx('premio');
  panel(`<p class="ante">El desenlace</p><h1 class="titulo chico">El agua vuelve a correr clara<em>${yo().nombre}, la vereda recordará este camino</em></h1>
    <div class="marcador"><div><b>${E.semillas}</b><span>🌱 semillas</span></div><div><b>${E.insignias.length}/5</b><span>🏅 insignias</span></div><div><b>${E.energia}</b><span>💧 energía</span></div></div>
    <h3>Lo que te llevas</h3>
    <div class="capsulas">${CAPSULAS.map(c => `<article><span>${c[0]}</span><div><b>${c[1]}</b><p>${c[2]}</p></div></article>`).join('')}</div>
    <div class="recompensa"><img src="${IMG}cartilla-portada.jpg" alt="" /><div><p class="ante">Tu recompensa</p>
      <h3>Cartilla: mecanismos de participación ciudadana en Colombia</h3>
      <p>Una guía breve para que cualquier ciudadano sepa qué mecanismo usar, qué norma lo respalda y cómo dar el primer paso.</p>
      <div class="col"><a class="btn primario ancho" href="cartilla.html" target="_blank" rel="noopener">📖 Abrir la cartilla</a>
      <a class="btn ancho" href="assets/juego/cartilla-mecanismos-de-participacion.pdf" download>⬇ Descargar en PDF</a></div></div></div>
    <div class="col"><button class="btn ancho" id="bCam">Volver al camino y repetir niveles</button>
      <a class="btn ancho" href="index.html#documento">Leer el análisis completo del caso</a></div>`);
  $('#bCam').addEventListener('click', camino);
}

/* ---------- Controles del tablero ---------- */
$('#btnSonido').addEventListener('click', () => { E.sonido = !E.sonido; Audio_.iniciar(); hud(); Audio_.sfx('clic'); });
$('#btnMusica').addEventListener('click', () => { Audio_.iniciar(); E.musica = !E.musica; Audio_.ambiente(); hud(); aviso(E.musica ? 'Música encendida' : 'Música apagada'); });
$('#btnInsignias').addEventListener('click', verInsignias);
$('#btnTienda').addEventListener('click', tienda);
$('#saltarNivel').addEventListener('click', async () => {
  const n = NIVELES[nivelActual - 1], costo = costoSalto();
  if (!n) return;
  if (E.semillas < costo) return aviso(`Te faltan ${costo - E.semillas} 🌱 para saltar este nivel.`);
  if (await modal(`<p class="ante">Nivel ${n.id} · ${n.nombre}</p><h2>¿Saltar este nivel?</h2>
    <p>Cuesta <b>${costo} 🌱</b> y tienes ${E.semillas}. Verás la conclusión del nivel y el camino seguirá abierto, pero no recibirás insignia ni semillas. Podrás volver a jugarlo después.</p>`,
    [{ t: 'Seguir jugando', v: false, c: 'primario' }, { t: `⏭ Saltar · ${costo} 🌱`, v: true }])) {
    E.semillas -= costo; E.hechos[n.id] = true; irTrasRecarga(`saltar:${n.id}`);
  }
});
// Menú: permite dejar un nivel a medias, saltarlo pagando semillas o volver al inicio.
const COSTO_SALTO = 150, COSTO_MINIMO = 40;
const costoSalto = () => Math.max(COSTO_MINIMO, COSTO_SALTO - ganadoNivel);
const irTrasRecarga = destino => { preguntaActiva = null; guardar(); try { sessionStorage.setItem('encanto-ir', destino); } catch (e) { /* sin almacenamiento */ } location.reload(); };
$('#btnCamino').addEventListener('click', async () => {
  const m = document.body.dataset.modo, enNivel = nivelActual > 0 && /^nivel/.test(m);
  if (!enNivel) {
    if (m === 'camino' || m === 'final') { if (await modal('<h2>¿Volver al inicio?</h2><p>Tu avance, tus semillas y tus insignias se conservan.</p>', [{ t: 'Seguir aquí', v: false, c: 'primario' }, { t: 'Volver al inicio', v: true }])) irTrasRecarga('inicio'); }
    return;
  }
  const n = NIVELES[nivelActual - 1], costo = costoSalto(), puede = nivelActual > 1, alcanza = E.semillas >= costo;
  const saltar = !puede ? '<p class="fino">El primer nivel no se puede saltar: es el recorrido que da sentido a todo lo demás.</p>'
    : (alcanza ? `<p class="fino">Saltar cuesta <b>${costo} 🌱</b> (tienes ${E.semillas}). El precio baja según lo que ya ganaste en este nivel. Verás la conclusión, pero no recibirás insignia ni semillas.</p>`
      : `<p class="fino">Saltar cuesta <b>${costo} 🌱</b> y tienes ${E.semillas}. Te faltan ${costo - E.semillas}: puedes seguir jugando para ganarlas o salir al camino.</p>`);
  const botones = [{ t: 'Seguir en el nivel', v: 'seguir', c: 'primario' }];
  if (puede && alcanza) botones.push({ t: `⏭ Saltar · ${costo} 🌱`, v: 'saltar' });
  botones.push({ t: '🧭 Salir al camino', v: 'salir' }, { t: '🏠 Volver al inicio', v: 'inicio' });
  const v = await modal(`<p class="ante">Nivel ${n.id} · ${n.nombre}</p><h2>¿Qué quieres hacer?</h2>
    <p>No tienes que terminar el nivel si no quieres. Si sales, verás su conclusión y podrás retomarlo después desde el principio.</p>${saltar}`, botones);
  if (v === 'saltar') { E.semillas -= costo; E.hechos[n.id] = true; irTrasRecarga(`saltar:${n.id}`); }
  else if (v === 'salir') irTrasRecarga(`salir:${n.id}`);
  else if (v === 'inicio') irTrasRecarga('inicio');
});
document.addEventListener('click', ev => { if (ev.target.closest('.btn, .opcion') && !Audio_.ctx) { Audio_.iniciar(); Audio_.ambiente(); } });

(async function arrancar() {
  let ir = null;
  try { ir = sessionStorage.getItem('encanto-ir'); sessionStorage.removeItem('encanto-ir'); } catch (e) { /* sin almacenamiento */ }
  const m = ir && E.avatar ? ir.match(/^(saltar|salir):(\d)$/) : null;
  if (!m) return portada();
  const id = +m[2], n = NIVELES[id - 1];
  modo('historia'); hud(`Nivel ${id} · ${n.nombre}`);
  escena(['fondo-territorio.jpg', 'fondo-institucional.jpg', 'fondo-balanza.jpg', 'fondo-audiencia.jpg', 'fondo-reunion.jpg'][id - 1], n.lugar);
  panel(`<p class="ante">Nivel ${id} · ${n.nombre}</p><h2>${m[1] === 'saltar' ? 'Nivel saltado' : 'Saliste del nivel'}</h2><p>Antes de seguir, esto es lo esencial que deja este nivel.</p>`);
  await conclusion(id);
  await modal(m[1] === 'saltar'
    ? `<div class="logro"><span class="logro-ico">⏭</span><h2>Nivel saltado</h2><p>El camino sigue abierto, pero este nivel no te dejó insignia ni semillas. Puedes volver a jugarlo cuando quieras para ganarlas.</p></div>`
    : `<div class="logro"><span class="logro-ico">🧭</span><h2>De vuelta en el camino</h2><p>El nivel queda pendiente. Cuando regreses empezará desde el principio; tus semillas e insignias siguen contigo.</p></div>`,
    [{ t: 'Ir al camino ›', v: 1, c: 'primario' }]);
  Audio_.iniciar(); camino();
})();
