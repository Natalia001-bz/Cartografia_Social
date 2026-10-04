'use strict';
/* =========================================================
   El Encanto: la defensa del territorio
   Contenido del recorrido (personajes, niveles, normas)
   ========================================================= */

const IMG = 'assets/juego/img/';
const VIDEO = 'assets/juego/video/';
// Escenas que pueden tener versión animada: si existe assets/juego/video/<nombre>.mp4 se usa; si no, queda la imagen.
const ANIMABLES = ['fondo-portada', 'fondo-territorio', 'fondo-balanza', 'fondo-audiencia', 'fondo-reunion', 'fondo-final'];
const PISTA_BALANZA = 'assets/juego/audio/balanza.mp3';
// Escenas cuyo video trae sonido ambiente: suena unos segundos al llegar y luego cede el paso a la música.
const CON_AMBIENTE = ['fondo-portada', 'fondo-territorio', 'fondo-audiencia', 'fondo-final'];
const TRANSICION_BALANZA = 'assets/juego/video/transicion-balanza.mp4';

const PERSONAJES = {
  campesino: { nombre: 'Mateo', rol: 'Agricultor de la vereda', img: 'avatar-campesino.jpg',
    lema: 'Conoce cada parcela y cada quebrada.', don: 'Empieza con una pista extra.', regalo: { pista: 1 } },
  campesina: { nombre: 'Rosa', rol: 'Agricultora y fontanera del acueducto', img: 'avatar-campesina.jpg',
    lema: 'Cuida el agua de la que todos beben.', don: 'Empieza con un cántaro de agua fresca.', regalo: { agua: 1 } },
  mayor: { nombre: 'Don Abel', rol: 'Fundador de la vereda', img: 'avatar-adulto-mayor.jpg',
    lema: 'Guarda la memoria del territorio.', don: 'Empieza con una asesoría jurídica.', regalo: { asesoria: 1 } },
  lideresa: { nombre: 'Yolanda', rol: 'Lideresa de la junta comunal', img: 'avatar-lideresa.jpg',
    lema: 'Sabe convocar y hacerse oír.', don: 'Empieza con 40 semillas.', regalo: { semillas: 40 } },
  asesora: { nombre: 'Lucía', rol: 'Abogada del consultorio jurídico', img: 'actor-asesora.jpg' },
  empresa: { nombre: 'Representante de la empresa', rol: 'Titular de las licencias', img: 'actor-empresa.jpg' },
  autoridad: { nombre: 'Funcionaria de la autoridad ambiental', rol: 'Responsable del control', img: 'actor-autoridad.jpg' },
  defensoria: { nombre: 'Defensor del Pueblo regional', rol: 'Ministerio Público', img: 'actor-defensoria.jpg' }
};
const AVATARES = ['campesino', 'campesina', 'mayor', 'lideresa'];

/* ---------- Artículos de la Constitución (modal de normas) ---------- */
const NORMAS = {
  '1': ['Estado social de derecho', 'Colombia es un Estado social de derecho, democrático y participativo, fundado en la dignidad humana, la solidaridad y la prevalencia del interés general.'],
  '2': ['Fines esenciales del Estado', 'Las autoridades deben garantizar la efectividad de los derechos y facilitar la participación de todos en las decisiones que los afectan.'],
  '8': ['Riquezas naturales', 'El Estado y las personas están obligados a proteger las riquezas naturales de la Nación.'],
  '11': ['Derecho a la vida', 'El derecho a la vida es inviolable; se entiende como vida en condiciones dignas.'],
  '13': ['Igualdad material', 'El Estado protege especialmente a quienes se encuentran en situación de debilidad manifiesta.'],
  '23': ['Derecho de petición', 'Toda persona puede presentar peticiones respetuosas a las autoridades y obtener pronta resolución.'],
  '44': ['Derechos de los niños', 'La vida, la integridad física y la salud son derechos fundamentales de los niños, y prevalecen sobre los derechos de los demás.'],
  '46': ['Adultos mayores', 'El Estado, la sociedad y la familia concurren en la protección de las personas de la tercera edad.'],
  '49': ['Salud y saneamiento ambiental', 'La atención de la salud y el saneamiento ambiental son servicios públicos a cargo del Estado.'],
  '58': ['Función ecológica de la propiedad', 'La propiedad es una función social que implica obligaciones; le es inherente una función ecológica.'],
  '64': ['Campesinado', 'El campesinado es sujeto de derechos y de especial protección constitucional (Acto Legislativo 01 de 2023).'],
  '79': ['Ambiente sano y participación', 'Todas las personas tienen derecho a un ambiente sano. La ley garantiza la participación de la comunidad en las decisiones que puedan afectarlo.'],
  '80': ['Prevención del deterioro ambiental', 'El Estado debe prevenir y controlar los factores de deterioro ambiental, imponer sanciones y exigir la reparación de los daños.'],
  '86': ['Acción de tutela', 'Toda persona puede reclamar ante los jueces la protección inmediata de sus derechos fundamentales.'],
  '87': ['Acción de cumplimiento', 'Toda persona puede acudir al juez para hacer efectivo el cumplimiento de una ley o un acto administrativo.'],
  '88': ['Acciones populares', 'Protegen los derechos e intereses colectivos, como el ambiente y la salubridad públicos.'],
  '228': ['Prevalencia del derecho sustancial', 'En las actuaciones de la justicia prevalece el derecho sustancial sobre las formas.'],
  '333': ['Libertad económica con límites', 'La actividad económica es libre dentro de los límites del bien común; la ley la delimita cuando lo exigen el interés social y el ambiente.'],
  '366': ['Agua potable', 'La solución de las necesidades de salud, saneamiento ambiental y agua potable es objetivo fundamental de la actividad del Estado.']
};

/* ---------- Niveles ---------- */
const NIVELES = [
  { id: 1, nombre: 'El territorio habla', lugar: 'La vereda', insignia: ['🌿', 'Guardián del territorio'],
    resumen: 'Recorre la vereda y descubre qué derechos se afectan en cada lugar.' },
  { id: 2, nombre: 'El archivo de la Constitución', lugar: 'El archivo', insignia: ['📜', 'Voz del problema jurídico'],
    resumen: 'Arma, pieza por pieza, la pregunta que un juez tendría que responder.' },
  { id: 3, nombre: 'La balanza', lugar: 'El claro', insignia: ['⚖️', 'Pulso de la ponderación'],
    resumen: 'Lanza cada principio a la balanza y mira hacia dónde se inclina la Constitución.' },
  { id: 4, nombre: 'La audiencia', lugar: 'El juzgado', insignia: ['🏛️', 'Toga constitucional'],
    resumen: 'Escucha a cada interviniente y decide como juez qué medidas proceden.' },
  { id: 5, nombre: 'La ruta de la comunidad', lugar: 'La caseta comunal', insignia: ['🤝', 'Tejido comunitario'],
    resumen: 'Debate con tus vecinos los mecanismos y elige la estrategia.' }
];

/* ---------- Nivel 1: estaciones del territorio ---------- */
const ESTACIONES = [
  { id: 'bocatoma', nombre: 'La bocatoma', x: 62, y: 29, img: ['escena-bocatoma.jpg'],
    relato: [
      ['n', 'Aquí nace el agua de El Encanto. La bocatoma la levantaron los vecinos en convites y la cuida la junta del acueducto veredal.'],
      ['yo', 'De esta agua bebemos, cocinamos y regamos. Lo que le pase al río nos pasa a todos.']
    ],
    pregunta: { t: 'Para la Constitución (art. 366), llevar agua potable a la gente es…',
      o: [
        ['Un objetivo fundamental de la actividad del Estado', true, 'Así es. El Estado no puede desentenderse del agua de la vereda: es uno de sus fines sociales.'],
        ['Un negocio que solo corresponde a empresas privadas', false, 'Puede haber prestadores privados o comunitarios, pero la responsabilidad última es del Estado.'],
        ['Un asunto exclusivo de cada comunidad', false, 'La comunidad gestiona su acueducto, pero eso no libera al Estado de su deber.']
      ],
      pista: 'Busca la opción que hable de un deber del Estado, no de un favor ni de un negocio.' },
    normas: ['366', '49', '79'] },

  { id: 'rio', nombre: 'El río, aguas abajo', x: 79, y: 87, img: ['escena-rio-vertimiento.jpg'],
    relato: [
      ['n', 'Aguas abajo de la planta el río cambia de color. La comunidad atribuye el daño a vertimientos residuales de la empresa.'],
      ['yo', 'De aquí sacábamos el agua para la casa y para el riego. Ahora los niños se enferman del estómago.']
    ],
    pregunta: { t: 'Cuando se contamina el agua que una comunidad bebe, ¿qué derechos se comprometen?',
      o: [
        ['La salud, la vida digna y el agua, además del ambiente sano', true, 'Correcto. Un daño ambiental colectivo puede afectar a la vez derechos fundamentales de personas concretas.'],
        ['Solamente el paisaje', false, 'El caso va mucho más allá de lo estético: hay consumo humano y riesgo para la salud.'],
        ['Ninguno, mientras la empresa tenga licencia', false, 'La licencia autoriza una actividad; no autoriza a causar daño ni suspende los derechos.']
      ],
      pista: 'El agua contaminada no es solo un problema «del ambiente»: piensa en quién la bebe.' },
    normas: ['11', '49', '366', '79', '80'] },

  { id: 'quema', nombre: 'El cañaduzal', x: 74, y: 38, img: ['escena-quema.jpg'],
    relato: [
      ['n', 'Las quemas controladas y los agroquímicos hacen parte de la operación. Con el viento, la ceniza cae sobre los patios y la ropa tendida.'],
      ['yo', 'Dicen que la quema está permitida. Pero el humo no pide permiso para entrar a la casa.']
    ],
    pregunta: { t: 'Que una práctica esté permitida, ¿impide revisar sus efectos sobre la comunidad?',
      o: [
        ['Sí: lo permitido no se discute', false, 'En un Estado social de derecho ningún permiso está por encima de los derechos.'],
        ['No: la libertad económica tiene como límites el bien común y el ambiente', true, 'Exacto. Lo dicen los artículos 333 y 58: la empresa es libre, pero dentro de esos límites.'],
        ['Solo si la empresa está de acuerdo', false, 'El control no depende de la voluntad del controlado.']
      ],
      pista: 'El artículo 333 protege la empresa «dentro de los límites del bien común».' },
    normas: ['333', '58', '79', '49'] },

  { id: 'parcela', nombre: 'La parcela', x: 51, y: 61, img: ['escena-parcela.jpg'],
    relato: [
      ['n', 'En las parcelas campesinas se cultivan plátano, yuca, maíz y café. El lado que colinda con el monocultivo se está secando.'],
      ['yo', 'Esta tierra nos ha dado de comer por generaciones. Si el suelo se daña, se acaba nuestra forma de vivir.']
    ],
    pregunta: { t: 'Desde 2023, el artículo 64 de la Constitución reconoce de manera expresa…',
      o: [
        ['Al campesinado como sujeto de especial protección', true, 'Así es. La Constitución protege hoy el vínculo del campesinado con la tierra y la producción de alimentos.'],
        ['El derecho de la agroindustria a expandirse sin límites', false, 'Ninguna norma constitucional dice eso.'],
        ['La prohibición de la agricultura tradicional', false, 'Todo lo contrario: la protege.']
      ],
      pista: 'El Acto Legislativo 01 de 2023 dio un nuevo estatus a quienes trabajan la tierra.' },
    normas: ['64', '8', '58', '80'] },

  { id: 'escuela', nombre: 'La escuela y las casas', x: 37, y: 52, img: ['escena-escuela.jpg', 'escena-casa-campesina.jpg'],
    relato: [
      ['n', 'En la escuela veredal estudian niños de todos los grados. En las casas, las abuelas guardan el agua en canecas y la cuelan con un trapo.'],
      ['yo', 'Los más pequeños y los más viejos son los primeros en enfermarse.']
    ],
    pregunta: { t: 'Si los derechos de los niños chocan con otros intereses, la Constitución (art. 44) dice que…',
      o: [
        ['Se resuelve según quién tenga más recursos', false, 'La Constitución protege precisamente a quien tiene menos poder.'],
        ['Los derechos de los niños prevalecen sobre los de los demás', true, 'Correcto. Y los adultos mayores también tienen protección reforzada (arts. 13 y 46).'],
        ['Todos los intereses valen exactamente lo mismo', false, 'En este punto la Constitución sí establece una prevalencia expresa.']
      ],
      pista: 'El artículo 44 termina con una frase categórica sobre los derechos de los niños.' },
    normas: ['44', '46', '13', '49'] },

  { id: 'planta', nombre: 'La planta agroindustrial', x: 86, y: 76, img: ['escena-planta.jpg'],
    relato: [
      ['n', 'La empresa amplió sus operaciones. Nadie en la vereda fue informado ni consultado; se enteraron cuando llegaron las máquinas.'],
      ['yo', 'No estamos en contra del trabajo. Pero decidieron sobre nuestro territorio sin preguntarnos nada.']
    ],
    pregunta: { t: '¿Qué derecho se desconoció al ampliar la operación sin informar a la comunidad?',
      o: [
        ['El de participar en las decisiones que pueden afectar el ambiente (art. 79)', true, 'Correcto. Toda comunidad tiene ese derecho, y la Ley 99 de 1993 prevé para ello la audiencia pública ambiental.'],
        ['La consulta previa de los pueblos étnicos', false, 'Cerca, pero no: la consulta previa es de pueblos indígenas y afrodescendientes. Una comunidad campesina participa por la vía del artículo 79.'],
        ['Ninguno: la empresa decide en su propiedad', false, 'La propiedad tiene una función social y ecológica; lo que afecta a los vecinos no es un asunto privado.']
      ],
      pista: 'El Encanto es una comunidad campesina, no étnica. Busca el derecho que tienen todas las comunidades.' },
    normas: ['79', '2', '1', '23'] },

  { id: 'alcaldia', nombre: 'El camino al pueblo', x: 16, y: 50, img: ['escena-alcaldia.jpg', 'escena-visita-tecnica.jpg'],
    relato: [
      ['n', 'La comunidad llevó sus solicitudes a la alcaldía y a la autoridad ambiental. La respuesta fue siempre la misma: la empresa tiene licencias vigentes.'],
      ['n', 'Vinieron a hacer visitas técnicas, tomaron muestras y se fueron. No hubo ninguna medida.'],
      ['yo', 'Nos dicen que todo está en regla. ¿En regla para quién?']
    ],
    pregunta: { t: 'Al limitarse a verificar la licencia y hacer visitas, ¿qué deber incumplen las autoridades?',
      o: [
        ['Ninguno: con la visita ya cumplieron', false, 'Constatar no es proteger. La Constitución les pide resultados, no solo trámites.'],
        ['El de cobrar los impuestos de la empresa', false, 'Ese no es el problema del caso.'],
        ['El de prevenir y controlar el deterioro ambiental y garantizar la efectividad de los derechos', true, 'Exacto: artículos 80 y 2. Esta omisión es el corazón del caso.']
      ],
      pista: 'Los artículos 2 y 80 usan verbos de acción: garantizar, prevenir, controlar.' },
    normas: ['80', '2', '228', '1'] }
];

/* ---------- Nivel 2: el archivo ---------- */
const ARCHIVO = [
  { titulo: 'Primera pieza: ¿a quién se examina?', t: '¿De quién es la conducta que el juez tendría que examinar?',
    o: [
      ['De la empresa agroindustrial, por contaminar', false, 'La empresa origina el daño, pero el caso pregunta por la respuesta del Estado: el vacío está en quienes debían actuar y no lo hicieron.'],
      ['De la administración municipal y la autoridad ambiental competente', true, 'Son ellas las que tienen el deber constitucional de proteger (arts. 2, 79 y 80) y las que deciden no intervenir.'],
      ['De la comunidad, por no haber demandado antes', false, 'La comunidad es la titular de los derechos, no la obligada. Además, sí reclamó muchas veces.']
    ],
    pista: 'Piensa en quién tenía el deber de proteger y no lo cumplió.',
    pieza: '¿Vulneran la administración municipal y la autoridad ambiental competente' },
  { titulo: 'Segunda pieza: ¿qué se pone en riesgo?', t: '¿Qué principios y derechos constitucionales están comprometidos?',
    o: [
      ['Las normas técnicas sobre vertimientos', false, 'Ese sería un problema de legalidad ordinaria. Aquí el análisis es constitucional.'],
      ['Únicamente el derecho colectivo al ambiente sano', false, 'Es parte de la respuesta, pero el caso también compromete la salud, el agua y la participación.'],
      ['Los principios del Estado social de derecho y los derechos al ambiente sano, la salud, el agua y la participación', true, 'Articula la parte axiológica de la Constitución con los derechos concretos afectados.']
    ],
    pista: 'La respuesta completa une principios (arts. 1 y 2) con varios derechos, no con uno solo.',
    pieza: 'los principios del Estado social de derecho (arts. 1 y 2 C. P.) y los derechos al ambiente sano, a la salud, al agua y a la participación de la comunidad de la vereda El Encanto (arts. 49, 79, 80 y 366 C. P.),' },
  { titulo: 'Tercera pieza: ¿qué conducta se cuestiona?', t: '¿Qué hicieron, o dejaron de hacer, las autoridades?',
    o: [
      ['Otorgaron una licencia ambiental', false, 'El caso no discute el otorgamiento inicial, sino lo que pasó después.'],
      ['Se abstuvieron de adoptar medidas y no garantizaron la participación, con el argumento de que hay licencias vigentes', true, 'Recoge la omisión, la falta de participación y la razón que ofrece la administración.'],
      ['Actuaron de mala fe en favor de la empresa', false, 'El caso no trae hechos que permitan afirmarlo. Un problema jurídico se arma con hechos, no con suposiciones.']
    ],
    pista: 'El problema no es lo que hicieron, sino lo que dejaron de hacer y la excusa que dieron.',
    pieza: 'al abstenerse de adoptar medidas de prevención y mitigación frente a las afectaciones ambientales causadas por una empresa agroindustrial, y al no garantizar la participación de la comunidad en la ampliación de sus operaciones, con el argumento de que la empresa cuenta con licencias vigentes?' },
  { titulo: 'Cuarto estante: el principio', t: 'Hay indicios serios de daño, pero no certeza científica absoluta. ¿Qué principio obliga a actuar de todos modos?',
    o: [
      ['El principio de precaución', true, 'Ante el peligro de daño grave e irreversible, la falta de certeza no justifica postergar medidas eficaces (Ley 99 de 1993, art. 1.6; C-293 de 2002).'],
      ['El principio de legalidad del gasto', false, 'Ese principio regula el presupuesto público, no la protección ambiental.'],
      ['La presunción de legalidad de la licencia', false, 'Esa presunción es justamente el argumento de las autoridades para no actuar.']
    ],
    pista: 'Su nombre sugiere prudencia: más vale prevenir que lamentar.' },
  { titulo: 'Quinto estante: la participación', t: 'Antes de ampliar la operación, ¿qué mecanismo habría permitido oír a la comunidad?',
    o: [
      ['Un referendo nacional', false, 'El referendo sirve para aprobar o derogar normas, no para discutir un proyecto local.'],
      ['La audiencia pública ambiental', true, 'La prevé la Ley 99 de 1993 (art. 72): pueden pedirla cien personas, tres organizaciones sin ánimo de lucro o autoridades como el alcalde o el Defensor del Pueblo.'],
      ['La consulta previa', false, 'Es un derecho de los pueblos étnicos. El Encanto es una comunidad campesina.']
    ],
    pista: 'Es un mecanismo de la Ley 99 de 1993 pensado para decisiones ambientales.' },
  { titulo: 'Sexto estante: lo colectivo', t: 'El ambiente sano y la salubridad pública son derechos colectivos. ¿Qué acción los protege?',
    o: [
      ['La acción popular', true, 'Artículo 88 y Ley 472 de 1998. Cualquier persona puede interponerla y el juez puede decretar medidas cautelares.'],
      ['El habeas corpus', false, 'Protege la libertad personal frente a detenciones ilegales.'],
      ['La revocatoria del mandato', false, 'Es un mecanismo político para retirar a alcaldes y gobernadores.']
    ],
    pista: 'Su nombre lo dice: es del pueblo, de todos.' },
  { titulo: 'Séptimo estante: lo fundamental', t: 'El origen es un daño colectivo. ¿Puede aun así proceder la acción de tutela?',
    o: [
      ['No, nunca: lo colectivo va solo por acción popular', false, 'La regla tiene una excepción importante.'],
      ['Sí, siempre que alguien lo pida', false, 'No basta con pedirla: la tutela es subsidiaria y exige un requisito.'],
      ['Sí, cuando se prueba la afectación directa de un derecho fundamental de personas determinadas', true, 'Por ejemplo, la salud de niños que beben agua contaminada (SU-1116 de 2001).']
    ],
    pista: 'La clave está en demostrar que una persona concreta sufre en un derecho fundamental.' }
];

const SUBPROBLEMAS = [
  '¿Basta la presunción de legalidad de una licencia ambiental para que las autoridades se abstengan de actuar cuando existen indicios serios de daño a la salud y al ambiente?',
  '¿Se desconoce el derecho de la comunidad a participar en las decisiones ambientales cuando la ampliación de una actividad se autoriza sin informarla ni oírla?',
  '¿Cómo se articulan la acción popular y la acción de tutela cuando un mismo hecho afecta derechos colectivos y derechos fundamentales?'
];

const PROBLEMATIZACION = 'La administración municipal y las autoridades ambientales competentes son responsables frente a la vulneración de los principios rectores del Estado social de derecho y de los derechos colectivos al ambiente sano, a la salubridad pública y a la participación ciudadana: no garantizaron espacios efectivos de participación y se negaron a tomar medidas preventivas ante afectaciones ambientales y de salubridad que hoy padece la comunidad de El Encanto. Un Estado social de derecho no puede ser un actor pasivo frente a realidades que contradicen los principios y fines sobre los que se cimienta.';

/* ---------- Nivel 3: la balanza ---------- */
const PESAS = [
  { id: 'esd', icono: '🤲', nombre: 'Dignidad humana', norma: 'Arts. 1 y 2 C. P.',
    t: 'El Estado social de derecho existe para proteger a las personas, no solo para verificar trámites.' },
  { id: 'eco', icono: '🍃', nombre: 'Función ecológica de la propiedad', norma: 'Art. 58 C. P.',
    t: 'Nadie puede usar lo suyo de un modo que dañe el agua o el suelo de sus vecinos.' },
  { id: 'pre', icono: '🌱', nombre: 'Precaución', norma: 'Art. 80 C. P. · Ley 99 de 1993',
    t: 'Ante el riesgo de daño grave, se actúa aunque no haya certeza científica absoluta.' },
  { id: 'agua', icono: '💧', nombre: 'Agua y salud', norma: 'Arts. 49 y 366 C. P. · T-740 de 2011',
    t: 'El agua para consumo humano es un derecho fundamental y un objetivo del Estado.' },
  { id: 'suj', icono: '🧒', nombre: 'Niños, mayores y campesinado', norma: 'Arts. 13, 44, 46 y 64 C. P.',
    t: 'Quienes son más vulnerables reciben una protección reforzada.' },
  { id: 'par', icono: '📣', nombre: 'Participación', norma: 'Art. 79 C. P.',
    t: 'La comunidad tiene derecho a ser oída en las decisiones sobre su ambiente.' }
];
const LECTURAS = [
  ['Pregunta que se hace', '¿La empresa tiene licencia vigente?', '¿Están protegidos en la realidad el agua, la salud y el ambiente?'],
  ['Papel de la autoridad', 'Verificar documentos y hacer visitas.', 'Prevenir y controlar el deterioro; adoptar medidas eficaces.'],
  ['Valor de la licencia', 'Cierra la discusión.', 'Autoriza una actividad, pero no ampara daños ni impide revisarla.'],
  ['Lugar de la comunidad', 'Destinataria pasiva de decisiones ajenas.', 'Titular de derechos y partícipe de las decisiones.'],
  ['Ante la incertidumbre', 'Sin prueba plena, no se actúa.', 'Ante el riesgo grave, se actúa: precaución.']
];

/* ---------- Nivel 4: la audiencia ---------- */
const VALORACIONES = ['Formalista: confunde el trámite con la protección', 'Legítima, pero limitada por la Constitución', 'Garantista: reclama la efectividad de los derechos'];
const VOCES = [
  { quien: 'empresa', valor: 1,
    alegato: 'Operamos con licencias vigentes y dentro de los parámetros de la norma. Generamos empleo en la región y ejercemos una actividad lícita, protegida por la libertad de empresa.',
    analisis: 'El argumento es atendible: la iniciativa privada tiene protección constitucional (art. 333). Su debilidad está en lo que omite. El mismo artículo fija como límites el bien común y el ambiente, y el artículo 58 hace de la función ecológica una parte del derecho de propiedad. La licencia autoriza una actividad; no autoriza a causar daño.',
    normas: 'Arts. 58, 333 y 95.8 C. P.' },
  { quien: 'comunidad', valor: 2,
    alegato: 'El agua que tomamos y con la que regamos está contaminada. Nuestros niños y nuestros mayores se están enfermando. Nadie nos informó de la ampliación; hemos escrito muchas veces y solo vienen a hacer visitas.',
    analisis: 'El reclamo reúne derechos colectivos (ambiente sano, salubridad pública), derechos fundamentales (salud, agua, vida digna) y el derecho a participar en las decisiones ambientales. Al organizarse, la comunidad ejerce la democracia participativa que la Constitución de 1991 puso en manos de la ciudadanía.',
    normas: 'Arts. 11, 44, 46, 49, 64, 79 y 366 C. P.' },
  { quien: 'autoridad', valor: 0,
    alegato: 'La empresa cuenta con licencias vigentes y sus actividades se desarrollan dentro de los parámetros normativos. Hemos realizado las visitas técnicas correspondientes.',
    analisis: 'Es la postura más problemática. Reduce la función pública a constatar que existe un permiso, cuando la Constitución ordena prevenir y controlar el deterioro ambiental (art. 80) y garantizar la efectividad de los derechos (art. 2). Una licencia no congela la realidad: si aparecen daños, la autoridad puede y debe imponer medidas preventivas.',
    normas: 'Arts. 2, 80 y 209 C. P. · Ley 99 de 1993 · Ley 1333 de 2009' },
  { quien: 'defensoria', valor: 2,
    alegato: 'Frente a un riesgo serio para la salud de niños y adultos mayores, la falta de certeza científica no justifica la espera. Solicitamos medidas inmediatas y espacios reales de participación.',
    analisis: 'El Ministerio Público recuerda el principio de precaución y puede acompañar a la comunidad, e incluso interponer en su nombre las acciones popular y de tutela.',
    normas: 'Arts. 118, 277 y 282 C. P. · Ley 472 de 1998, art. 12' }
];
const MEDIDAS = [
  ['Suspender de manera preventiva los vertimientos y las quemas mientras se verifica su impacto', true,
    'Procede. El juez de la acción popular puede decretar medidas cautelares para prevenir un daño inminente o hacer cesar el causado (Ley 472 de 1998, art. 25).'],
  ['Archivar el reclamo porque la licencia está vigente', false,
    'No procede. La vigencia del permiso no responde a la pregunta por el daño; decidir así haría prevalecer la forma sobre el derecho sustancial (arts. 2 y 228).'],
  ['Ordenar el suministro provisional de agua potable a la comunidad', true,
    'Procede. Protege de inmediato el agua para consumo humano y la salud, con prioridad para niños y adultos mayores (arts. 44, 46, 49 y 366).'],
  ['Anular la licencia ambiental dentro de la misma acción popular', false,
    'No por esta vía. El juez popular puede ordenar lo necesario para hacer cesar la amenaza, pero no anular el acto administrativo (CPACA, art. 144). La nulidad tiene su propio medio de control.'],
  ['Ordenar estudios técnicos independientes de agua, aire y suelos, con seguimiento de la comunidad', true,
    'Procede. Supera las visitas sin consecuencias y da base probatoria; el comité de verificación permite el seguimiento (Ley 472 de 1998, art. 34).'],
  ['Convocar una audiencia pública ambiental sobre la ampliación', true,
    'Procede. Repara el déficit de participación: la comunidad tiene derecho a ser informada y oída (art. 79; Ley 99 de 1993, art. 72).']
];

/* ---------- Nivel 5: la reunión ---------- */
const VIAS = {
  popular: { icono: '🌊', nombre: 'Acción popular', base: 'Art. 88 C. P. · Ley 472 de 1998',
    propuesta: 'Vecinos, lo primero es detener la contaminación del agua. El río es de todos: propongo que interpongamos una acción popular y pidamos que suspendan los vertimientos mientras se decide.',
    filas: [['Protege', 'Derechos e intereses colectivos: ambiente sano, salubridad pública, equilibrio ecológico.'],
      ['Quién', 'Cualquier persona u organización de la comunidad; también la Defensoría o la Personería. No exige abogado.'],
      ['Ante quién', 'Juez administrativo, porque se cuestiona también la omisión de autoridades públicas.'],
      ['Qué pedir', 'Medidas cautelares de suspensión de vertimientos y quemas, estudios técnicos, restauración y comité de verificación.']],
    alerta: 'Antes de demandar hay que pedir a la autoridad que adopte las medidas; si no responde en quince días o se niega, se acude al juez (CPACA, art. 144). Las solicitudes ya presentadas sirven para esto.' },
  tutela: { icono: '🧒', nombre: 'Acción de tutela', base: 'Art. 86 C. P. · Decreto 2591 de 1991',
    propuesta: 'Yo pienso en los niños de la escuela y en los abuelos. Ellos no pueden esperar un proceso largo: necesitan agua limpia ya. ¿No sirve para eso la tutela?',
    filas: [['Protege', 'Derechos fundamentales: salud, agua para consumo humano, vida digna, derechos de los niños.'],
      ['Quién', 'Las personas afectadas, por sí mismas o mediante agente oficioso, Defensoría o Personería. No exige abogado.'],
      ['Ante quién', 'Cualquier juez del lugar; decide en un máximo de diez días.'],
      ['Qué pedir', 'Suministro de agua potable, atención en salud y medidas inmediatas frente a la fuente de riesgo.']],
    alerta: 'Es subsidiaria: procede cuando se demuestra la afectación directa de un derecho fundamental de personas determinadas (SU-1116 de 2001). No reemplaza a la acción popular.' },
  peticion: { icono: '✉️', nombre: 'Petición y audiencia pública ambiental', base: 'Arts. 23 y 79 C. P. · Ley 1755 de 2015 · Ley 99 de 1993',
    propuesta: 'A mí me preocupa que seguimos sin saber qué les autorizaron. Pidamos copia de las licencias y de los informes, y exijamos una audiencia pública ambiental.',
    filas: [['Protege', 'El acceso a la información y la participación en las decisiones ambientales.'],
      ['Quién', 'Cualquier persona, sin demostrar interés jurídico. La audiencia la piden cien personas o tres organizaciones.'],
      ['Ante quién', 'Alcaldía y autoridad ambiental.'],
      ['Qué pedir', 'Copia de licencias e informes de visitas, intervención en el trámite y audiencia pública ambiental.']],
    alerta: 'No detiene por sí sola la contaminación, pero da pruebas, deja constancia de la omisión y cumple la reclamación previa que exige la acción popular.' },
  nulidad: { icono: '📑', nombre: 'Nulidad del acto que autorizó la ampliación', base: 'CPACA, art. 137 · Ley 99 de 1993, art. 73',
    propuesta: 'Hay otra posibilidad: si la ampliación se autorizó sin los espacios de participación que exige la ley, ese acto puede demandarse para que un juez lo anule.',
    filas: [['Protege', 'La legalidad del acto y, a través de ella, el derecho de participación ambiental.'],
      ['Quién', 'Cualquier persona, tratándose de actos que expiden o modifican licencias ambientales.'],
      ['Ante quién', 'Jurisdicción de lo contencioso administrativo.'],
      ['Qué pedir', 'La nulidad del acto y su suspensión provisional mientras se decide.']],
    alerta: 'Exige identificar el acto concreto y el vicio. Es una vía más lenta: complementa, no reemplaza, a la acción popular.' },
  cumplimiento: { icono: '📌', nombre: 'Acción de cumplimiento', base: 'Art. 87 C. P. · Ley 393 de 1997',
    propuesta: '¿Y si obligamos a la autoridad a cumplir la ley? Ellos tienen que hacer monitoreos y seguimiento a la licencia. He oído que existe una acción de cumplimiento.',
    filas: [['Protege', 'La eficacia de normas con fuerza de ley y de actos administrativos.'],
      ['Quién', 'Cualquier persona.'],
      ['Ante quién', 'Juez administrativo.'],
      ['Qué pedir', 'Que la autoridad cumpla un deber claro y expreso: monitoreos, seguimiento a la licencia, plan de manejo.']],
    alerta: 'Requiere constituir antes en renuencia a la autoridad y es improcedente cuando existe otro medio judicial eficaz para lo mismo. Por eso no se combina con la acción popular ni con la tutela.' }
};
const ORDEN_VIAS = ['popular', 'tutela', 'peticion', 'nulidad', 'cumplimiento'];

const RESULTADOS = {
  optimo: { nivel: 3, img: 'escena-minga.jpg', titulo: 'El río vuelve a correr limpio',
    t: 'Con la información obtenida por petición, la comunidad presenta la acción popular y el juez decreta la suspensión cautelar de vertimientos y quemas. En paralelo, la tutela logra agua potable para los niños y los adultos mayores. En la audiencia de pacto de cumplimiento se acuerdan estudios independientes y un comité de verificación con participación de la vereda.' },
  bueno: { nivel: 2, img: 'escena-monitoreo.jpg', titulo: 'La contaminación se detiene, pero falta camino',
    t: 'La estrategia logra frenar la fuente del daño o proteger a quienes están en mayor riesgo, pero deja un frente descubierto. La comunidad tendrá que completar la ruta para que la protección sea integral.' },
  parcial: { nivel: 1, img: 'escena-visita-tecnica.jpg', titulo: 'Un avance que no alcanza',
    t: 'La comunidad obtiene algo valioso, pero la contaminación continúa mientras tanto. La vía elegida es lenta o no ataca la causa del problema.' }
};

const RUTA = [
  ['Documentar y pedir', 'Derechos de petición para obtener licencias e informes y solicitar medidas de protección.'],
  ['Acción popular', 'Demanda ante el juez administrativo con solicitud de medidas cautelares.'],
  ['Tutela, si hay urgencia', 'Para el agua y la salud de niños y adultos mayores, en paralelo.'],
  ['Pacto de cumplimiento', 'Audiencia en la que las partes pueden acordar cómo restablecer los derechos.'],
  ['Sentencia y verificación', 'Órdenes de hacer o no hacer y un comité que vigila su cumplimiento.']
];
const MATRIZ = [
  ['Acción popular', 'Art. 88 C. P.; Ley 472 de 1998', 'Derechos colectivos', 'Vía principal: suspender vertimientos y quemas.', 'No anula la licencia.'],
  ['Acción de tutela', 'Art. 86 C. P.; Decreto 2591 de 1991', 'Derechos fundamentales', 'Agua y salud de niños y mayores, con rapidez.', 'Es subsidiaria.'],
  ['Nulidad', 'CPACA, art. 137; Ley 99, art. 73', 'Legalidad del acto', 'Cuestiona la ampliación sin participación.', 'Trámite lento.'],
  ['Cumplimiento', 'Art. 87 C. P.; Ley 393 de 1997', 'Eficacia de la ley', 'Exigir monitoreo y seguimiento.', 'Improcedente si hay otro medio.'],
  ['Petición y participación', 'Arts. 23 y 79 C. P.; Ley 99 de 1993', 'Información y participación', 'Pruebas y audiencia pública ambiental.', 'No hace cesar el daño.']
];

/* ---------- Tienda: el consultorio jurídico ---------- */
const TIENDA = {
  pista: { icono: '🔎', nombre: 'Pista', precio: 30, t: 'Lucía te orienta hacia la respuesta sin dártela.' },
  asesoria: { icono: '⚖️', nombre: 'Asesoría jurídica', precio: 60, t: 'Lucía descarta por ti una opción equivocada.' },
  agua: { icono: '🏺', nombre: 'Agua fresca', precio: 40, t: 'Recupera una gota de energía.' }
};

/* ---------- Cápsulas finales ---------- */
const CAPSULAS = [
  ['🏞️', 'El caso', 'Una comunidad campesina ve contaminarse su agua, su aire y sus suelos por una operación agroindustrial que se amplió sin consultarla, mientras las autoridades se escudan en que hay licencia.'],
  ['📜', 'Lo que dice la Constitución', 'Colombia es un Estado social de derecho: las autoridades responden por la protección efectiva de las personas (arts. 1 y 2), y la empresa es libre dentro de los límites del ambiente y el bien común (arts. 58 y 333).'],
  ['❓', 'El problema jurídico', 'No se discute si existe un permiso, sino si las autoridades pueden abstenerse de actuar y de garantizar la participación amparándose en él.'],
  ['⚖️', 'La ponderación', 'La licencia y la libertad de empresa pesan, pero el agua, la salud, la precaución, la participación y la protección de niños, mayores y campesinado pesan más en las circunstancias del caso.'],
  ['🤝', 'La ruta', 'Petición para documentar, acción popular con medidas cautelares para detener el daño y tutela para lo urgente. Los mecanismos se complementan; ninguno basta solo.'],
  ['🌱', 'El aprendizaje', 'Los derechos se hacen efectivos cuando la ciudadanía organizada los reclama con las herramientas que la Constitución de 1991 le entregó.']
];
