# El hospital de los juguetes olvidados

Cuento web animado para chicos de 6 a 12 años. Es un libro que se abre y pasa de página, con ilustraciones que se mueven todo el tiempo, sonidos, lectura en voz alta y una página final para salir a jugar sin pantallas.

## Cómo está dividido

| Parte | Archivo | Qué tiene |
|---|---|---|
| **Diseño** | `index.html` | Estructura: mundo de atrás, libro, capa de adelante (flechas y personajes del borde), barra y trencito |
| | `js/cuento.js` | El texto (Toto el osito, Cric el robot…), las pistas, los globitos de cada personaje, los juegos y los consejos |
| | `js/ilustraciones.js` | Las escenas de cada página. Usa los juguetes 3D si están; si no, dibujos vectoriales |
| | `assets/juguetes/` | Juguetes modelados y renderizados en Blender (fondo transparente) + `manifest.json` |
| **Estilo** | `css/estilos.css` | Paleta apagada, tapa de tela con letras doradas, vuelta de página en 3D y todas las animaciones |
| **Funcionalidad** | `js/app.js` | El libro: doble página (horizontal en compu, vertical en celu), gestos, sonido, voz y final |
| | `js/mundo.js` | Lo de afuera del libro: juguetes flotando, juguetes que se asoman, personajes en el borde, cosas que salen volando y la flecha-guía |
| | `assets/voz/` | Narración grabada (opcional): `portada`, `01`…`14`, `final` en .mp3 o .wav. Cómo generarla con Gemini: `_notas/prompt-voz-gemini.md` |
| Extra | `qr.html` | Genera el QR para imprimir o descargar |

Las carpetas `_modelado/` (scripts de Blender) y `_notas/` (revisión por edad) son de trabajo: no hace falta subirlas.

Para cambiar el texto del cuento, editá solo `js/cuento.js`. Las palabras entre `*asteriscos*` salen destacadas.

## Publicarlo y hacer el QR

1. Entrá a **https://app.netlify.com/drop** (es gratis) y arrastrá esta carpeta entera. En segundos te da una dirección, por ejemplo `https://nombre-al-azar.netlify.app`.
   También sirven GitHub Pages, Vercel o cualquier hosting estático, porque no hace falta servidor.
2. Abrí `https://tu-direccion/qr.html`: el QR ya aparece con la dirección del cuento.
3. Tocá **Imprimir tarjeta** o **Descargar QR (PNG)** y ponelo donde quieras: en el aula, en la sala de espera o en un folleto.

**Con GitHub Pages:** en el repositorio, *Settings → Pages → Branch: `main`, carpeta `/ (root)` → Save*. La dirección queda `https://usuario.github.io/nombre-del-repo/` y el QR se genera en `…/qr.html`. Cada cambio que se sube se publica solo en uno o dos minutos.

Para probarlo en tu compu: `python -m http.server 5173` en esta carpeta y abrí `http://localhost:5173`.

## Pensado para 6 a 12 años

- **Letra grande y redonda** (17–32 px según la pantalla) y frases cortas en cada página.
- **Botón "Leer"**: la voz del celular lee cada página y va marcando la palabra, así los más chicos, que todavía no leen solos, pueden seguirlo.
- **Botones grandes** (54–58 px), se puede pasar de página deslizando el dedo, y cada página indica qué tocar ("Tocá el osito").
- **Siempre hay algo en movimiento**: parpadeos, rebotes, chispitas y un trencito que muestra cuánto falta.
- **Sin publicidad, sin enlaces a otros sitios, sin cuentas y sin datos personales.** Lo único que se guarda, en el propio celular, es si el sonido está prendido y si el chico hizo la promesa.
- **Dura unos 5 minutos** y termina invitando a apagar la pantalla, con un sorteo de juegos sin pantalla y un mensaje sobre el uso útil del teléfono.
