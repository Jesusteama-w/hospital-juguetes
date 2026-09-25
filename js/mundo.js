/* ============================================================
   FUNCIONALIDAD · El mundo alrededor del libro.
   - Capas de juguetes flotando atrás (lejos: chicos y borrosos; medio: grandes).
   - Juguetes que se asoman por detrás de los bordes del libro.
   - Personajes sentados en el borde del libro (se pueden tocar).
   - Cosas que salen del libro hacia afuera (chispitas, notificaciones, corazones…).
   - Flecha-guía con una luciérnaga que apunta, desde afuera, a lo que hay que tocar.
   Usa window.SPRITES (renders 3D) y, si faltan, los dibujos de ILU.vector().
   ============================================================ */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const R = (a, b) => a + Math.random() * (b - a);
  const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* Ánimo del mundo por escena: color de la luz y qué sale del libro */
  const ANIMOS = {
    portada:       { animo: 'noche',  sale: 'luciernagas' },
    hospitalNoche: { animo: 'noche',  sale: 'luciernagas' },
    sala:          { animo: 'noche',  sale: 'corazones' },
    reemplazo:     { animo: 'frio',   sale: 'notis' },
    antes:         { animo: 'dia',    sale: 'barrilete' },
    atrapados:     { animo: 'frio',   sale: 'notis' },
    cofre:         { animo: 'noche',  sale: 'luciernagas' },
    chispitas:     { animo: 'calido', sale: 'chispas' },
    tres:          { animo: 'calido', sale: 'chispas' },
    caramelo:      { animo: 'frio',   sale: 'caramelos' },
    ventana:       { animo: 'noche',  sale: 'luciernagas' },
    soltar:        { animo: 'calido', sale: 'luciernagas' },
    jugamos:       { animo: 'dia',    sale: 'chispas' },
    cura:          { animo: 'dia',    sale: 'corazones' },
    final:         { animo: 'dia',    sale: 'chispas' }
  };

  const JUGUETES = ['osito-feliz', 'robot-feliz', 'pelota', 'tren', 'bloques', 'pato', 'trompo', 'cohete', 'barrilete'];

  /* Nodo de un juguete: render 3D si existe; si no, dibujo vectorial; si no, nada */
  function nodoJuguete(n) {
    const sp = window.SPRITES && window.SPRITES[n];
    if (sp) { const im = new Image(); im.src = sp.src; im.alt = ''; im.draggable = false; im.decoding = 'async'; return im; }
    const v = window.ILU && window.ILU.vector && window.ILU.vector(n.replace(/-(feliz|triste)$/, ''));
    if (v) { const d = document.createElement('div'); d.innerHTML = v; return d.firstElementChild; }
    return null;
  }
  const disponibles = () => JUGUETES.filter(n => (window.SPRITES && window.SPRITES[n]) || (window.ILU.vector && window.ILU.vector(n.replace(/-(feliz|triste)$/, ''))));

  let W = innerWidth, H = innerHeight, libroEl, rectLibro = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  let spread = 0, sale = null, saleTimer = null, asomoTimer = null, onToqueBorde = null;
  const cam = { x: 0, y: 0, tx: 0, ty: 0 }, puntero = { x: 0, y: 0, cx: 0, cy: 0 };
  const capas = [];

  /* ---------- Capas de juguetes flotantes ---------- */
  function poblar() {
    const lejos = $('#capaLejos'), medio = $('#capaMedio');
    lejos.innerHTML = ''; medio.innerHTML = '';
    capas.length = 0;
    capas.push({ el: lejos, prof: .25 }, { el: medio, prof: .6 });
    const lista = disponibles(); if (!lista.length) return;
    const chico = Math.min(W, H) < 600;
    const cx = W / 2, cy = H / 2;
    // lejos: por toda la pantalla
    const nL = chico ? 9 : 14;
    for (let i = 0; i < nL; i++) poner(lejos, lista[i % lista.length], R(0, W), R(0, H), chico ? R(28, 46) : R(40, 70));
    // medio: en anillo alrededor del libro (se asoman por los bordes y ocupan los márgenes)
    const nM = chico ? 7 : 10;
    const rx = Math.max(rectLibro.width / 2 + (chico ? 10 : 60), W * .3), ry = Math.max(rectLibro.height / 2 + (chico ? 6 : 40), H * .3);
    for (let i = 0; i < nM; i++) {
      const a = (i / nM) * Math.PI * 2 + R(-.25, .25);
      const s = chico ? R(52, 78) : R(80, 130);
      poner(medio, lista[(i * 3 + 1) % lista.length], cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, s);
    }
    // pantallas frías: solo se ven cuando el ánimo es "frio"
    for (let i = 0; i < (chico ? 3 : 5); i++) {
      const a = R(0, Math.PI * 2);
      const f = poner(medio, 'celular', cx + Math.cos(a) * rx * R(.9, 1.2), cy + Math.sin(a) * ry * R(.9, 1.2), chico ? R(40, 58) : R(60, 90));
      if (f) f.classList.add('pantalla');
    }
  }
  function poner(capa, n, x, y, s) {
    const nodo = nodoJuguete(n); if (!nodo) return null;
    const f = document.createElement('div');
    f.className = 'flotante';
    f.style.width = s + 'px';
    f.style.transform = `translate(${(x - s / 2).toFixed(0)}px, ${(y - s / 2).toFixed(0)}px)`;
    const g = document.createElement('div'); g.className = 'gira';
    g.style.setProperty('--dur', R(6, 12).toFixed(1) + 's');
    g.style.setProperty('--del', (-R(0, 10)).toFixed(1) + 's');
    const r = R(6, 16);
    g.style.setProperty('--r0', (-r).toFixed(0) + 'deg'); g.style.setProperty('--r1', r.toFixed(0) + 'deg');
    g.appendChild(nodo); f.appendChild(g); capa.appendChild(f);
    return f;
  }

  /* ---------- Asomos: un juguete sale de atrás del libro y saluda ---------- */
  function asomar() {
    const lista = disponibles(); if (!lista.length || !rectLibro.width) return;
    const n = elegir(lista), nodo = nodoJuguete(n); if (!nodo) return;
    const chico = Math.min(W, H) < 600, s = chico ? R(58, 76) : R(90, 130);
    const lados = ['arriba', 'abajo', 'izq', 'der'];
    const lado = elegir(lados);
    let x, y, ax = 0, ay = 0, ar;
    const b = rectLibro;
    if (lado === 'arriba') { x = R(b.left + s * .2, b.right - s * 1.2); y = b.top + s * .15; ay = -s * .78; }
    if (lado === 'abajo') { x = R(b.left + s * .2, b.right - s * 1.2); y = b.bottom - s * 1.15; ay = s * .8; }
    if (lado === 'izq') { x = b.left + s * .1; y = R(b.top + s * .2, b.bottom - s * 1.2); ax = -s * .8; }
    if (lado === 'der') { x = b.right - s * 1.1; y = R(b.top + s * .2, b.bottom - s * 1.2); ax = s * .8; }
    ar = (lado === 'izq' ? -1 : 1) * R(8, 16);
    const a = document.createElement('div');
    a.className = 'asomo';
    a.style.cssText = `width:${s}px;left:${x}px;top:${y}px;--ax:${ax}px;--ay:${ay}px;--ar:${ar}deg`;
    a.appendChild(nodo);
    $('#asomos').appendChild(a);
    setTimeout(() => a.remove(), 3500);
  }

  /* ---------- Personajes en el borde del libro ---------- */
  const bordes = [];
  function crearBordes() {
    const cont = $('#bordes'); cont.innerHTML = ''; bordes.length = 0;
    const defs = [
      { n: 'robot', sprite: 'robot-feliz', triste: 'robot-triste', donde: 'arriba-izq', say: ['¡Bip!', 'Cric, cric…', '¡Tocá la flecha!', '¡Seguí leyendo!'] },
      { n: 'osito', sprite: 'osito-feliz', triste: 'osito-triste', donde: 'der-abajo', say: ['¡Hola!', '¿Me das un abrazo?', '¿Qué pasará?', '¡Dale, pasá la página!'] }
    ];
    defs.forEach(d => {
      const el = document.createElement('div');
      el.className = 'borde-pj oculto';
      el.setAttribute('aria-hidden', 'true');
      const c = document.createElement('div'); c.className = 'cuerpo';
      el.appendChild(c); cont.appendChild(el);
      const pj = { ...d, el, c, triste_: null };
      pintarBorde(pj, false);
      el.addEventListener('click', (e) => { e.stopPropagation(); tocarBorde(pj); });
      bordes.push(pj);
    });
  }
  function pintarBorde(pj, triste) {
    if (pj.triste_ === triste) return;
    pj.triste_ = triste;
    const nodo = nodoJuguete(triste && window.SPRITES[pj.triste] ? pj.triste : pj.sprite);
    pj.c.innerHTML = ''; if (nodo) pj.c.appendChild(nodo);
  }
  function tocarBorde(pj) {
    pj.el.classList.remove('salta'); void pj.el.offsetWidth; pj.el.classList.add('salta');
    const r = pj.el.getBoundingClientRect();
    globo(r.left + r.width / 2, r.top - 4, elegir(pj.say));
    if (onToqueBorde) onToqueBorde(pj.n);
  }
  function globo(x, y, texto) {
    const g = document.createElement('div');
    g.className = 'globo-html'; g.textContent = texto;
    g.style.left = Math.max(60, Math.min(W - 60, x)) + 'px'; g.style.top = Math.max(60, y) + 'px';
    document.body.appendChild(g); setTimeout(() => g.remove(), 2100);
  }
  function ubicarBordes() {
    const b = rectLibro, chico = Math.min(W, H) < 600;
    bordes.forEach(pj => {
      let s, x, y, ver = true;
      if (pj.donde === 'arriba-izq') {
        s = chico ? 46 : 70;
        x = b.left + b.width * .08; y = b.top - s * .92;
        if (y < (chico ? 40 : 50)) y = b.top - s * .62; // si no entra, se hunde un poco en el borde
      } else {
        s = chico ? 50 : 84;
        const margen = W - b.right;
        if (margen > s * .7) { x = b.right - s * .28; y = b.bottom - s * 1.25; }
        else { x = b.right - s * .9; y = b.bottom - s * .35; ver = !chico || b.bottom + s * .6 < H - 60; }
      }
      pj.el.style.width = s + 'px';
      pj.el.style.left = x + 'px'; pj.el.style.top = y + 'px';
      pj.el.classList.toggle('oculto', !ver || spread === 0 && pj.n === 'osito');
    });
  }

  /* ---------- Cosas que salen del libro ---------- */
  const ESTRELLA = 'M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9Z';
  const CORAZON = 'M0 8 C-14 -2 -10 -16 0 -9 C10 -16 14 -2 0 8Z';
  function svgMini(inner, vb = '-12 -12 24 24') { return `<svg viewBox="${vb}" xmlns="${NS}">${inner}</svg>`; }
  function volar(html, x, y, s, keyframes, dur) {
    const capa = $('#frenteMundo');
    if (capa.childElementCount > 22) return;
    const v = document.createElement('div');
    v.className = 'volador'; v.style.width = s + 'px'; v.innerHTML = html;
    capa.appendChild(v);
    const k = keyframes.map(f => ({ transform: `translate(${x + (f.dx || 0)}px, ${y + (f.dy || 0)}px) rotate(${f.r || 0}deg) scale(${f.s == null ? 1 : f.s})`, opacity: f.o == null ? 1 : f.o }));
    const an = v.animate(k, { duration: dur, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'forwards' });
    an.onfinish = () => v.remove();
  }
  const EMISORES = {
    luciernagas() {
      const b = rectLibro, lado = Math.random() < .5;
      const x = lado ? R(b.left - 40, b.left + 30) : R(b.right - 30, b.right + 40), y = R(b.top, b.bottom);
      volar(svgMini('<circle r="10" fill="rgba(240,194,122,.25)"/><circle r="3.2" fill="#f3dca0"/>'), x, y, 22,
        [{ o: 0, s: .5 }, { dx: R(-30, 30), dy: R(-50, -20), o: 1 }, { dx: R(-60, 60), dy: R(-120, -60), o: 0, s: .6 }], R(3000, 5000));
    },
    chispas() {
      const b = rectLibro, x = R(b.left + 10, b.right - 10), y = R(b.top - 10, b.top + b.height * .3);
      const c = elegir(['#e6d3a3', '#f3dca0', '#e0b08f', '#fff5dc']);
      volar(svgMini(`<path d="${ESTRELLA}" fill="${c}"/>`), x, y, R(12, 22),
        [{ o: 0, s: .3 }, { dy: -40, o: 1, s: 1, r: 60 }, { dx: R(-80, 80), dy: -R(160, 320), o: 0, s: .5, r: 200 }], R(2200, 3400));
    },
    corazones() {
      const b = rectLibro, x = R(b.left, b.right), y = b.top + R(0, b.height * .4);
      volar(svgMini(`<path d="${CORAZON}" fill="${elegir(['#c98a7a', '#b5533c', '#d49a8c'])}"/>`), x, y, R(14, 24),
        [{ o: 0, s: .4 }, { dy: -30, o: .95 }, { dx: R(-50, 50), dy: -R(150, 260), o: 0, s: .7 }], R(2600, 3800));
    },
    notis() {
      const b = rectLibro, cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
      const a = R(0, Math.PI * 2), d = Math.max(b.width, b.height) * .55;
      const html = svgMini('<rect x="-22" y="-9" width="44" height="18" rx="6" fill="rgba(20,40,60,.8)" stroke="#7fd6ff" stroke-width="1.2"/><circle cx="-14" cy="0" r="3.5" fill="#7fd6ff"/><rect x="-7" y="-4" width="22" height="2.6" rx="1.3" fill="#9fdcff"/><rect x="-7" y="1.5" width="14" height="2.6" rx="1.3" fill="#5f9fc0"/>', '-24 -11 48 22');
      volar(html, cx + Math.cos(a) * d * .5, cy + Math.sin(a) * d * .5, R(46, 70),
        [{ o: 0, s: .6 }, { dx: Math.cos(a) * 30, dy: Math.sin(a) * 30, o: .95, s: 1 }, { dx: Math.cos(a) * d, dy: Math.sin(a) * d, o: 0, s: .8 }], R(2600, 3600));
    },
    caramelos() {
      const b = rectLibro, x = R(b.left, b.right), y = R(b.top, b.bottom);
      const sp = window.SPRITES && window.SPRITES.caramelo;
      const html = sp ? `<img src="${sp.src}" alt="">` : svgMini('<path d="M-6 0 L-12 -5 L-11 0 L-12 5Z M6 0 L12 -5 L11 0 L12 5Z" fill="#d49a8c"/><ellipse rx="7" ry="5" fill="#b5533c"/>');
      volar(html, x, y, R(28, 44),
        [{ o: 0, s: .3 }, { dx: R(-40, 40), dy: -R(40, 80), o: 1, s: 1, r: R(-30, 30) }, { dx: R(-60, 60), dy: -R(90, 140), o: 0, s: 0, r: R(-60, 60) }], R(2000, 2800));
    },
    barrilete() {
      if ($('#frenteMundo .barrilete-v')) { EMISORES.chispas(); return; }
      const sp = window.SPRITES && window.SPRITES.barrilete;
      const html = sp ? `<img src="${sp.src}" alt="">` : (window.ILU.vector('barrilete') || '');
      const capa = $('#frenteMundo');
      const v = document.createElement('div'); v.className = 'volador barrilete-v'; const s = Math.min(W, H) < 600 ? 70 : 110;
      v.style.width = s + 'px'; v.innerHTML = html; capa.appendChild(v);
      const y0 = Math.max(40, rectLibro.top - s * .9);
      const an = v.animate([
        { transform: `translate(${-s}px, ${y0 + 30}px) rotate(-10deg)` },
        { transform: `translate(${W * .3}px, ${y0 - 10}px) rotate(8deg)` },
        { transform: `translate(${W * .6}px, ${y0 + 20}px) rotate(-6deg)` },
        { transform: `translate(${W + s}px, ${y0 - 20}px) rotate(10deg)` }
      ], { duration: 9000, easing: 'ease-in-out' });
      an.onfinish = () => v.remove();
    }
  };
  function arrancarSalida(tipo) {
    clearInterval(saleTimer); sale = tipo;
    if (!tipo || !EMISORES[tipo]) return;
    const ritmo = { luciernagas: 700, chispas: 260, corazones: 600, notis: 900, caramelos: 700, barrilete: 1200 }[tipo] || 800;
    saleTimer = setInterval(() => { if (!document.hidden) EMISORES[tipo](); }, ritmo);
  }

  /* ---------- Flecha-guía ---------- */
  let guiaTimer = null, guiaEl = null;
  function limpiarGuia() {
    clearTimeout(guiaTimer); guiaEl = null;
    const g = $('#guia'); g.classList.add('fuera');
    setTimeout(() => { if (!guiaEl) g.innerHTML = ''; }, 400);
  }
  function guiar(el, demora = 2200) {
    clearTimeout(guiaTimer);
    guiaTimer = setTimeout(() => { guiaEl = el; dibujarGuia(); }, demora);
  }
  function dibujarGuia() {
    const g = $('#guia'); if (!guiaEl || !guiaEl.isConnected) { g.innerHTML = ''; return; }
    const r = guiaEl.getBoundingClientRect(); if (!r.width) return;
    const tx = r.left + r.width / 2, ty = r.top + r.height * .45;
    const b = rectLibro;
    const barra = 56, ruta = 80;
    // elegir desde dónde viene: el lado con más lugar libre
    const op = [
      { x: b.left - 34, y: ty, esp: b.left },
      { x: b.right + 34, y: ty, esp: W - b.right },
      { x: tx, y: b.top - 30, esp: b.top - barra },
      { x: tx + 40, y: b.bottom + 26, esp: H - ruta - b.bottom }
    ].sort((a, c) => c.esp - a.esp)[0];
    let sx = Math.max(18, Math.min(W - 18, op.x)), sy = Math.max(barra * .6, Math.min(H - ruta * .5, op.y));
    // curva
    const dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy) || 1;
    const ex = tx - dx / len * 22, ey = ty - dy / len * 22;
    const mx = (sx + ex) / 2 - dy / len * len * .25, my = (sy + ey) / 2 + dx / len * len * .25;
    const ang = Math.atan2(ey - my, ex - mx) * 180 / Math.PI;
    g.innerHTML = `
      <path class="trazo trazo-dibujo" d="M${sx} ${sy} Q${mx} ${my} ${ex} ${ey}"/>
      <g transform="translate(${ex} ${ey}) rotate(${ang})"><path class="punta" d="M4 0 L-9 -7 L-6 0 L-9 7Z"/></g>
      <circle class="aro" cx="${tx}" cy="${ty}" r="16"/>
      <g class="luciernaga" transform="translate(${sx} ${sy})"><g class="brillo"><circle r="14" fill="rgba(240,194,122,.28)"/><circle r="5" fill="#f3dca0"/><path d="${ESTRELLA}" transform="scale(.9)" fill="#fff6dc" opacity=".8"/></g></g>`;
    g.classList.remove('fuera');
  }

  /* ---------- Bucle: cámara, parallax y seguimiento del libro ---------- */
  function medirLibro() {
    const r = libroEl.getBoundingClientRect();
    rectLibro = { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  }
  let ultimoRect = '';
  function bucle() {
    medirLibro();
    const clave = `${rectLibro.left | 0},${rectLibro.top | 0},${rectLibro.width | 0}`;
    if (clave !== ultimoRect) { ultimoRect = clave; ubicarBordes(); }
    cam.x += (cam.tx - cam.x) * .03; cam.y += (cam.ty - cam.y) * .03;
    puntero.cx += (puntero.x - puntero.cx) * .05; puntero.cy += (puntero.y - puntero.cy) * .05;
    capas.forEach(c => {
      const px = (cam.x + puntero.cx * 40) * c.prof, py = (cam.y + puntero.cy * 26) * c.prof;
      c.el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    });
    requestAnimationFrame(bucle);
  }

  /* ---------- API ---------- */
  window.MUNDO = {
    init(libro, alTocarBorde) {
      libroEl = libro; onToqueBorde = alTocarBorde;
      medirLibro(); poblar(); crearBordes(); ubicarBordes();
      addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { puntero.x = e.clientX / W - .5; puntero.y = e.clientY / H - .5; } });
      clearInterval(asomoTimer);
      asomoTimer = setInterval(() => { if (!document.hidden && spread > 0) asomar(); }, 5200);
      requestAnimationFrame(bucle);
    },
    medir() {
      W = innerWidth; H = innerHeight; medirLibro(); poblar(); ubicarBordes();
      if (guiaEl) dibujarGuia();
    },
    alPasar(i, escena, dir = 1) {
      spread = i;
      const a = ANIMOS[escena] || ANIMOS.portada;
      document.body.className = document.body.className.replace(/\banimo-\w+/g, '').trim() + ' animo-' + a.animo;
      arrancarSalida(a.sale);
      // la cámara viaja un poco con cada página: los juguetes de atrás se corren
      cam.tx = Math.sin(i * 1.3) * 70; cam.ty = Math.cos(i * .9) * 36;
      const triste = a.animo === 'frio';
      bordes.forEach(pj => {
        pintarBorde(pj, triste);
        pj.el.classList.remove('salta'); void pj.el.offsetWidth; pj.el.classList.add('salta');
      });
      ubicarBordes();
      limpiarGuia();
      if (i > 0 && dir > 0 && Math.random() < .6) setTimeout(asomar, 1200);
    },
    guiar, limpiarGuia, globo,
    confetiDesde: null
  };
})();
