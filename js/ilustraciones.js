/* ============================================================
   DISEÑO · Ilustraciones del cuento (SVG hecho por código).
   Cada escena devuelve el interior de un <svg viewBox="0 0 400 300">.
   Las clases "a-*" son animaciones de reposo (ver css/estilos.css).
   Lo que tiene class="tocable" reacciona al tocarlo (ver js/app.js):
     data-fx  = efectos (saltito, corazones, chispas, color, saltote,
                caramelo, fugaz, repetir, confeti)
     data-say = globito de diálogo
   ============================================================ */
(() => {
  const T = '#2b2140';
  const S = `stroke="${T}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const S2 = `stroke="${T}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const EST = 'M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9Z';
  const COR = 'M0 8 C-14 -2 -10 -16 0 -9 C10 -16 14 -2 0 8Z';

  /* Globitos: salen de CUENTO.globos (texto del cuento) con un valor por defecto */
  const di = (escena, quien, defecto) => {
    const g = window.CUENTO && window.CUENTO.globos && window.CUENTO.globos[escena];
    return ((g && g[quien]) || defecto).replace(/"/g, '&quot;');
  };

  /* Juguetes renderizados en Blender (assets/juguetes). app.js llena window.SPRITES
     con el manifest antes de dibujar; si no hay render, se usa el dibujo vectorial. */
  window.SPRITES = window.SPRITES || {};
  const hay = (n) => !!window.SPRITES[n];
  /* alto = alto en unidades del SVG; apoyo: 'base' (se para en 0,0) o 'centro' */
  function sprite(n, alto, apoyo = 'base', extra = '') {
    const sp = window.SPRITES[n]; if (!sp) return '';
    const w = alto * sp.w / sp.h;
    const bx = apoyo === 'centro' ? .5 : sp.base[0], by = apoyo === 'centro' ? .5 : sp.base[1];
    return `<image href="${sp.src}" x="${(-bx * w).toFixed(1)}" y="${(-by * alto).toFixed(1)}" width="${w.toFixed(1)}" height="${alto}" ${extra}/>`;
  }
  /* Juguete genérico (solo si hay render) */
  const juguete = (n, x, y, alto, o = {}) => hay(n) ? figura(x, y, 1, o, sprite(n, alto, o.apoyo)) : '';

  /* Paleta apagada: los dibujos vectoriales se recolorean al salir */
  const PALETA = {
    '#ff7a3d': '#c8704a', '#ffb38a': '#e0b08f', '#ffd23f': '#d9a441', '#7fd8be': '#8fb3a0', '#8fd3ff': '#9cc3d5',
    '#ff8fb1': '#d49a8c', '#ff5d73': '#b5533c', '#9bd67a': '#a3b788', '#7cc45e': '#879f6f', '#bfe6ff': '#c9dde6',
    '#ffe9d6': '#efe3cc', '#fff3c4': '#f3ead0', '#1a2140': '#1d2333', '#2f3f75': '#34405a', '#22305a': '#262f44',
    '#3a4b85': '#3b4862', '#5a4b91': '#5b5470', '#4a3d7a': '#4a4460', '#141a33': '#181c29', '#2a1f3d': '#262233',
    '#2d3a66': '#2e3850', '#243056': '#262e44', '#34437a': '#353f58', '#ffd6e4': '#ecd6d0', '#fff1d6': '#f1e7d4',
    '#ffe3b8': '#ead8ba', '#cfe6f2': '#cfdcdc', '#e9d3b5': '#ddcdb2', '#b9cadb': '#b8c2c9', '#d4e2ee': '#d3dadf',
    '#9fb4c7': '#9ea9b1', '#c98a52': '#9a6a45', '#f1c894': '#d8b98f', '#b06a3b': '#8e5b3a', '#c97c47': '#a26b45',
    '#3f8f6b': '#5f7f6a', '#5fb88e': '#86a58c', '#ffe6c2': '#efdcc0'
  };
  const RE_PAL = new RegExp(Object.keys(PALETA).join('|'), 'gi');
  const recolor = (str) => str.replace(RE_PAL, (m) => PALETA[m.toLowerCase()]);

  /* azar con semilla: cada escena se dibuja siempre igual */
  const azar = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

  const en = (x, y, inner, s = 1) => `<g transform="translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`;

  /* Envoltura de un personaje: posición + tocable + capa de efectos + animación de reposo */
  function figura(x, y, s, o, inner) {
    const cl = [o.tap ? 'tocable' : '', o.gris ? 'apagado' : ''].join(' ').trim();
    const filtro = o.gris ? ' filter="url(#fGris)"' : '';
    return `<g transform="translate(${x} ${y}) scale(${s})" class="${cl}"${filtro} ${o.tap || ''}>` +
      `<g class="fx"><g class="${o.cls || ''}" style="${o.st || ''}">${inner}</g></g></g>`;
  }

  const estrellas = (n, semilla, x0 = 0, x1 = 400, y0 = 0, y1 = 180) => {
    const r = azar(semilla); let out = '';
    for (let i = 0; i < n; i++) {
      out += `<circle class="a-titilar" cx="${(x0 + r() * (x1 - x0)).toFixed(1)}" cy="${(y0 + r() * (y1 - y0)).toFixed(1)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="${r() > .85 ? '#ffd6b8' : '#fff'}" style="animation-delay:-${(r() * 4).toFixed(2)}s;animation-duration:${(2 + r() * 3).toFixed(1)}s"/>`;
    }
    return out;
  };

  const nube = (x, y, s, cls = 'a-deriva', d = 0) =>
    en(x, y, `<path class="${cls}" style="animation-delay:-${d}s" d="M-40 10 Q-46 -8 -24 -8 Q-20 -26 0 -22 Q14 -34 28 -18 Q48 -18 42 10 Z" fill="#fff" opacity=".92"/>`, s);

  const chispa = (x, y, c, d, s = 1) => en(x, y, `<path class="a-subir" style="animation-delay:${d}s" d="${EST}" fill="${c}"/>`, s);
  const corazon = (x, y, s, c = '#ff5d73', cls = '', d = 0) => en(x, y, `<path class="${cls}" style="animation-delay:${d}s" d="${COR}" fill="${c}" ${S2}/>`, s);

  /* ---------- Personajes ---------- */

  function osito(x, y, s = 1, o = {}) {
    const n = o.triste ? 'osito-triste' : 'osito-feliz';
    if (hay(n)) {
      const venda = o.vendaCls ? `<g class="${o.vendaCls}"><g transform="rotate(-28 -12 -112)"><rect x="-30" y="-118" width="36" height="11" rx="4" fill="#f3ead0" ${S2}/></g></g>` : '';
      return figura(x, y, s, o, sprite(n, 152) + venda);
    }
    const boca = o.triste
      ? `<path d="M-6 -73 Q0 -79 6 -73" fill="none" ${S}/>`
      : `<path d="M-7 -77 Q0 -69 7 -77" fill="none" ${S}/>`;
    const cachetes = o.triste ? '' : `<circle cx="-15" cy="-80" r="4" fill="#ff8fb1" opacity=".75"/><circle cx="15" cy="-80" r="4" fill="#ff8fb1" opacity=".75"/>`;
    const lagrima = o.triste ? `<path class="a-lagrima" d="M11 -89 q3.5 5 0 8 q-3.5 -3 0 -8z" fill="#8fd3ff"/>` : '';
    const venda = o.venda ? `<g class="${o.vendaCls || ''}"><g transform="rotate(-28 -12 -106)"><rect x="-30" y="-112" width="36" height="11" rx="4" fill="#fff" ${S2}/><path d="M-12 -110 v7 M-15.5 -106.5 h7" stroke="#ff7a3d" stroke-width="2"/></g></g>` : '';
    return figura(x, y, s, o, `
      <ellipse cx="-18" cy="-9" rx="14" ry="10" fill="#c98a52" ${S}/>
      <ellipse cx="18" cy="-9" rx="14" ry="10" fill="#c98a52" ${S}/>
      <g><ellipse cx="-31" cy="-44" rx="10" ry="18" transform="rotate(25 -31 -44)" fill="#c98a52" ${S}/></g>
      <g class="${o.saluda ? 'a-saludar' : ''}"><ellipse cx="31" cy="-44" rx="10" ry="18" transform="rotate(-25 31 -44)" fill="#c98a52" ${S}/></g>
      <ellipse cx="0" cy="-38" rx="29" ry="32" fill="#c98a52" ${S}/>
      <ellipse cx="0" cy="-34" rx="17" ry="19" fill="#f1c894"/>
      <circle cx="-19" cy="-107" r="10" fill="#c98a52" ${S}/><circle cx="-19" cy="-107" r="5" fill="#f1c894"/>
      <circle cx="19" cy="-107" r="10" fill="#c98a52" ${S}/><circle cx="19" cy="-107" r="5" fill="#f1c894"/>
      <circle cx="0" cy="-88" r="26" fill="#c98a52" ${S}/>
      <ellipse cx="0" cy="-79" rx="12" ry="9" fill="#f1c894"/>
      <ellipse cx="0" cy="-83" rx="4.5" ry="3.2" fill="${T}"/>
      <g class="a-parpadeo"><circle cx="-10" cy="-93" r="3.3" fill="${T}"/><circle cx="10" cy="-93" r="3.3" fill="${T}"/></g>
      ${boca}${cachetes}${lagrima}${venda}`);
  }

  function robot(x, y, s = 1, o = {}) {
    const n = o.triste ? 'robot-triste' : 'robot-feliz';
    if (hay(n)) return figura(x, y, s, o, sprite(n, 150));
    const boca = o.triste
      ? `<path d="M-8 -74 Q0 -80 8 -74" fill="none" ${S}/>`
      : `<path d="M-9 -78 Q0 -70 9 -78" fill="none" ${S}/>`;
    return figura(x, y, s, o, `
      <rect x="-19" y="-20" width="12" height="20" rx="3" fill="#7f93a8" ${S2}/>
      <rect x="7" y="-20" width="12" height="20" rx="3" fill="#7f93a8" ${S2}/>
      <g><rect x="-40" y="-60" width="12" height="32" rx="6" fill="#9fb4c7" ${S}/></g>
      <g class="${o.saluda ? 'a-saludar' : ''}"><rect x="28" y="-60" width="12" height="32" rx="6" fill="#9fb4c7" ${S}/></g>
      <rect x="-28" y="-66" width="56" height="48" rx="10" fill="#b9cadb" ${S}/>
      <rect x="-16" y="-56" width="32" height="20" rx="5" fill="${T}"/>
      <circle class="a-titilar" cx="-8" cy="-46" r="3" fill="#ff7a3d"/>
      <circle class="a-titilar" style="animation-delay:-.7s" cx="0" cy="-46" r="3" fill="#7fd8be"/>
      <circle class="a-titilar" style="animation-delay:-1.4s" cx="8" cy="-46" r="3" fill="#ffd23f"/>
      <rect x="-6" y="-70" width="12" height="6" fill="#7f93a8"/>
      <rect x="-24" y="-104" width="48" height="36" rx="10" fill="#d4e2ee" ${S}/>
      <path d="M0 -104 V-116" ${S}/>
      <circle class="a-luz" cx="0" cy="-119" r="5" fill="#ff7a3d" ${S2}/>
      <g class="a-parpadeo">
        <circle cx="-10" cy="-88" r="6.5" fill="#fff" ${S2}/><circle cx="-10" cy="-88" r="2.7" fill="${T}"/>
        <circle cx="10" cy="-88" r="6.5" fill="#fff" ${S2}/><circle cx="10" cy="-88" r="2.7" fill="${T}"/>
      </g>
      ${boca}`);
  }

  function pelota(x, y, r, o = {}) {
    if (hay('pelota')) return figura(x, y, 1, o, sprite('pelota', r * 2.6, 'centro'));
    return figura(x, y, 1, o, `
      <circle r="${r}" fill="#ff5d73"/>
      <path d="M${-r} 0 A${r} ${r * .45} 0 0 0 ${r} 0" fill="none" stroke="#fff" stroke-width="${(r * .28).toFixed(1)}"/>
      <path d="M${-r * .5} ${-r * .86} Q0 ${-r * .3} ${r * .5} ${-r * .86}" fill="none" stroke="#ffd23f" stroke-width="${(r * .22).toFixed(1)}"/>
      <circle cx="${-r * .38}" cy="${-r * .42}" r="${r * .17}" fill="#fff" opacity=".65"/>
      <circle r="${r}" fill="none" ${S}/>`);
  }

  function bloques(x, y, s = 1, o = {}) {
    if (hay('bloques')) return figura(x, y, s, o, sprite('bloques', 84));
    return figura(x, y, s, o, `
      <rect x="-34" y="-30" width="30" height="30" rx="4" fill="#ffd23f" ${S}/><text class="lb" x="-19" y="-9">A</text>
      <rect x="2" y="-30" width="30" height="30" rx="4" fill="#7fd8be" ${S}/><text class="lb" x="17" y="-9">B</text>
      <rect x="-16" y="-62" width="30" height="30" rx="4" fill="#ff8fb1" ${S}/><text class="lb" x="-1" y="-41">C</text>`);
  }

  function torre(x, y, s = 1, o = {}) {
    const col = ['#ff5d73', '#ffd23f', '#7fd8be', '#8fd3ff', '#ff8fb1'];
    const letra = ['R', 'A', 'G', 'U', 'J'];
    const off = [0, 3, -3, 2, -1];
    let out = '';
    for (let i = 0; i < 5; i++) {
      const yy = -34 * (i + 1);
      out += `<rect x="${-17 + off[i]}" y="${yy}" width="34" height="34" rx="5" fill="${col[i]}" ${S}/><text class="lb lb-g" x="${off[i]}" y="${yy + 24}">${letra[i]}</text>`;
    }
    return figura(x, y, s, o, out);
  }

  function rueda(cx, cy, r) {
    return `<g class="a-giro"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${T}"/><circle cx="${cx}" cy="${cy}" r="${r * .45}" fill="#ffd23f"/><path d="M${cx} ${cy - r + 2} V${cy + r - 2} M${cx - r + 2} ${cy} H${cx + r - 2}" stroke="#fff" stroke-width="1.6"/></g>`;
  }

  function tren(x, y, s = 1, o = {}) {
    if (hay('tren')) return figura(x, y, s, o, sprite('tren', 92));
    return figura(x, y, s, o, `
      <circle class="a-humo" cx="-32" cy="-62" r="6" fill="#fff" opacity=".85"/>
      <circle class="a-humo" style="animation-delay:-1s" cx="-30" cy="-64" r="5" fill="#fff" opacity=".85"/>
      <rect x="-38" y="-52" width="12" height="16" fill="${T}"/><path d="M-41 -52 h18" ${S}/>
      <rect x="-46" y="-36" width="54" height="26" rx="5" fill="#ff7a3d" ${S}/>
      <rect x="4" y="-60" width="30" height="50" rx="5" fill="#ffd23f" ${S}/>
      <rect x="11" y="-52" width="16" height="14" rx="3" fill="#bfe6ff" ${S2}/>
      <rect x="0" y="-66" width="38" height="8" rx="3" fill="${T}"/>
      <path d="M-46 -18 L-55 -6 H-46Z" fill="${T}"/>
      ${rueda(-32, -8, 9)}${rueda(-10, -8, 9)}${rueda(20, -8, 11)}`);
  }

  function barrilete(x, y, s = 1, o = {}) {
    if (hay('barrilete')) return figura(x, y, s, { cls: 'a-sway', ...o }, sprite('barrilete', 170, 'centro'));
    return figura(x, y, s, { cls: 'a-sway', ...o }, `
      <path class="a-cola" d="M0 40 q10 12 0 24 q-10 12 0 24 q10 12 0 24" fill="none" ${S2}/>
      <path d="M-5 60 l10 -6 v12z M-5 84 l10 -6 v12z" fill="#ffd23f" ${S2}/>
      <path d="M0 -40 L28 0 L0 40 L-28 0Z" fill="#ff7a3d" ${S}/>
      <path d="M0 -40 L0 40 M-28 0 L28 0" ${S2}/>
      <path d="M0 -40 L28 0 L0 0Z" fill="#ffb38a"/><path d="M0 0 L-28 0 L0 40Z" fill="#ffb38a"/>
      <path d="M0 -40 L28 0 L0 40 L-28 0Z" fill="none" ${S}/>`);
  }

  const brazo = (d, piel) => `<path d="${d}" stroke="${T}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${piel}" stroke-width="7" fill="none" stroke-linecap="round"/>`;

  function nene(x, y, s = 1, o = {}) {
    const piel = o.piel || '#f5c9a0', pelo = o.pelo || '#3b2a20', remera = o.remera || '#7fd8be', pant = o.pantalon || '#3d4f8a';
    let brazos = '';
    if (o.brazos === 'arriba') {
      brazos = `<g class="a-saludo">${brazo('M-18 -80 Q-34 -98 -30 -120', piel)}</g><g class="a-saludo" style="animation-delay:-.5s">${brazo('M18 -80 Q34 -98 30 -120', piel)}</g>`;
    } else if (o.brazos === 'telefono') {
      brazos = brazo('M-18 -78 Q-28 -58 -7 -62', piel) + brazo('M18 -78 Q28 -58 7 -62', piel) +
        `<rect x="-9" y="-80" width="18" height="26" rx="3" fill="${T}"/><rect class="a-pantalla" x="-7" y="-77" width="14" height="19" rx="2" fill="url(#gPantalla)"/>`;
    } else {
      brazos = brazo('M-19 -78 Q-30 -60 -26 -46', piel) + brazo('M19 -78 Q30 -60 26 -46', piel);
    }
    let ojos, boca;
    switch (o.cara) {
      case 'risa':
        ojos = `<path d="M-12 -105 q4 -5 8 0 M4 -105 q4 -5 8 0" fill="none" ${S}/>`;
        boca = `<path d="M-8 -97 Q0 -86 8 -97 Z" fill="#b33a4a" ${S2}/>`; break;
      case 'wow':
        ojos = `<g class="a-parpadeo"><circle cx="-8" cy="-106" r="3.8" fill="${T}"/><circle cx="8" cy="-106" r="3.8" fill="${T}"/><circle cx="-7" cy="-107" r="1.2" fill="#fff"/><circle cx="9" cy="-107" r="1.2" fill="#fff"/></g>`;
        boca = `<ellipse cx="0" cy="-95" rx="3.5" ry="4.5" fill="#b33a4a" ${S2}/>`; break;
      case 'serio':
        ojos = `<circle cx="-8" cy="-106" r="4" fill="#8fe6ff" ${S2}/><circle cx="8" cy="-106" r="4" fill="#8fe6ff" ${S2}/>`;
        boca = `<path d="M-5 -95 H5" ${S}/>`; break;
      default:
        ojos = `<g class="a-parpadeo"><circle cx="-8" cy="-106" r="3" fill="${T}"/><circle cx="8" cy="-106" r="3" fill="${T}"/></g>`;
        boca = `<path d="M-6 -97 Q0 -91 6 -97" fill="none" ${S}/>`;
    }
    const mechas = o.peinado === 'largo'
      ? `<path d="M-23 -110 Q-32 -80 -17 -76 L-17 -104Z M23 -110 Q32 -80 17 -76 L17 -104Z" fill="${pelo}" ${S2}/>` : '';
    const cachetes = o.cara === 'serio' ? '' : `<circle cx="-14" cy="-99" r="3.5" fill="#ff8fb1" opacity=".6"/><circle cx="14" cy="-99" r="3.5" fill="#ff8fb1" opacity=".6"/>`;
    return figura(x, y, s, o, `
      <rect x="-15" y="-42" width="12" height="40" rx="5" fill="${pant}" ${S2}/>
      <rect x="3" y="-42" width="12" height="40" rx="5" fill="${pant}" ${S2}/>
      <ellipse cx="-10" cy="-2" rx="9" ry="5" fill="${T}"/><ellipse cx="10" cy="-2" rx="9" ry="5" fill="${T}"/>
      ${mechas}
      <path d="M-22 -40 Q-25 -84 0 -86 Q25 -84 22 -40 Z" fill="${remera}" ${S}/>
      ${brazos}
      <circle cx="0" cy="-106" r="22" fill="${piel}" ${S}/>
      <path d="M-23 -108 Q-25 -133 0 -132 Q25 -133 23 -108 Q14 -121 0 -119 Q-12 -123 -23 -108Z" fill="${pelo}" ${S2}/>
      ${ojos}${boca}${cachetes}`);
  }

  function espiral() {
    let d = 'M0 0';
    for (let t = 0.3; t < 6 * Math.PI; t += 0.3) d += ` L${(Math.cos(t) * t * 1.35).toFixed(1)} ${(Math.sin(t) * t * 1.35).toFixed(1)}`;
    return `<g class="a-giro-rapido"><circle r="26" fill="none"/><path d="${d}" fill="none" stroke="${T}" stroke-width="2.6" stroke-linecap="round" opacity=".75"/></g>`;
  }

  function telefono(x, y, s = 1, o = {}) {
    if (hay('celular') && !o.vector) return figura(x, y, s, o, `<g class="${o.pantCls ? 'a-apaga-img' : ''}">${sprite('celular', 104, 'centro')}</g>${o.espiral ? `<g opacity=".45">${en(0, -4, espiral())}</g>` : ''}`);
    return figura(x, y, s, o, `
      <rect x="-26" y="-46" width="52" height="92" rx="10" fill="${T}"/>
      <rect class="a-pantalla ${o.pantCls || ''}" x="-21" y="-38" width="42" height="74" rx="5" fill="url(#gPantalla)"/>
      ${o.espiral ? en(0, -1, espiral()) : ''}
      <rect x="-8" y="-43" width="16" height="3" rx="1.5" fill="#556"/>`);
  }

  function reloj(x, y, r, o = {}) {
    let marcas = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      marcas += `<path d="M${(Math.cos(a) * (r - 6)).toFixed(1)} ${(Math.sin(a) * (r - 6)).toFixed(1)} L${(Math.cos(a) * (r - 2)).toFixed(1)} ${(Math.sin(a) * (r - 2)).toFixed(1)}" stroke="${T}" stroke-width="2"/>`;
    }
    return figura(x, y, 1, { cls: 'a-temblar', ...o }, `
      <circle cx="${-r * .7}" cy="${-r * .85}" r="${r * .32}" fill="#ffd23f" ${S}/>
      <circle cx="${r * .7}" cy="${-r * .85}" r="${r * .32}" fill="#ffd23f" ${S}/>
      <circle r="${r + 5}" fill="#ff7a3d" ${S}/><circle r="${r}" fill="#fff" ${S2}/>
      ${marcas}
      <g class="a-giro-min"><circle r="${r}" fill="none"/><path d="M0 0 V${-r + 7}" stroke="${T}" stroke-width="3" stroke-linecap="round"/></g>
      <g class="a-giro-hora"><circle r="${r}" fill="none"/><path d="M0 0 H${r * .5}" stroke="${T}" stroke-width="4" stroke-linecap="round"/></g>
      <circle r="3.5" fill="${T}"/>`);
  }

  function hospital(x, y, s = 1, dia = false, o = {}) {
    const vidrio = dia ? '#bfe6ff' : '#ffd97a';
    const vent = (vx, vy, d) => `<rect class="${dia ? '' : 'a-ventana'}" style="animation-delay:-${d}s" x="${vx}" y="${vy}" width="36" height="26" rx="5" fill="${vidrio}" ${S2}/><path d="M${vx + 18} ${vy} V${vy + 26}" ${S2}/>`;
    return figura(x, y, s, o, `
      <path d="M0 -176 V-204" ${S}/>
      <path class="a-bandera" d="M0 -204 Q14 -210 26 -202 Q14 -196 0 -190Z" fill="#ff5d73" ${S2}/>
      <rect x="-90" y="-132" width="180" height="132" rx="6" fill="#ffe9d6" ${S}/>
      <path d="M-102 -130 L0 -178 L102 -130 Z" fill="#ff7a3d" ${S}/>
      ${en(0, -148, `<g class="a-latido"><path d="${COR}" transform="scale(1.35)" fill="#fff" ${S2}/><path d="M-4 -4 h8 M0 -8 v8" stroke="#ff5d73" stroke-width="3" stroke-linecap="round" transform="translate(0 2)"/></g>`)}
      <rect x="-74" y="-124" width="148" height="21" rx="6" fill="${T}"/>
      <text class="cartel" x="0" y="-109.5">HOSPITAL DE JUGUETES</text>
      ${vent(-78, -94, 0)}${vent(-18, -94, 1.3)}${vent(42, -94, 2.1)}
      ${vent(-78, -54, .7)}${vent(42, -54, 1.8)}
      <g class="a-asoma" style="animation-delay:-1s">
        <circle cx="-60" cy="-72" r="7" fill="#c98a52" ${S2}/><circle cx="-66" cy="-78" r="3.5" fill="#c98a52" ${S2}/><circle cx="-54" cy="-78" r="3.5" fill="#c98a52" ${S2}/>
        <circle cx="-62.5" cy="-73" r="1.3" fill="${T}"/><circle cx="-57.5" cy="-73" r="1.3" fill="${T}"/>
      </g>
      <rect x="-78" y="-68" width="36" height="12" fill="${vidrio}"/>
      <path d="M-78 -68 H-42" ${S2}/>
      <path d="M-20 0 V-26 Q-20 -44 0 -44 Q20 -44 20 -26 V0Z" fill="#7fd8be" ${S}/>
      <circle cx="10" cy="-20" r="2.5" fill="${T}"/>`);
  }

  const arbol = (x, y, s, d = 0) => en(x, y, `<g class="a-mecer" style="animation-delay:-${d}s"><path d="M0 0 V-26" stroke="#5a3d2b" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="-40" r="20" fill="#3f8f6b" ${S2}/><circle cx="-8" cy="-46" r="6" fill="#5fb88e"/></g>`, s);

  const burbujaFija = (x, y, texto, cls = '') => en(x, y, `<g class="${cls}"><rect x="${-texto.length * 5 - 14}" y="-18" width="${texto.length * 10 + 28}" height="34" rx="17" fill="#fff" ${S2}/><path d="M-6 15 L0 26 L6 15" fill="#fff" ${S2}/><path d="M-5 14 H5" stroke="#fff" stroke-width="3"/><text class="globo" x="0" y="5">${texto}</text></g>`);

  /* ---------- Escenas ---------- */

  const ESCENAS = {

    portada() {
      return `<rect width="400" height="300" fill="url(#gNoche)"/>
        ${estrellas(34, 7)}
        ${en(320, 64, `<g class="a-flotar"><circle r="38" fill="url(#gLuzCalida)" opacity=".55"/><circle r="22" fill="#fff3c4"/><circle cx="-7" cy="-5" r="4" fill="#f0dca0"/><circle cx="6" cy="7" r="3" fill="#f0dca0"/></g>`)}
        ${nube(80, 60, .75, 'a-deriva', 2)}
        <path d="M0 238 Q90 200 180 226 T400 212 V300 H0Z" fill="#2f3f75"/>
        ${hospital(200, 262, .82, false)}
        <path d="M0 262 Q200 248 400 262 V300 H0Z" fill="#22305a"/>
        ${osito(64, 294, .62, { cls: 'a-saltar', venda: true })}
        ${robot(336, 294, .58, { cls: 'a-saltar', st: 'animation-delay:-.4s', saluda: true })}
        ${pelota(116, 278, 16, { cls: 'a-rebote' })}
        ${chispa(160, 120, '#ffd23f', 0)}${chispa(250, 110, '#fff', 1.2)}${chispa(300, 150, '#ffd23f', 2)}`;
    },

    hospitalNoche() {
      return `<rect width="400" height="300" fill="url(#gNoche)"/>
        ${estrellas(40, 11)}
        ${en(330, 62, `<g class="a-flotar"><circle r="40" fill="url(#gLuzCalida)" opacity=".5"/><circle r="22" fill="#fff3c4"/><circle cx="-7" cy="-5" r="4" fill="#f0dca0"/><circle cx="6" cy="7" r="3" fill="#f0dca0"/></g>`)}
        ${nube(70, 70, .8, 'a-deriva', 0)}${nube(250, 40, .55, 'a-deriva-lenta', 3)}
        <path d="M0 230 Q80 190 170 220 T400 205 V300 H0Z" fill="#2f3f75"/>
        ${arbol(40, 262, 1.1, 0)}${arbol(360, 262, 1.2, 1.2)}
        ${hospital(200, 264, .95, false, { tap: 'data-fx="corazones saltito" data-q="hospital" data-say="' + di('hospitalNoche', 'hospital', '¡Bienvenidos!') + '"' })}
        <path d="M0 262 Q200 250 400 262 V300 H0Z" fill="#22305a"/>
        <path d="M200 264 Q190 285 170 300 H230 Q210 285 200 264Z" fill="#3a4b85"/>`;
    },

    sala() {
      return `<rect width="400" height="300" fill="url(#gCuarto)"/>
        <rect y="222" width="400" height="78" fill="#e9d3b5"/><path d="M0 222 H400" ${S2}/>
        <rect x="160" y="30" width="86" height="64" rx="8" fill="url(#gNoche)" ${S}/>
        ${estrellas(8, 3, 166, 240, 36, 88)}
        <circle cx="226" cy="50" r="9" fill="#fff3c4"/>
        <path d="M203 30 V94 M160 62 H246" stroke="#f1e3c8" stroke-width="4"/>
        <rect x="160" y="30" width="86" height="64" rx="8" fill="none" ${S}/>
        <rect x="22" y="128" width="78" height="54" rx="8" fill="${T}"/>
        <path class="a-ecg" d="M30 158 h14 l6 -16 l7 28 l6 -14 h30" fill="none" stroke="#7fd8be" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M61 182 V222 M45 222 H77" ${S}/>
        <path d="M322 54 V222 M306 222 H338" ${S}/>
        <path d="M322 58 H338" ${S2}/>
        <rect x="324" y="60" width="26" height="40" rx="7" fill="#e8f7ff" ${S2}/>
        <rect x="327" y="76" width="20" height="21" rx="5" fill="#8fd3ff"/>
        ${en(337, 108, `<circle class="a-gota" r="3.2" fill="#8fd3ff"/>`)}
        <path d="M337 100 Q334 160 232 170" fill="none" stroke="#8fd3ff" stroke-width="2.5" opacity=".9"/>
        <rect x="118" y="130" width="14" height="96" rx="5" fill="#9fb4c7" ${S}/>
        <rect x="286" y="170" width="12" height="56" rx="5" fill="#9fb4c7" ${S}/>
        <rect x="120" y="200" width="176" height="26" rx="8" fill="#fff" ${S}/>
        <ellipse cx="160" cy="194" rx="26" ry="11" fill="#fff" ${S2}/>
        ${osito(190, 216, .9, { triste: true, venda: true, cls: 'a-respira', tap: 'data-fx="saltito corazones" data-q="osito" data-say="' + di('sala', 'osito', 'Estoy triste…') + '"' })}
        <path d="M146 188 Q210 176 296 192 L296 226 L136 226 Z" fill="#8fd3ff" ${S}/>
        <path d="M170 196 L180 222 M205 190 L214 222 M240 190 L248 222 M272 193 L278 222" stroke="#bfe6ff" stroke-width="5"/>
        ${robot(338, 280, .72, { triste: true, cls: 'a-respira', st: 'animation-delay:-1.5s', tap: 'data-fx="saltito" data-q="robot" data-say="' + di('sala', 'robot', 'Nadie juega conmigo') + '"' })}
        ${juguete('trompo', 262, 270, 40, { cls: 'a-bamboleo', tap: 'data-fx="saltito"' })}`;
    },

    reemplazo() {
      return `<rect width="400" height="300" fill="#1a2140"/>
        <rect x="30" y="34" width="90" height="70" rx="8" fill="#0e1530" ${S}/>
        ${estrellas(7, 21, 36, 114, 40, 98)}
        <rect y="238" width="400" height="62" fill="#141a33"/>
        <circle class="a-brillo" cx="268" cy="150" r="130" fill="url(#gLuzFria)"/>
        <rect x="176" y="146" width="176" height="56" rx="16" fill="#5a4b91" ${S}/>
        ${nene(266, 222, .92, { brazos: 'telefono', cara: 'serio', remera: '#ffb38a' })}
        <rect x="166" y="192" width="196" height="44" rx="14" fill="#4a3d7a" ${S}/>
        <rect x="156" y="170" width="24" height="68" rx="10" fill="#5a4b91" ${S}/>
        <rect x="348" y="170" width="24" height="68" rx="10" fill="#5a4b91" ${S}/>
        <path d="M180 238 V252 M350 238 V252" ${S}/>
        ${osito(62, 272, .6, { triste: true, gris: true, tap: 'data-fx="color" data-q="osito" data-say="' + di('reemplazo', 'osito', '¿Jugamos?') + '"' })}
        ${bloques(122, 272, .7, { gris: true, tap: 'data-fx="color" data-q="bloques" data-say="' + di('reemplazo', 'bloques', '¡Acá estamos!') + '"' })}
        ${pelota(40, 283, 11, { gris: true, cls: 'a-rodar', tap: 'data-fx="color saltote" data-q="pelota" data-say="' + di('reemplazo', 'pelota', '¡Boing!') + '"' })}
        ${juguete('pato', 178, 284, 36, { gris: true, tap: 'data-fx="color" data-say="¿Cuac?"' })}
        <text class="zzz a-flotar" x="84" y="150">z</text><text class="zzz a-flotar" style="animation-delay:-1s" x="96" y="134">z</text>`;
    },

    antes() {
      return `<rect width="400" height="300" fill="url(#gDia)"/>
        ${en(62, 58, `<g class="a-rayos"><circle r="46" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 -32 L4 -44 L-4 -44Z" fill="#ffd23f" transform="rotate(${i * 30})"/>`).join('')}</g><circle r="24" fill="#ffd23f" ${S}/><path d="M-8 3 Q0 11 8 3" fill="none" ${S2}/><circle cx="-8" cy="-5" r="2.4" fill="${T}"/><circle cx="8" cy="-5" r="2.4" fill="${T}"/>`)}
        ${nube(190, 50, .7, 'a-deriva', 1)}${nube(300, 150, .45, 'a-deriva-lenta', 4)}
        <path d="M0 212 Q100 172 200 206 T400 192 V300 H0Z" fill="#9bd67a"/>
        <path d="M0 242 Q150 216 400 246 V300 H0Z" fill="#7cc45e"/>
        ${[30, 70, 350, 380, 150].map((fx, i) => `<g transform="translate(${fx} ${250 + (i % 2) * 18})"><circle r="4" fill="${['#ff8fb1', '#ffd23f', '#fff', '#ff8fb1', '#ffd23f'][i]}"/><circle r="1.6" fill="#ff7a3d"/></g>`).join('')}
        <path d="M252 142 Q300 120 318 106" fill="none" stroke="${T}" stroke-width="1.3" class="a-hilo"/>
        ${barrilete(322, 66, .78)}
        ${nene(110, 264, .85, { brazos: 'arriba', cara: 'risa', remera: '#ffd23f', piel: '#c98f65', pelo: '#1f1a17', cls: 'a-saltar', tap: 'data-fx="saltito" data-q="nene" data-say="' + di('antes', 'nene', '¡Ja ja ja!') + '"' })}
        ${nene(252, 264, .85, { brazos: 'arriba', cara: 'risa', remera: '#ff8fb1', pelo: '#6b3e1f', peinado: 'largo', cls: 'a-saltar', st: 'animation-delay:-.45s', tap: 'data-fx="saltito" data-q="nena" data-say="' + di('antes', 'nena', '¡Otra vez!') + '"' })}
        ${pelota(182, 246, 16, { cls: 'a-rebote', tap: 'data-q="pelota" data-fx="saltote chispas"' })}
        ${osito(342, 272, .5, { cls: 'a-bob', saluda: true, tap: 'data-fx="saltito corazones" data-q="osito" data-say="' + di('antes', 'osito', '¡Qué lindo!') + '"' })}`;
    },

    atrapados() {
      return `<rect width="400" height="300" fill="url(#gOscuro)"/>
        ${estrellas(14, 31, 0, 400, 0, 120)}
        <circle class="a-brillo" cx="200" cy="140" r="150" fill="url(#gLuzFria)"/>
        ${telefono(200, 132, 1.45, { cls: 'a-flotar', espiral: true, tap: 'data-fx="saltito" data-q="telefono" data-say="' + di('atrapados', 'telefono', 'Un video más…') + '"' })}
        ${reloj(68, 70, 30, { tap: 'data-fx="saltito" data-q="reloj" data-say="' + di('atrapados', 'reloj', '¡Pasaron 3 horas!') + '"' })}
        ${en(330, 60, `<text class="hs a-flotar">1 h</text>`)}${en(350, 100, `<text class="hs a-flotar" style="animation-delay:-1s">2 h</text>`)}${en(318, 136, `<text class="hs a-flotar" style="animation-delay:-2s">3 h</text>`)}
        <path d="M0 262 Q200 246 400 262 V300 H0Z" fill="#141a33"/>
        ${nene(92, 284, .5, { remera: '#ffd23f', brazos: 'arriba', cls: 'a-alejar-i' })}
        ${pelota(40, 274, 10, { cls: 'a-alejar-i', st: 'animation-delay:-.6s' })}
        ${nene(326, 286, .64, { remera: '#ff8fb1', peinado: 'largo', pelo: '#6b3e1f', cls: 'a-alejar-d' })}
        ${nene(200, 290, .52, { cara: 'serio', remera: '#8fd3ff' })}`;
    },

    cofre() {
      return `<rect width="400" height="300" fill="#2a1f3d"/>
        ${estrellas(18, 41, 0, 400, 0, 150)}
        <ellipse cx="200" cy="248" rx="120" ry="18" fill="#1b1428"/>
        <circle class="a-brillo" cx="200" cy="190" r="120" fill="url(#gLuzCalida)" opacity=".7"/>
        ${en(90, 90, `<text class="pregunta a-flotar">?</text>`)}${en(318, 76, `<text class="pregunta a-flotar" style="animation-delay:-1.3s">?</text>`)}${en(338, 190, `<text class="pregunta chica a-flotar" style="animation-delay:-.6s">?</text>`)}${en(60, 200, `<text class="pregunta chica a-flotar" style="animation-delay:-2s">?</text>`)}
        ${figura(200, 244, 1, { tap: 'data-fx="chispas saltito" data-q="cofre" data-say="' + di('cofre', 'cofre', '¿Qué habrá adentro?') + '"' }, `
          <rect x="-66" y="-66" width="132" height="66" rx="6" fill="#b06a3b" ${S}/>
          <rect x="-66" y="-66" width="132" height="12" fill="#8a4f2a"/>
          <path d="M-40 -66 V0 M40 -66 V0" stroke="#ffd23f" stroke-width="8"/>
          <rect x="-66" y="-66" width="132" height="66" rx="6" fill="none" ${S}/>
          <g class="a-tapa">
            <path d="M-2 -66 L-60 -66 L-60 -70 Q-60 -110 0 -112 Q60 -110 60 -70 L60 -66Z" fill="#c97c47" ${S}/>
            <path d="M-40 -66 V-106 M40 -66 V-106" stroke="#ffd23f" stroke-width="8"/>
            <path d="M-60 -66 L-60 -70 Q-60 -110 0 -112 Q60 -110 60 -70 L60 -66Z" fill="none" ${S}/>
            <rect x="-10" y="-76" width="20" height="22" rx="4" fill="#ffd23f" ${S2}/><circle cx="0" cy="-66" r="3" fill="${T}"/>
          </g>
          <rect class="a-brillo" x="-58" y="-70" width="116" height="5" rx="2" fill="#fff3a0"/>`)}
        ${chispa(170, 170, '#ffd23f', 0)}${chispa(200, 160, '#fff', .8)}${chispa(232, 172, '#ffd23f', 1.6)}${chispa(186, 176, '#ffb38a', 2.2)}${chispa(220, 166, '#fff', 2.8)}`;
    },

    chispitas() {
      const r = azar(77); let ch = '';
      const cols = ['#ffd23f', '#fff', '#ff7a3d', '#ff8fb1'];
      for (let i = 0; i < 18; i++) ch += chispa((40 + r() * 320).toFixed(0), (150 + r() * 90).toFixed(0), cols[i % 4], (r() * 3).toFixed(2), .7 + r() * .6);
      return `<rect width="400" height="300" fill="url(#gAtardecer)"/>
        ${nube(300, 50, .7, 'a-deriva', 0)}${nube(80, 36, .5, 'a-deriva-lenta', 2)}
        <path d="M0 236 Q200 214 400 240 V300 H0Z" fill="#9bd67a"/>
        ${torre(200, 262, .9, { cls: 'a-tambalear', tap: 'data-fx="saltito chispas" data-q="torre" data-say="' + di('chispitas', 'torre', '¡A jugar!') + '"' })}
        ${nene(84, 266, .8, { brazos: 'arriba', cara: 'risa', remera: '#8fd3ff', cls: 'a-correr', tap: 'data-fx="saltito chispas" data-q="nene" data-say="' + di('chispitas', 'nene', '¡Wiii!') + '"' })}
        ${nene(318, 266, .8, { brazos: 'arriba', cara: 'risa', remera: '#ff7a3d', peinado: 'largo', pelo: '#e0a23a', cls: 'a-saltar', tap: 'data-fx="saltito chispas" data-q="nena" data-say="' + di('chispitas', 'nena', '¡Ja ja!') + '"' })}
        ${ch}`;
    },

    tres() {
      const med = (x, fill, inner, etiqueta, d, say) => figura(x, 136, 1, { cls: 'a-latir', st: `animation-delay:${d}s`, tap: `data-q="${etiqueta === 'Felices' ? 'felices' : ''}" data-fx="saltito chispas" data-say="${say}"` },
        `<circle r="54" fill="${fill}" ${S}/>${inner}<text class="etiqueta" x="0" y="84">${etiqueta}</text>`);
      return `<rect width="400" height="300" fill="#fff1d6"/>
        <circle cx="40" cy="40" r="60" fill="#ffe3b8"/><circle cx="370" cy="270" r="80" fill="#ffe3b8"/>
        ${chispa(40, 250, '#ffd23f', 0)}${chispa(360, 60, '#ff8fb1', 1)}${chispa(200, 40, '#7fd8be', 2)}
        ${med(74, '#ffd23f', `<circle cx="-16" cy="-10" r="5" fill="${T}"/><circle cx="16" cy="-10" r="5" fill="${T}"/><path d="M-24 6 Q0 34 24 6" fill="#fff" ${S}/><circle cx="-28" cy="4" r="6" fill="#ff8fb1" opacity=".7"/><circle cx="28" cy="4" r="6" fill="#ff8fb1" opacity=".7"/>`, 'Felices', 0, di('tres', 'felices', '¡Qué alegría!'))}
        ${med(200, '#7fd8be', `${nene(-16, 40, .44, { remera: '#ffd23f', cara: 'risa' })}${nene(16, 40, .44, { remera: '#ff8fb1', peinado: 'largo', pelo: '#6b3e1f', cara: 'risa' })}<path d="M-6 13 H6" stroke="#f5c9a0" stroke-width="5" stroke-linecap="round"/>${corazon(0, -34, .9, '#ff5d73', 'a-latido')}`, 'Amigos', .6, di('tres', 'amigos', '¡Juntos!'))}
        ${med(326, '#ffb38a', `<g class="a-crecer"><path d="M0 34 Q-4 0 0 -26" fill="none" stroke="#3f8f6b" stroke-width="5" stroke-linecap="round"/><path d="M0 4 Q-24 -2 -26 -22 Q-6 -20 0 4Z" fill="#5fb88e" ${S2}/><path d="M0 -10 Q22 -16 24 -36 Q4 -34 0 -10Z" fill="#5fb88e" ${S2}/><circle cx="0" cy="-30" r="7" fill="#ffd23f" ${S2}/></g>`, 'Fuertes y sanos', 1.2, di('tres', 'sanos', '¡Crecemos!'))}`;
    },

    caramelo() {
      let dots = '';
      const r = azar(91);
      for (let i = 0; i < 22; i++) dots += `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 300).toFixed(0)}" r="${(3 + r() * 6).toFixed(1)}" fill="#fff" opacity=".45"/>`;
      return `<rect width="400" height="300" fill="#ffd6e4"/>${dots}
        ${figura(200, 146, 1.15, { cls: 'a-bamboleo', tap: 'data-q="caramelo" data-fx="caramelo"' }, `
          ${hay('caramelo') ? '' : `<path d="M-50 0 L-94 -32 L-86 0 L-94 32 Z" fill="#ff8fb1" ${S}/><path d="M50 0 L94 -32 L86 0 L94 32 Z" fill="#ff8fb1" ${S}/>`}
          <ellipse class="caramelo-vacio" rx="52" ry="38" fill="#fff" fill-opacity=".35" stroke="${T}" stroke-width="2.5" stroke-dasharray="7 7"/>
          <g class="caramelo-dulce">${hay('caramelo') ? sprite('caramelo', 120, 'centro', 'transform="scale(1.1)"') : ''}<g ${hay('caramelo') ? 'display="none"' : ''}>
            <ellipse rx="52" ry="38" fill="#ff5d73" ${S}/>
            <path d="M-34 -24 Q-10 0 -30 26 M-8 -37 Q16 0 -6 37 M18 -35 Q40 0 22 34" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/>
            <ellipse class="a-brillito" cx="-22" cy="-18" rx="10" ry="5" fill="#fff" opacity=".8" transform="rotate(-25 -22 -18)"/>
            <ellipse rx="52" ry="38" fill="none" ${S}/>
          </g></g>`)}
        ${chispa(110, 90, '#fff', 0)}${chispa(300, 200, '#fff', 1.5)}
        ${nene(62, 296, .62, { cara: 'wow', remera: '#8fd3ff' })}`;
    },

    ventana() {
      return `<rect width="400" height="300" fill="#2d3a66"/>
        <rect x="54" y="26" width="292" height="172" rx="12" fill="url(#gNoche)"/>
        ${estrellas(22, 55, 62, 338, 34, 190)}
        ${figura(282, 74, 1, { cls: 'a-flotar', tap: 'data-q="luna" data-fx="fugaz" data-say="¡Una estrella fugaz!"' }, `<circle r="34" fill="url(#gLuzCalida)" opacity=".5"/><circle r="20" fill="#fff3c4" ${S2}/><circle cx="-6" cy="-4" r="4" fill="#f0dca0"/><circle cx="6" cy="7" r="3" fill="#f0dca0"/>`)}
        <path d="M200 26 V198 M54 112 H346" stroke="#f1e3c8" stroke-width="6"/>
        <rect x="54" y="26" width="292" height="172" rx="12" fill="none" stroke="#f1e3c8" stroke-width="9"/>
        <rect x="54" y="26" width="292" height="172" rx="12" fill="none" ${S}/>
        <rect y="248" width="400" height="52" fill="#243056"/>
        <ellipse cx="200" cy="272" rx="150" ry="16" fill="#34437a"/>
        <rect x="36" y="196" width="328" height="16" rx="5" fill="#f1e3c8" ${S}/>
        ${osito(106, 198, .56, { venda: true, cls: 'a-respira', tap: 'data-fx="saltito" data-q="osito" data-say="' + di('ventana', 'osito', 'Esperamos…') + '"' })}
        ${robot(168, 198, .5, { cls: 'a-respira', st: 'animation-delay:-1s', tap: 'data-fx="saltito" data-q="robot" data-say="' + di('ventana', 'robot', 'Ya va a venir') + '"' })}
        ${tren(244, 198, .56, { tap: 'data-fx="saltito" data-q="tren" data-say="' + di('ventana', 'tren', '¡Chu chu!') + '"' })}
        ${pelota(312, 185, 12, { cls: 'a-bob', tap: 'data-fx="saltote"' })}
        ${juguete('pato', 350, 199, 34, { cls: 'a-respira', tap: 'data-fx="saltito" data-say="Cuac… zzz"' })}
        ${en(106, 118, `<g><circle cx="0" cy="0" r="16" fill="#fff" ${S2}/><circle cx="-10" cy="22" r="5" fill="#fff" ${S2}/><circle cx="-16" cy="32" r="3" fill="#fff" ${S2}/><circle class="a-punto" cx="-7" cy="0" r="2.6" fill="${T}"/><circle class="a-punto" style="animation-delay:.25s" cx="0" cy="0" r="2.6" fill="${T}"/><circle class="a-punto" style="animation-delay:.5s" cx="7" cy="0" r="2.6" fill="${T}"/></g>`)}`;
    },

    soltar() {
      return `<rect width="400" height="300" fill="#1a2140"/>
        <circle class="a-luz-sube" cx="90" cy="220" r="190" fill="url(#gLuzCalida)"/>
        ${nene(246, 330, 1.4, { cara: 'wow', remera: '#ff8fb1', pelo: '#3b2a20' })}
        <g class="a-baja">
          ${telefono(330, 176, .95, { pantCls: 'a-apaga' })}
          <circle cx="314" cy="210" r="13" fill="#f5c9a0" ${S}/><circle cx="345" cy="212" r="12" fill="#f5c9a0" ${S}/>
        </g>
        <rect x="18" y="214" width="124" height="90" rx="8" fill="#c98a52" ${S}/>
        <path d="M18 234 H142" stroke="#8a5a34" stroke-width="3"/>
        <g class="a-asomar">${osito(56, 250, .5, {})}${robot(108, 250, .44, { saluda: true })}</g>
        <rect x="18" y="226" width="124" height="80" rx="6" fill="#c98a52" ${S}/>
        <text class="caja" x="80" y="274">JUGUETES</text>
        ${chispa(60, 150, '#ffd23f', 2.4)}${chispa(120, 170, '#fff', 3)}
        ${figura(0, 0, 1, { tap: 'data-q="repetir" data-fx="repetir"' }, `<rect width="400" height="300" fill="transparent"/>`)}`;
    },

    jugamos() {
      const r = azar(123); let conf = '';
      const cols = ['#ff7a3d', '#ffd23f', '#7fd8be', '#8fd3ff', '#ff8fb1'];
      for (let i = 0; i < 26; i++) conf += `<rect class="a-caer" style="animation-delay:-${(r() * 4).toFixed(2)}s;animation-duration:${(3 + r() * 2).toFixed(1)}s" x="${(r() * 400).toFixed(0)}" y="-20" width="7" height="12" rx="2" fill="${cols[i % 5]}"/>`;
      return `<rect width="400" height="300" fill="url(#gDia)"/>
        ${en(200, 150, `<g class="a-rayos"><circle r="300" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 0 L-40 -320 L40 -320Z" fill="#fff" opacity=".28" transform="rotate(${i * 30})"/>`).join('')}</g>`)}
        ${conf}
        ${figura(200, 96, 1, { cls: 'a-latir', tap: 'data-fx="confeti"' }, `<rect x="-118" y="-48" width="236" height="92" rx="46" fill="#fff" stroke="${T}" stroke-width="4"/><path d="M-20 42 L-34 70 L6 44" fill="#fff" stroke="${T}" stroke-width="4" stroke-linejoin="round"/><path d="M-22 40 H4" stroke="#fff" stroke-width="6"/><text class="jugamos" x="0" y="15">¿Jugamos?</text>`)}
        <path d="M0 268 Q200 252 400 270 V300 H0Z" fill="#9bd67a"/>
        ${osito(62, 284, .66, { cls: 'a-saltar', saluda: true, tap: 'data-fx="saltito corazones" data-q="osito" data-say="' + di('jugamos', 'osito', '¡Sí!') + '"' })}
        ${robot(146, 288, .6, { cls: 'a-saltar', st: 'animation-delay:-.2s', saluda: true, tap: 'data-fx="saltito chispas" data-q="robot" data-say="' + di('jugamos', 'robot', '¡Bip bip!') + '"' })}
        ${pelota(224, 266, 17, { cls: 'a-rebote', tap: 'data-fx="saltote chispas"' })}
        ${tren(296, 288, .62, { cls: 'a-saltar', st: 'animation-delay:-.35s', tap: 'data-fx="saltito" data-q="tren" data-say="' + di('jugamos', 'tren', '¡Chu chu!') + '"' })}
        ${bloques(362, 288, .62, { cls: 'a-saltar', st: 'animation-delay:-.1s', tap: 'data-fx="saltito chispas" data-say="¡Una torre!"' })}
        ${juguete('cohete', 34, 196, 74, { cls: 'a-flotar', tap: 'data-fx="saltote chispas" data-say="¡Despegue!"' })}`;
    },

    cura() {
      const arcos = ['#ff5d73', '#ffd23f', '#7fd8be', '#8fd3ff'].map((c, i) =>
        `<path class="a-arcoiris" style="animation-delay:${.3 + i * .2}s" d="M${30 + i * 12} 250 A${170 - i * 12} ${170 - i * 12} 0 0 1 ${370 - i * 12} 250" fill="none" stroke="${c}" stroke-width="11" pathLength="100"/>`).join('');
      return `<rect width="400" height="300" fill="url(#gAmanecer)"/>
        ${en(330, 96, `<g class="a-salir"><g class="a-rayos"><circle r="50" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 -34 L5 -48 L-5 -48Z" fill="#ffd23f" transform="rotate(${i * 30})"/>`).join('')}</g><circle r="26" fill="#ffd23f" ${S}/></g>`)}
        ${arcos}
        ${nube(70, 60, .6, 'a-deriva', 1)}
        <path d="M0 232 Q90 206 180 226 T400 214 V300 H0Z" fill="#9bd67a"/>
        ${hospital(200, 262, .9, true, { tap: 'data-fx="corazones saltito" data-q="hospital" data-say="' + di('cura', 'hospital', '¡Juguetes curados!') + '"' })}
        <path d="M0 262 Q200 250 400 262 V300 H0Z" fill="#7cc45e"/>
        ${osito(70, 292, .62, { cls: 'a-saltar', venda: true, vendaCls: 'a-vuela', saluda: true, tap: 'data-fx="saltito corazones" data-q="osito" data-say="' + di('cura', 'osito', '¡Estoy feliz!') + '"' })}
        ${robot(332, 292, .6, { cls: 'a-saltar', st: 'animation-delay:-.3s', saluda: true, tap: 'data-fx="saltito corazones" data-q="robot" data-say="' + di('cura', 'robot', '¡Me curé!') + '"' })}
        ${corazon(120, 200, 1, '#ff5d73', 'a-subir', 0)}${corazon(290, 190, .8, '#ff8fb1', 'a-subir', 1.2)}${corazon(200, 120, .7, '#ff5d73', 'a-subir', 2.1)}`;
    },

    /* viewBox 0 0 400 170 */
    /* Página izquierda del final: los juguetes despiden al lector */
    final() {
      return `<rect width="400" height="300" fill="url(#gAmanecer)"/>
        ${en(318, 70, `<g class="a-rayos"><circle r="52" fill="none"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 -34 L5 -48 L-5 -48Z" fill="#ffd23f" transform="rotate(${i * 30})"/>`).join('')}</g><circle r="26" fill="#ffd23f" ${S}/>`)}
        ${nube(90, 60, .6, 'a-deriva', 0)}${nube(240, 110, .45, 'a-deriva-lenta', 2)}
        <path d="M0 26 Q100 54 200 30 T400 28" fill="none" ${S2}/>
        ${[24, 64, 104, 144, 184, 224, 264, 304, 344, 384].map((bx, i) => `<g transform="translate(${bx} ${35 + Math.sin(i) * 7})"><path class="a-mecer" style="animation-delay:-${i * .2}s" d="M-11 0 H11 L0 20Z" fill="${['#ff7a3d', '#ffd23f', '#7fd8be', '#8fd3ff', '#ff8fb1'][i % 5]}" ${S2}/></g>`).join('')}
        <path d="M0 238 Q200 214 400 240 V300 H0Z" fill="#9bd67a"/>
        <path d="M0 262 Q200 250 400 264 V300 H0Z" fill="#7cc45e"/>
        ${juguete('cohete', 40, 250, 80, { cls: 'a-flotar' })}
        ${osito(92, 272, .72, { cls: 'a-saltar', saluda: true, tap: 'data-fx="saltito corazones" data-q="osito" data-say="' + di('final', 'osito', '¡Te esperamos!') + '"' })}
        ${robot(178, 276, .64, { cls: 'a-saltar', st: 'animation-delay:-.3s', saluda: true, tap: 'data-fx="saltito chispas" data-q="robot" data-say="' + di('final', 'robot', '¡Bip! ¡Chau!') + '"' })}
        ${pelota(246, 254, 18, { cls: 'a-rebote', tap: 'data-fx="saltote"' })}
        ${tren(310, 278, .64, { cls: 'a-saltar', st: 'animation-delay:-.5s', tap: 'data-fx="saltito" data-q="tren" data-say="' + di('final', 'tren', '¡Chu-chu!') + '"' })}
        ${juguete('pato', 370, 282, 44, { cls: 'a-bob', tap: 'data-fx="saltito" data-say="¡Cuac!"' })}`;
    }
  };

  /* Garabatos para el dorso de cada hoja */
  const GARABATOS = [
    `<path d="${EST}" transform="scale(4)" fill="#ffd23f"/>`,
    `<path d="${COR}" transform="scale(3.4)" fill="#ff8fb1"/>`,
    `<circle r="26" fill="#ff5d73"/><path d="M-26 0 A26 12 0 0 0 26 0" fill="none" stroke="#fff" stroke-width="7"/>`,
    `<rect x="-24" y="-24" width="48" height="48" rx="7" fill="#7fd8be"/><text class="lb lb-g" x="0" y="11" style="font-size:30px">A</text>`,
    `<path d="M-40 10 Q-46 -8 -24 -8 Q-20 -26 0 -22 Q14 -34 28 -18 Q48 -18 42 10 Z" fill="#8fd3ff"/>`
  ];

  /* todas las escenas salen con la paleta apagada */
  window.ESCENAS = Object.fromEntries(Object.entries(ESCENAS).map(([k, f]) => [k, () => recolor(f())]));
  window.ILU = {
    EST, COR, S2, T,
    garabato: (i) => `<svg viewBox="-60 -60 120 120" aria-hidden="true"><g class="garabato-g">${GARABATOS[i % GARABATOS.length]}</g></svg>`,
    osito: (s) => `<svg viewBox="-50 -125 100 130" aria-hidden="true">${osito(0, 0, s || 1, { cls: 'a-bob' })}</svg>`,
    /* Un juguete suelto como <svg> (para el mundo de afuera del libro) */
    vector(n) {
      const V = {
        osito: ['-50 -125 100 130', () => osito(0, 0, 1, {})],
        robot: ['-45 -128 90 132', () => robot(0, 0, 1, {})],
        pelota: ['-24 -24 48 48', () => pelota(0, 0, 22, {})],
        tren: ['-58 -70 100 72', () => tren(0, 0, 1, {})],
        bloques: ['-38 -66 74 70', () => bloques(0, 0, 1, {})],
        barrilete: ['-32 -44 64 160', () => barrilete(0, 0, 1, { cls: '' })],
        celular: ['-28 -48 56 96', () => telefono(0, 0, 1, { vector: true })]
      }[n];
      if (!V) return null;
      const guardado = window.SPRITES; window.SPRITES = {};   // forzar dibujo vectorial
      const out = `<svg viewBox="${V[0]}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${recolor(V[1]())}</svg>`;
      window.SPRITES = guardado;
      return out;
    }
  };
})();
