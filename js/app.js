/* ============================================================
   FUNCIONALIDAD · Libro que se abre y pasa de página.
   Cada doble página muestra dos caras a la vez:
     izquierda (compu) / arriba (celu)  = dorso de la hoja anterior → ilustración
     derecha  (compu) / abajo  (celu)   = frente de la hoja actual  → texto
   - Pasar página: botones, tocar el texto, deslizar el dedo, teclado o la esquina.
   - Tocar las ilustraciones: saltos, chispitas, globitos.
   - Sonido (Web Audio, sin archivos) y lectura en voz alta (voz del sistema).
   - El mundo de afuera del libro vive en js/mundo.js.
   ============================================================ */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const C = window.CUENTO, ILU = window.ILU;
  let E = window.ESCENAS;

  history.scrollRestoration = 'manual';

  const libro = $('#libro'), btnAnt = $('#ant'), btnSig = $('#sig');
  const trencito = $('#trencito'), contador = $('#contador'), estaciones = $('#estaciones');
  const P = C.paginas;
  const N = P.length;              // hojas del libro (una por página del cuento)
  let hojas = [], actual = 0, bloqueo = 0, timers = [];
  let modo = 'v';

  const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  const leerLS = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  const MANO = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 14.6a1.5 1.5 0 0 1 2.4-1.8L9 15" fill="#f3ebdc" stroke="#2e2a33" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ADORNO = `<svg class="adorno" viewBox="0 0 160 20" aria-hidden="true"><path d="M4 10 H62 M98 10 H156" stroke="#b39a6a" stroke-width="1.2" stroke-linecap="round"/><path d="M80 2 Q81.6 8.4 88 10 Q81.6 11.6 80 18 Q78.4 11.6 72 10 Q78.4 8.4 80 2Z" fill="#c9a45c"/><circle cx="66" cy="10" r="1.8" fill="#c9a45c"/><circle cx="94" cy="10" r="1.8" fill="#c9a45c"/></svg>`;

  /* ============ Sonido ============ */
  const Sonido = {
    ctx: null, on: leerLS('cuento-sonido') !== '0', master: null, musicaGain: null, musicaTimer: null,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = .9; this.master.connect(this.ctx.destination);
      this.musicaGain = this.ctx.createGain(); this.musicaGain.gain.value = .5; this.musicaGain.connect(this.master);
    },
    nota(f, t0 = 0, dur = .3, tipo = 'triangle', vol = .14, destino) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
      o.type = tipo; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(destino || this.master); o.start(t); o.stop(t + dur + .05);
      return o;
    },
    hoja() {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime, dur = .45;
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .8;
      bp.frequency.setValueAtTime(700, t); bp.frequency.exponentialRampToValueAtTime(3200, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      src.connect(bp).connect(g).connect(this.master); src.start(t);
    },
    ESCALA: [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66],
    blip() { this.nota(this.ESCALA[Math.floor(Math.random() * 5)], 0, .25, 'triangle', .16); },
    chispas() { [0, .06, .12, .18].forEach((t, i) => this.nota(this.ESCALA[3 + (i % 4)] * (i > 2 ? 1 : 1), t, .35, 'sine', .1)); },
    boing() {
      if (!this.on || !this.ctx) return;
      const o = this.nota(220, 0, .5, 'sine', .22); if (o) o.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + .25);
    },
    pop() {
      if (!this.on || !this.ctx) return;
      const o = this.nota(900, 0, .18, 'sine', .2); if (o) o.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + .15);
    },
    triste() { [0, .18].forEach((t, i) => this.nota([392, 330][i], t, .5, 'sine', .1)); },
    fanfarria() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.nota(f, i * .11, i === 3 ? .7 : .25, 'triangle', .15)); },
    /* Cajita de música suave de fondo */
    MELODIA: [659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 659.25, 587.33, 0, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 880, 783.99, 659.25, 587.33, 523.25, 0],
    musica() {
      if (this.musicaTimer || !this.ctx) return;
      let i = 0;
      this.musicaTimer = setInterval(() => {
        const f = this.MELODIA[i++ % this.MELODIA.length];
        if (f) { this.nota(f, 0, 1.1, 'sine', .045, this.musicaGain); if (i % 4 === 1) this.nota(f / 2, 0, 1.4, 'triangle', .025, this.musicaGain); }
      }, 480);
    },
    pararMusica() { clearInterval(this.musicaTimer); this.musicaTimer = null; },
    bajar(si) { if (this.musicaGain) this.musicaGain.gain.setTargetAtTime(si ? .12 : .5, this.ctx.currentTime, .3); }
  };

  /* ============ Voz ============ */
  /* ============ Voz ============
     1) Si hay narración grabada en assets/voz/ (01.mp3, 02.mp3… portada.mp3, final.mp3), usa eso.
     2) Si no, usa la voz del sistema, eligiendo la más natural que haya y limpiando
        lo que la voz robótica lee mal ("Shhh" deletreado, rayas de diálogo, etc.). */
  const EXT_VOZ = ['mp3', 'm4a', 'ogg', 'wav'];
  const cacheVoz = {};
  async function buscarAudio(clave) {
    if (clave in cacheVoz) return cacheVoz[clave];
    for (const e of EXT_VOZ) {
      const url = `assets/voz/${clave}.${e}`;
      try { const r = await fetch(url, { method: 'HEAD', cache: 'no-cache' }); if (r.ok) return (cacheVoz[clave] = url + '?v=2'); } catch (_) { }
    }
    return (cacheVoz[clave] = null);
  }
  const claveVoz = (s) => s === 0 ? 'portada' : P[s].tipo === 'final' ? 'final' : String(s).padStart(2, '0');
  const TEXTO_EXTRA = { portada: 'El hospital de los juguetes olvidados.', final: '¡Tu turno! Toto, Cric y todos te están esperando. ¿A qué jugamos hoy?' };

  /* Lo que la voz del sistema lee mal, escrito como se tiene que decir */
  function paraVozSistema(t) {
    return t
      .replace(/\bs+h+\b[.…]*/gi, '… ')          // "Shhh…" → una pausa (la voz lo deletreaba)
      .replace(/\bclonc\b/gi, 'clonk')
      .replace(/chu-chu/gi, 'chu chu')
      .replace(/[—–“”«»*]/g, ' ')
      .replace(/…/g, '... ')
      .replace(/\s+/g, ' ').trim();
  }

  const Voz = {
    ok: 'speechSynthesis' in window, on: false, voz: null, spans: [], offsets: [], audio: null, turno: 0,
    elegir() {
      if (!this.ok) return;
      const vs = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
      const acento = { 'es-AR': 6, 'es-419': 5, 'es-US': 5, 'es-MX': 4, 'es-UY': 6, 'es-CL': 3, 'es-CO': 3, 'es-ES': 1 };
      const puntos = (v) => (acento[v.lang.replace('_', '-')] || 2)
        + (/natural|neural|online|premium|enhanced|mejorad/i.test(v.name) ? 10 : 0)
        + (/google/i.test(v.name) ? 4 : 0)
        + (/elena|tomas|dalia|paloma|helena|sabina|paulina|monica|mónica/i.test(v.name) ? 2 : 0)
        - (v.localService === false ? 0 : .5);
      this.voz = vs.sort((a, b) => puntos(b) - puntos(a))[0] || null;
    },
    marcar(k) { this.spans.forEach((s, i) => s.classList.toggle('dice', i === k)); },
    async leer(hoja, s) {
      if (!this.on) return;
      this.parar();
      const turno = ++this.turno;
      const p = hoja && $('.texto p', hoja);
      const spans = p ? $$('.w', p) : [];
      const texto = p ? spans.map(x => x.textContent).join(' ').replace(/\s+([?.,:!…])/g, '$1') : (TEXTO_EXTRA[claveVoz(s)] || '');
      if (!texto) return;
      this.spans = spans;
      const fin = () => { this.marcar(-1); Sonido.bajar(false); };
      const alTerminar = () => { fin(); if (actual < N - 1) btnSig.classList.add('pulso'); };

      const url = await buscarAudio(claveVoz(s));
      if (turno !== this.turno) return;              // pasó de página mientras buscaba
      if (url) {
        // Narración grabada. La palabra marcada avanza según el largo de cada palabra.
        const a = this.audio = new Audio(url);
        const pesos = spans.map(x => x.textContent.length + 2), total = pesos.reduce((m, n) => m + n, 0) || 1;
        const acum = []; pesos.reduce((m, n, i) => (acum[i] = (m + n) / total, m + n), 0);
        a.ontimeupdate = () => {
          if (!a.duration) return;
          const f = Math.max(0, (a.currentTime - .25) / Math.max(.5, a.duration - .6));
          this.marcar(acum.findIndex(x => x >= f));
        };
        a.onended = alTerminar; a.onerror = fin;
        Sonido.bajar(true);
        a.play().catch(fin);
        return;
      }
      if (!this.ok) return;
      this.offsets = [];
      let pos = 0;
      spans.forEach(x => { const i = texto.indexOf(x.textContent, pos); this.offsets.push(i); pos = i + x.textContent.length; });
      // se habla la versión limpia, pero la marca de palabras sigue la original (misma cantidad aprox.)
      const hablado = paraVozSistema(texto);
      const u = new SpeechSynthesisUtterance(hablado);
      u.lang = this.voz ? this.voz.lang : 'es-AR'; if (this.voz) u.voice = this.voz;
      u.rate = .92; u.pitch = 1.12;
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return;
        const f = e.charIndex / Math.max(1, hablado.length);
        let k = -1; this.offsets.forEach((o, i) => { if (o / Math.max(1, texto.length) <= f + .01) k = i; });
        this.marcar(k);
      };
      u.onerror = fin; u.onend = alTerminar;
      Sonido.bajar(true);
      speechSynthesis.speak(u);
    },
    parar() {
      this.turno++;
      if (this.audio) { this.audio.pause(); this.audio = null; }
      if (this.ok) speechSynthesis.cancel();
      this.marcar(-1); Sonido.bajar(false);
    }
  };
  if (Voz.ok) { Voz.elegir(); speechSynthesis.onvoiceschanged = () => Voz.elegir(); }

  /* ============ Renders 3D (assets/juguetes) ============ */
  async function cargarSprites() {
    try {
      const r = await fetch('assets/juguetes/manifest.json', { cache: 'no-cache' });
      if (!r.ok) return;
      const man = await r.json();
      const cargas = Object.entries(man).map(([archivo, d]) => new Promise(res => {
        const nombre = archivo.replace(/\.(webp|png)$/i, '');
        const src = 'assets/juguetes/' + (/\.(webp|png)$/i.test(archivo) ? archivo : archivo + '.webp');
        const im = new Image();
        im.onload = () => { window.SPRITES[nombre] = { src, w: d.w || im.naturalWidth, h: d.h || im.naturalHeight, base: d.base || [.5, .96] }; res(); };
        im.onerror = res; im.src = src;
      }));
      await Promise.race([Promise.all(cargas), new Promise(r => setTimeout(r, 6000))]);
    } catch (e) { /* sin renders: quedan los dibujos vectoriales */ }
  }

  /* ============ Construir el libro ============ */
  /* Cada palabra (con su puntuación pegada) es un <span class="w">; lo destacado va en <b class="acc">. */
  function palabras(texto) {
    const lista = [];
    let acc = false, seg = [], txt = '';
    const cortarSeg = () => { if (txt) seg.push([txt, acc]); txt = ''; };
    const cortarPal = () => { cortarSeg(); if (seg.length) lista.push(seg); seg = []; };
    for (const ch of texto) {
      if (ch === '*') { cortarSeg(); acc = !acc; }
      else if (/\s/.test(ch)) cortarPal();
      else txt += ch;
    }
    cortarPal();
    return lista.map((s, i) =>
      `<span class="w" style="--i:${i}">${s.map(([t, a]) => a ? `<b class="acc">${t}</b>` : t).join('')}</span>`).join(' ');
  }
  const letras = (txt) => {
    let i = 0;
    return txt.split(' ').map(p => `<span class="pal">${[...p].map(ch => `<span class="l" style="--i:${i++}">${ch}</span>`).join('')}</span>`).join(' ');
  };
  const svgEscena = (nombre) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g class="camara">${E[nombre]()}</g></svg>`;

  /* Frente de la hoja k: tapa, texto de la página k o la página final interactiva */
  function frente(k) {
    const p = P[k];
    if (p.tipo === 'portada') {
      return `<div class="tapa" data-accion="abrir" role="button" aria-label="Abrir el cuento">
        <div class="tapa-etq">Un cuento para jugar de verdad</div>
        <h1 class="titulo">${letras('El hospital de los')}<br><em>${letras('juguetes olvidados')}</em></h1>
        <div class="tapa-ilu"><div class="medallon">${svgEscena('portada')}</div></div>
        <div class="abrir-hint"><span class="punto"></span>Tocá la tapa para abrir</div>
        <div class="cinta"></div>
      </div>`;
    }
    if (p.tipo === 'final') {
      const hecha = leerLS('cuento-promesa') === '1';
      return `<div class="final-der">
        <div class="ruleta" id="ruleta">
          <div class="ruleta-caja"><span class="r-icono">🎁</span><span class="r-texto">¿A qué jugamos hoy?</span></div>
          <button class="btn-suave" data-accion="sortear">Sortear un juego</button>
        </div>
        <button class="promesa${hecha ? ' hecha' : ''}" data-accion="prometer">⭐ Prometo jugar hoy sin pantalla <span class="sello">¡Prometido!</span></button>
        <div class="final-links">
          <button class="link-btn" data-accion="releer">↺ Leer otra vez</button>
          <button class="link-btn" data-accion="grandes">Para los grandes</button>
        </div>
      </div>`;
    }
    return `<div class="pag-txt">
      ${p.grande ? '' : ADORNO}
      <div class="texto${p.grande ? ' grande' : ''}"><p>${palabras(p.texto)}</p></div>
      <div class="folio">${k}</div>
    </div>
    <button class="esquina" data-accion="sig" aria-label="Pasar la página"></button>`;
  }

  /* Dorso de la hoja k: la ilustración de la página siguiente */
  function dorso(k) {
    if (k >= N - 1) return `<div class="contratapa"></div>`;
    const p = P[k + 1];
    if (p.tipo === 'final') {
      return `<div class="pag-ilu"><div class="ilu" data-escena="final">${svgEscena('final')}
        <div class="final-titulo"><h2>¡Tu turno!</h2><p>Toto, Cric y todos te están esperando.</p></div></div></div>`;
    }
    return `<div class="pag-ilu"><div class="ilu" data-escena="${p.escena}">${svgEscena(p.escena)}${p.pista ? `<div class="pista">${MANO}<span>${p.pista}</span></div>` : ''}</div></div>`;
  }

  function construir() {
    E = window.ESCENAS;
    libro.innerHTML = '';
    P.forEach((p, k) => {
      const h = document.createElement('div');
      h.className = 'hoja' + (p.tipo ? ' ' + p.tipo : '');
      h.dataset.i = k;
      h.innerHTML = `<div class="cara frente">${frente(k)}</div><div class="cara dorso">${dorso(k)}</div>`;
      libro.appendChild(h);
    });
    hojas = $$('.hoja', libro);
    estaciones.innerHTML = hojas.map((_, i) => `<span class="estacion" style="left:${(i / (N - 1)) * 100}%"></span>`).join('');
    $('#consejos').innerHTML = C.consejos.map(c => `<li>${c}</li>`).join('');
    orden();
  }

  function orden() {
    hojas.forEach((h, k) => { h.style.zIndex = k < actual ? k + 1 : 2 * N - k; });
  }

  const escenaDe = (s) => s === 0 ? 'portada' : (P[s].escena || P[s].tipo);
  const caraTexto = (s) => hojas[s] && $('.frente', hojas[s]);
  const caraIlu = (s) => s > 0 ? $('.dorso', hojas[s - 1]) : null;

  /* ============ Medidas: libro horizontal (compu) o vertical (celu) ============ */
  function medir() {
    const W = innerWidth, H = innerHeight;
    const cs = getComputedStyle(document.documentElement);
    const barra = parseFloat(cs.getPropertyValue('--barra')) || 56, ruta = parseFloat(cs.getPropertyValue('--ruta')) || 80;
    const altoDisp = H - barra - ruta - 30, anchoDisp = W - 28;
    modo = W / H >= 1.05 ? 'h' : 'v';
    let pw, ph;
    if (modo === 'h') {
      const margen = Math.max(20, Math.min(W * .07, 130));   // aire a los costados para el mundo de afuera
      pw = (anchoDisp - 2 * margen) / 2; ph = altoDisp;
      if (pw / ph > 1.38) pw = ph * 1.38;
      if (pw / ph < 1.05) ph = pw / 1.05;
    } else {
      pw = Math.min(anchoDisp - 12, 620); ph = altoDisp / 2;
      if (pw / ph > 1.5) pw = ph * 1.5;
      if (pw / ph < 1.05) ph = pw / 1.05;
    }
    pw = Math.floor(Math.max(150, pw)); ph = Math.floor(Math.max(120, ph));
    document.documentElement.style.setProperty('--pw', pw + 'px');
    document.documentElement.style.setProperty('--ph', ph + 'px');
    document.body.classList.toggle('modo-h', modo === 'h');
    document.body.classList.toggle('modo-v', modo === 'v');
    ajustarTextos(pw, ph);
  }

  function ajustarTextos(pw, ph) {
    $$('.pag-txt', libro).forEach(caja => {
      const p = $('.texto p', caja); if (!p) return;
      const grande = caja.querySelector('.grande');
      let fs = grande ? Math.min(pw * .17, ph * .3) : Math.max(15, Math.min(34, pw * .056, ph * .08));
      p.style.fontSize = fs + 'px';
      let guarda = 0;
      while (caja.scrollHeight > caja.clientHeight + 1 && fs > 12 && guarda++ < 40) { fs -= .75; p.style.fontSize = fs + 'px'; }
    });
  }

  /* ============ Pasar páginas ============ */
  function limpiarTimers() { timers.forEach(clearTimeout); timers = []; }
  const luego = (fn, ms) => timers.push(setTimeout(fn, ms));
  const vibrar = () => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(8); } catch (e) { } };

  function siguiente() {
    if (actual >= N - 1 || Date.now() < bloqueo) return;
    Sonido.init();
    const h = hojas[actual];
    h.style.zIndex = 3 * N;
    h.classList.add('volteada', 'girando');
    Sonido.hoja(); vibrar();
    actual++;
    terminarGiro(h);
    activar(actual, 1);
  }

  function anterior() {
    if (actual <= 0 || Date.now() < bloqueo) return;
    Sonido.init();
    actual--;
    const h = hojas[actual];
    h.style.zIndex = 3 * N;
    h.classList.remove('volteada'); h.classList.add('girando');
    Sonido.hoja(); vibrar();
    terminarGiro(h);
    activar(actual, -1);
  }

  function irA(s) {
    Voz.parar();
    hojas.forEach((h, k) => { h.classList.toggle('volteada', k < s); h.classList.add('girando'); setTimeout(() => h.classList.remove('girando'), 1150); });
    Sonido.hoja();
    actual = s;
    setTimeout(orden, 1150);
    activar(s, -1);
  }

  function terminarGiro(h) {
    bloqueo = Date.now() + 450;
    setTimeout(() => { h.classList.remove('girando'); orden(); }, 1150);
  }

  function activar(s, dir) {
    limpiarTimers();
    Voz.parar();
    btnSig.classList.remove('pulso');
    const txt = caraTexto(s), ilu = caraIlu(s);
    // caras vivas: las dos que se ven (las animaciones solo corren ahí)
    $$('.cara.viva', libro).forEach(c => { if (c !== txt && c !== ilu) c.classList.remove('viva', 'tocado'); });
    [txt, ilu].forEach(c => { if (!c) return; c.classList.remove('viva', 'tocado'); void c.offsetWidth; c.classList.add('viva'); });
    hojas.forEach((h, k) => h.setAttribute('aria-hidden', k === s || k === s - 1 ? 'false' : 'true'));
    libro.classList.toggle('cerrado', s === 0);

    btnAnt.disabled = s === 0;
    btnSig.disabled = s === N - 1;
    contador.textContent = s === 0 ? 'Tapa' : s === N - 1 ? '¡Fin del cuento!' : `Página ${s} de ${N - 2}`;
    trencito.style.left = (s / (N - 1)) * 100 + '%';
    trencito.classList.add('andando');
    setTimeout(() => trencito.classList.remove('andando'), 1100);
    $$('.estacion', estaciones).forEach((e, k) => { e.classList.toggle('pasada', k < s); e.classList.toggle('aca', k === s); });

    const escena = escenaDe(s);
    window.MUNDO.alPasar(s, escena, dir);
    // la flecha de afuera apunta a lo que se puede tocar
    if (ilu) {
      const blanco = blancoDe(ilu, P[s].pista);
      if (blanco) window.MUNDO.guiar(blanco, 2400);
    } else if (s === 0) {
      window.MUNDO.guiar($('.abrir-hint', txt), 3200);
    }

    if (s === 1 && !leerLS('cuento-guia')) luego(() => btnSig.classList.add('pulso'), 6000);
    if (s >= 2) guardar('cuento-guia', '1');
    if (Voz.on) luego(() => Voz.leer(txt, s), s === 0 ? 300 : 1000);

    const gancho = GANCHOS[escena];
    if (gancho) gancho(ilu);
  }

  /* A qué apunta la flecha: lo que nombra la pista ("Tocá el reloj" → el reloj) */
  const CLAVES = { hospital: 'hospital', osito: 'osito', reloj: 'reloj', cofre: 'cofre', caramelo: 'caramelo', luna: 'luna', pelota: 'pelota', repetir: 'repetir', 'círculo': 'felices', chispitas: 'torre' };
  function blancoDe(ilu, pista = '') {
    const t = pista.toLowerCase();
    const k = Object.keys(CLAVES).find(c => t.includes(c));
    return (k && $(`.tocable[data-q="${CLAVES[k]}"]`, ilu)) || $('.tocable[data-say]', ilu) || $('.tocable', ilu);
  }

  /* Momentos especiales por página */
  const GANCHOS = {
    caramelo(c) { luego(() => { if (c && !c.classList.contains('tocado')) { const k = $('[data-fx="caramelo"]', c); if (k) comerCaramelo(k, $('svg', c)); } }, 4500); },
    jugamos() { luego(() => { confeti(innerWidth / 2, innerHeight * .4, 70); Sonido.fanfarria(); }, 1000); },
    cura() { luego(() => Sonido.chispas(), 900); },
    atrapados() { luego(() => Sonido.triste(), 1100); },
    final() { luego(() => { confeti(innerWidth / 2, innerHeight * .3, 50); Sonido.fanfarria(); }, 900); }
  };

  /* ============ Efectos al tocar ============ */
  function aSvg(svg, x, y) {
    const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 200, y: 150 };
  }
  const NS = 'http://www.w3.org/2000/svg';

  function rafaga(svg, p, tipo = 'estrella', n = 9) {
    const cols = tipo === 'corazon' ? ['#b5533c', '#d49a8c', '#c8704a'] : ['#e6d3a3', '#fff5dc', '#c8704a', '#9cc3d5', '#d49a8c'];
    for (let k = 0; k < n; k++) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('d', tipo === 'corazon' ? ILU.COR : ILU.EST);
      el.setAttribute('fill', cols[k % cols.length]);
      if (tipo === 'corazon') { el.setAttribute('stroke', '#2e2a33'); el.setAttribute('stroke-width', '1.5'); }
      el.setAttribute('class', 'particula');
      const a = (k / n) * Math.PI * 2 + Math.random() * .5, d = 40 + Math.random() * 45;
      el.style.setProperty('--dx', Math.cos(a) * d + 'px');
      el.style.setProperty('--dy', Math.sin(a) * d - (tipo === 'corazon' ? 30 : 10) + 'px');
      el.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg');
      g.appendChild(el); svg.appendChild(g);
      setTimeout(() => g.remove(), 1100);
    }
  }

  function burbuja(svg, x, y, texto) {
    $$('.burbuja', svg).forEach(b => b.remove());
    const w = texto.length * 8 + 28;
    x = Math.max(w / 2 + 6, Math.min(400 - w / 2 - 6, x)); y = Math.max(40, y);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'burbuja'); g.setAttribute('transform', `translate(${x} ${y})`);
    g.innerHTML = `<g class="burbuja-in"><rect x="${-w / 2}" y="-34" width="${w}" height="32" rx="16" fill="#f3ebdc" stroke="#2e2a33" stroke-width="2"/><path d="M-6 -3 L0 7 L6 -3" fill="#f3ebdc" stroke="#2e2a33" stroke-width="2" stroke-linejoin="round"/><path d="M-5 -4 H5" stroke="#f3ebdc" stroke-width="3.5"/><text class="globo" x="0" y="-12.5">${texto}</text></g>`;
    svg.appendChild(g);
    setTimeout(() => g.remove(), 2050);
  }

  function reanimar(el, cls, ms = 950) {
    el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }

  function comerCaramelo(el, svg) {
    if (el.classList.contains('comido')) return;
    el.classList.add('comido');
    const r = el.getBoundingClientRect(), c = aSvg(svg, r.left + r.width / 2, r.top + r.height / 2);
    Sonido.pop(); rafaga(svg, c, 'estrella', 12);
    const g = C.globos && C.globos.caramelo && C.globos.caramelo.caramelo;
    burbuja(svg, c.x, c.y - 50, g || '¡Mmm!');
    setTimeout(() => { burbuja(svg, c.x + 70, c.y - 40, '¿Ya se terminó?'); Sonido.triste(); }, 1100);
    setTimeout(() => burbuja(svg, c.x - 60, c.y - 30, '¿Más? ¿Más?'), 2400);
    setTimeout(() => { el.classList.remove('comido'); reanimar(el.querySelector('.fx'), 'fx-saltito'); }, 4400);
  }

  function estrellaFugaz(svg) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', 'translate(330 44)');
    g.innerHTML = `<g class="fugaz"><path d="M0 0 L70 -30" stroke="#fff5dc" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="${ILU.EST}" fill="#e6d3a3"/></g>`;
    svg.appendChild(g); setTimeout(() => g.remove(), 1300);
    Sonido.chispas();
  }

  function efecto(el, e, svg) {
    const p = aSvg(svg, e.clientX, e.clientY);
    const fxg = el.querySelector('.fx') || el;
    (el.dataset.fx || 'saltito').split(' ').forEach(f => {
      switch (f) {
        case 'saltito': reanimar(fxg, 'fx-saltito'); Sonido.blip(); break;
        case 'saltote': reanimar(fxg, 'fx-saltote'); Sonido.boing(); break;
        case 'corazones': rafaga(svg, p, 'corazon', 7); Sonido.chispas(); break;
        case 'chispas': rafaga(svg, p, 'estrella', 10); Sonido.chispas(); break;
        case 'color':
          el.removeAttribute('filter'); el.classList.remove('apagado');
          reanimar(fxg, 'fx-saltito'); Sonido.blip(); rafaga(svg, p, 'estrella', 6);
          clearTimeout(el._t); el._t = setTimeout(() => { el.setAttribute('filter', 'url(#fGris)'); el.classList.add('apagado'); }, 2600);
          break;
        case 'caramelo': comerCaramelo(el, svg); break;
        case 'fugaz': estrellaFugaz(svg); break;
        case 'repetir':
          $$('.a-baja, .a-apaga, .a-apaga-img, .a-asomar, .a-luz-sube', svg).forEach(x => { x.style.animation = 'none'; void x.getBoundingClientRect(); x.style.animation = ''; });
          Sonido.blip(); break;
        case 'confeti': confeti(e.clientX, e.clientY, 50); Sonido.fanfarria(); reanimar(fxg, 'fx-saltito'); break;
      }
    });
    if (el.dataset.say) {
      const r = el.getBoundingClientRect(), top = aSvg(svg, r.left + r.width / 2, r.top);
      burbuja(svg, top.x, top.y - 4, el.dataset.say);
    }
  }

  function confeti(x, y, n = 40) {
    const capa = $('#confeti'), cols = ['#c8704a', '#d9a441', '#8fb3a0', '#9cc3d5', '#d49a8c', '#f3ebdc'];
    for (let k = 0; k < n; k++) {
      const d = document.createElement('i');
      d.className = 'papelito';
      d.style.left = x + 'px'; d.style.top = y + 'px';
      d.style.background = cols[k % cols.length];
      const a = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 260;
      d.style.setProperty('--dx', Math.cos(a) * dist + 'px');
      d.style.setProperty('--dy', Math.sin(a) * dist * .6 + 160 + Math.random() * 200 + 'px');
      d.style.setProperty('--r', (Math.random() * 1080 - 540) + 'deg');
      d.style.animationDuration = 1.4 + Math.random() * .9 + 's';
      capa.appendChild(d); setTimeout(() => d.remove(), 2500);
    }
  }

  /* ============ Página final ============ */
  let sorteando = false;
  function sortear(btn) {
    if (sorteando) return;
    sorteando = true;
    const ru = $('#ruleta'), ic = $('.r-icono', ru), tx = $('.r-texto', ru);
    ru.classList.remove('listo'); ru.classList.add('girando');
    let k = Math.floor(Math.random() * C.juegos.length), paso = 60, n = 0;
    const total = 14 + Math.floor(Math.random() * 8);
    const tick = () => {
      const j = C.juegos[k++ % C.juegos.length];
      ic.textContent = j[0]; tx.textContent = j[1];
      Sonido.nota(Sonido.ESCALA[n % 5], 0, .08, 'square', .035);
      if (++n < total) { paso *= 1.12; setTimeout(tick, paso); }
      else {
        ru.classList.remove('girando'); ru.classList.add('listo');
        const r = ru.getBoundingClientRect();
        confeti(r.left + r.width / 2, r.top + r.height / 2, 36); Sonido.fanfarria();
        btn.textContent = 'Otro juego';
        sorteando = false;
      }
    };
    tick();
  }

  function prometer(btn) {
    const hecha = btn.classList.toggle('hecha');
    guardar('cuento-promesa', hecha ? '1' : '0');
    if (hecha) { const r = btn.getBoundingClientRect(); confeti(r.left + r.width / 2, r.top, 50); Sonido.fanfarria(); }
    else Sonido.blip();
  }

  /* ============ Eventos ============ */
  let toque = null, suprimirClick = false;
  libro.addEventListener('pointerdown', (e) => { if (e.isPrimary) toque = { x: e.clientX, y: e.clientY }; });
  libro.addEventListener('pointerup', (e) => {
    if (!toque) return;
    const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
    toque = null;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) < 45) return;
    suprimirClick = true; setTimeout(() => suprimirClick = false, 80);
    Sonido.init();
    const d = ax > ay ? dx : dy;          // en el celu también se puede deslizar hacia arriba
    d < 0 ? siguiente() : anterior();
  });
  libro.addEventListener('pointercancel', () => { toque = null; });

  libro.addEventListener('click', (e) => {
    if (suprimirClick) return;
    Sonido.init();
    const cara = e.target.closest('.cara');
    if (!cara || !cara.classList.contains('viva')) return;
    const acc = e.target.closest('[data-accion]');
    if (acc) {
      switch (acc.dataset.accion) {
        case 'abrir': case 'sig': siguiente(); if (Sonido.on) Sonido.musica(); break;
        case 'sortear': sortear(acc); break;
        case 'prometer': prometer(acc); break;
        case 'releer': irA(0); break;
        case 'grandes': abrirModal(); break;
      }
      return;
    }
    const svg = e.target.closest('.ilu svg');
    if (svg) {
      cara.classList.add('tocado');
      window.MUNDO.limpiarGuia();
      const t = e.target.closest('.tocable');
      if (t) efecto(t, e, svg);
      else { rafaga(svg, aSvg(svg, e.clientX, e.clientY), 'estrella', svg.closest('[data-escena="chispitas"]') ? 12 : 6); Sonido.chispas(); }
      return;
    }
    // tocar la página de texto también da vuelta la hoja
    if (cara.classList.contains('frente') && e.target.closest('.pag-txt')) siguiente();
  });

  btnSig.addEventListener('click', () => { Sonido.init(); if (Sonido.on) Sonido.musica(); siguiente(); });
  btnAnt.addEventListener('click', anterior);
  addEventListener('keydown', (e) => {
    if (!$('#grandes').hidden) { if (e.key === 'Escape') cerrarModal(); return; }
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && e.target === document.body)) { e.preventDefault(); Sonido.init(); if (Sonido.on) Sonido.musica(); siguiente(); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); anterior(); }
  });

  const btnVoz = $('#btnVoz'), btnSonido = $('#btnSonido'), btnPantalla = $('#btnPantalla');
  // el botón queda siempre: si no hay voz del sistema, igual puede haber narración grabada
  btnVoz.addEventListener('click', () => {
    Sonido.init();
    Voz.on = !Voz.on; btnVoz.setAttribute('aria-pressed', Voz.on);
    if (Voz.on) Voz.leer(caraTexto(actual), actual); else Voz.parar();
  });
  btnSonido.setAttribute('aria-pressed', Sonido.on);
  btnSonido.addEventListener('click', () => {
    Sonido.init();
    Sonido.on = !Sonido.on; btnSonido.setAttribute('aria-pressed', Sonido.on);
    guardar('cuento-sonido', Sonido.on ? '1' : '0');
    if (Sonido.on) { Sonido.blip(); if (actual > 0) Sonido.musica(); } else Sonido.pararMusica();
  });
  const fsOk = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
  if (!fsOk) btnPantalla.hidden = true;
  btnPantalla.addEventListener('click', () => {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
  });

  const modal = $('#grandes');
  function abrirModal() { modal.hidden = false; $('.modal-cerrar', modal).focus(); }
  function cerrarModal() { modal.hidden = true; }
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-accion="cerrar"]')) cerrarModal(); });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { Sonido.pararMusica(); Voz.parar(); }
    else if (Sonido.on && actual > 0 && Sonido.ctx) Sonido.musica();
  });

  /* ============ Inclinación suave del libro (solo con mouse) ============ */
  const inclina = $('#inclina');
  const finoPuntero = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let px = 0, py = 0, cx = 0, cy = 0;
  if (finoPuntero) {
    addEventListener('pointermove', (e) => { px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5; });
    (function mover(t) {
      cx += (px - cx) * .05; cy += (py - cy) * .05;
      const rx = Math.sin(t * .00045) * 1.2 - cy * 4, ry = Math.cos(t * .00035) * 1.5 + cx * 5;
      inclina.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      requestAnimationFrame(mover);
    })(0);
  }

  /* ============ Polvo de luz ============ */
  const cv = $('#ambiente'), ctx = cv.getContext('2d');
  let parts = [], dpr = 1;
  function tamCanvas() {
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const n = Math.round(innerWidth * innerHeight / 11000);
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight, z: Math.random(),
      r: .6 + Math.random() * 1.6, f: Math.random() * 6.28, v: .08 + Math.random() * .3,
      c: Math.random() < .5 ? '240,200,140' : '230,225,210'
    }));
  }
  function dibujar(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.y -= p.v * (0.4 + p.z); p.x += Math.sin(t * .0006 + p.f) * .18;
      if (p.y < -10) { p.y = innerHeight + 10; p.x = Math.random() * innerWidth; }
      const a = (.2 + .45 * (Math.sin(t * .002 + p.f) * .5 + .5)) * (.35 + p.z * .65);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (.6 + p.z * .8), 0, 6.283);
      ctx.fillStyle = `rgba(${p.c},${a.toFixed(3)})`; ctx.fill();
    }
    requestAnimationFrame(dibujar);
  }

  /* ============ Arranque ============ */
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { const antes = modo; medir(); tamCanvas(); window.MUNDO.medir(); if (antes !== modo) activar(actual, 0); }, 150);
  });

  const fuentes = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2500))]);
  const minimo = new Promise(r => setTimeout(r, 900));
  Promise.all([cargarSprites(), fuentes, minimo]).then(() => {
    construir();
    medir();
    tamCanvas(); requestAnimationFrame(dibujar);
    window.MUNDO.init(libro, () => Sonido.blip());
    $('#precarga').classList.add('fuera');
    setTimeout(() => $('#precarga') && $('#precarga').remove(), 1100);
    activar(0, 0);
  });

  window.cuento = { siguiente, anterior, irA, get actual() { return actual; } };
})();
