/* ============================================================
   DISEÑO · El texto del cuento, página por página.
   *palabras entre asteriscos* = palabra destacada (color cálido).
   escena = ilustración de js/ilustraciones.js
   pista   = qué puede tocar el chico en esa página.
   personajes = nombre → descripción corta.
   globos  = escena → { personaje: 'lo que dice al tocarlo' }.
   ============================================================ */
window.CUENTO = {
  titulo: 'El hospital de los juguetes olvidados',

  personajes: {
    Toto:  'Osito de peluche con una curita en la cabeza. Dulce, soñador y un poquito dramático.',
    Cric:  'Robot de hojalata a cuerda, su mejor amigo. Sabe secretos… pero siempre se queda sin cuerda en la mejor parte.',
    Juli:  'La persona que jugaba con Toto. No es mala: la pantalla la atrapó, como un imán.',
    Boti:  'Pelota saltarina. Solo sabe decir “¡Boing!”, pero lo dice con mucho sentimiento.',
    Chucu: 'Tren de madera. Paciente y tranquilo: “¡Chu-chu, ya va a venir!”.',
    Cuac:  'Patito de goma. Se ríe de todo.',
    ABC:   'Los bloques con letras. Siempre quieren armar la torre más alta.'
  },

  paginas: [
    { tipo: 'portada' },
    { escena: 'hospitalNoche', pista: 'Tocá el hospital',
      texto: 'Había una vez un hospital muy especial. No curaba huesos rotos ni resfríos: ¡curaba *juguetes tristes*! Shhh… ¿escuchás? Alguien suspira adentro.' },
    { escena: 'sala', pista: 'Tocá al osito',
      texto: 'Era Toto, un osito con *una curita* en la cabeza. —¿Qué te pasó? —preguntó Cric, el robot a cuerda—. Cric… cric… ¡clonc! Se trabó.' },
    { escena: 'reemplazo', pista: 'Tocá un juguete',
      texto: 'Toto le dio cuerda y suspiró: —Me cambiaron por una *pantalla*. A todos los juguetes del hospital les había pasado lo mismo.' },
    { escena: 'antes', pista: 'Tocá la pelota',
      texto: 'Antes, los chicos jugaban con ellos. ¡Boing, boing! Se *reían* e inventaban historias: Toto era pirata, astronauta… ¡y hasta dragón! ¿Y vos, a qué jugarías?' },
    { escena: 'atrapados', pista: 'Tocá el reloj',
      texto: 'Pero las pantallas eran como un imán: atrapaban *horas y horas*. Y, sin querer, los chicos se alejaban de sus amigos, sus juegos y hasta su familia.' },
    { escena: 'cofre', pista: 'Tocá el cofre',
      texto: '—Sin saberlo, se están perdiendo algo *muy importante* —susurró Cric—. Está guardado en ese cofre. ¿Qué habrá adentro? ¿Oro? ¿Caramelos?' },
    { escena: 'chispitas', pista: 'Tocá para hacer chispitas',
      texto: '¡Nada de oro! Eran *chispitas de alegría sana*. Nuestro cuerpo las fabrica cuando corremos, armamos torres o nos reímos con un amigo.' },
    { escena: 'tres', pista: 'Tocá cada círculo',
      texto: 'Las chispitas nos ayudan a sentirnos *felices de verdad*, a llevarnos bien con los demás y a crecer fuertes y sanos, por dentro y por fuera.' },
    { escena: 'caramelo', pista: 'Tocá el caramelo',
      texto: '—¿Y las pantallas? —preguntó Toto. —Dan una alegría rápida, pero *vacía* —dijo Cric—. Como un caramelo: endulza un segundo… y deja más ganas todavía.' },
    { escena: 'ventana', pista: 'Tocá la luna',
      texto: 'Por eso, cada noche, los juguetes esperaban *pacientemente* en la ventana. Toto soñaba con Juli, que antes jugaba con él. ¿Volvería algún día?' },
    { escena: 'soltar', pista: 'Tocá para repetir',
      texto: 'Sabían que, tarde o temprano, alguien los iba a mirar. Y una tarde, Juli vio la caja de juguetes, *soltó la pantalla* y dijo:' },
    { escena: 'jugamos', pista: '¡Tocá los juguetes!', grande: true,
      texto: '—¿*Jugamos*?' },
    { escena: 'cura', pista: 'Tocá al osito',
      texto: '¡Chu-chu! ¡Boing! ¡Cuac! ¡Plop! A Toto se le voló la curita. Y ahí, en ese instante, empezó la *verdadera cura*.' },
    { escena: 'cura', pista: 'Tocá el hospital',
      texto: '¿Y el teléfono? Puede ser un buen amigo si lo usás *con un grande* y para algo lindo… como hoy, que te trajo este cuento.' },
    { tipo: 'final' }
  ],

  /* Lo que dicen los personajes al tocarlos, por escena (máx. 4 palabras) */
  globos: {
    hospitalNoche: { hospital: '¡Pasen, pasen!' },
    sala:          { osito: '¿Me das un abrazo?', robot: 'Cric… cric… ¡clonc!' },
    reemplazo:     { osito: 'Acá abajo estoy…', bloques: '¡A, B, C… hola!', pelota: '¿Boing? ¿Nadie?' },
    antes:         { nene: '¡Ja ja ja!', nena: '¡Otra vez!', osito: '¡Soy un dragón!' },
    atrapados:     { telefono: 'Un video más…', reloj: '¡Pasaron tres horas!' },
    cofre:         { cofre: '¿Qué habrá adentro?' },
    chispitas:     { torre: '¡Más alta!', nene: '¡Wiii!', nena: '¡Te alcanzo!' },
    tres:          { felices: '¡Felices de verdad!', amigos: '¡Juntos es mejor!', sanos: '¡Fuertes y sanos!' },
    caramelo:      { caramelo: '¡Ñam! ¿Ya está?' },
    ventana:       { osito: '¿Vendrá hoy?', robot: 'Ya va a venir', tren: '¡Chu-chu, paciencia!' },
    soltar:        { osito: '¡Nos vio!', robot: '¡Bip! ¡Hola, Juli!' },
    jugamos:       { osito: '¡Sí, sí, sí!', robot: '¡Bip bip, hurra!', tren: '¡Chu-chu!' },
    cura:          { osito: '¡Chau, curita!', robot: '¡Cuerda llena!', hospital: '¡Juguetes curados!' }
  },

  /* Página final: juegos sin pantalla para sortear */
  juegos: [
    ['🧱', 'Armar la torre más alta del mundo'],
    ['⚽', 'Jugar a la pelota con alguien'],
    ['🙈', 'Jugar a las escondidas'],
    ['🎨', 'Dibujar a tu juguete favorito'],
    ['📖', 'Inventar un cuento en familia'],
    ['💃', 'Bailar tu canción preferida'],
    ['✈️', 'Hacer un avión de papel y ver cuál vuela más lejos'],
    ['🏰', 'Construir un fuerte con almohadas'],
    ['🎲', 'Jugar un juego de mesa'],
    ['🧸', 'Hacer un picnic con tus juguetes'],
    ['🏃', 'Salir a correr al patio o a la plaza'],
    ['🩹', 'Jugar al hospital de juguetes y curar a uno']
  ],

  /* Ventana "Para los grandes" */
  consejos: [
    'Después de leer, pregunten: <b>¿qué juguete te gustaría rescatar hoy?</b> Y vayan a buscarlo juntos.',
    'Acuerden momentos sin pantallas para toda la familia: las comidas, el rato antes de dormir, los viajes cortos.',
    'Jueguen juntos, aunque sea un ratito. El mejor juguete sigue siendo un adulto con tiempo.',
    'Den el ejemplo con su propio teléfono: los chicos copian lo que ven más que lo que escuchan.',
    'Avisen antes de apagar (“dos videos más y a jugar”) y tengan a mano un plan sin pantalla: cortar cuesta menos si hay algo lindo esperando.',
    'La pantalla puede ser útil —para aprender, crear o hablar con alguien— si es con propósito y acompañada. Como este cuento.'
  ]
};
