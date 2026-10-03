'use strict';

/* =========================================================
   Caso El Encanto · Derecho Constitucional Colombiano I (251005)
   Datos del análisis y lógica de los cinco recursos interactivos
   ========================================================= */

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

// Tras una selección, acerca el panel de resultado si quedó fuera de la pantalla.
function acercar(el) {
  const r = el.getBoundingClientRect();
  if (r.top < 70 || r.top > innerHeight * 0.6) {
    scrollTo({ top: r.top + scrollY - 76, behavior: 'smooth' });
  }
}

/* ---------- Matriz dogmática: artículos de la Constitución ---------- */
const grupos = [
  { id: 'principios', nombre: 'Principios y valores del Estado social de derecho' },
  { id: 'ecologica', nombre: 'Constitución ecológica y límites a la economía' },
  { id: 'fundamentales', nombre: 'Derechos fundamentales y sujetos de especial protección' },
  { id: 'colectivos', nombre: 'Derechos colectivos y participación' }
];

const articulos = [
  { n: '1', grupo: 'principios', nombre: 'Estado social de derecho y dignidad humana',
    dice: 'Colombia es un Estado social de derecho, democrático y participativo, fundado en el respeto de la dignidad humana, el trabajo, la solidaridad y la prevalencia del interés general.',
    caso: 'Es la cláusula que impide leer la licencia como punto final: la actuación de la administración se mide por la protección efectiva de las personas, no solo por la regularidad de un trámite.' },
  { n: '2', grupo: 'principios', nombre: 'Fines esenciales del Estado',
    dice: 'Las autoridades están instituidas para garantizar la efectividad de los principios, derechos y deberes, y para facilitar la participación de todos en las decisiones que los afectan.',
    caso: 'Las visitas técnicas sin medidas concretas no satisfacen el deber de protección; tampoco se facilitó la participación de la comunidad en la ampliación de la empresa.' },
  { n: '228', grupo: 'principios', nombre: 'Prevalencia del derecho sustancial',
    dice: 'En las actuaciones de la administración de justicia prevalecerá el derecho sustancial.',
    caso: 'Orienta al juez que conozca del caso: la existencia formal de la licencia no desplaza el examen material del daño al ambiente y a la salud.' },
  { n: '93', grupo: 'principios', nombre: 'Bloque de constitucionalidad',
    dice: 'Los tratados de derechos humanos ratificados por Colombia prevalecen en el orden interno y guían la interpretación de los derechos de la Carta.',
    caso: 'Integra al análisis el PIDESC (salud y nivel de vida adecuado), el Protocolo de San Salvador (ambiente sano) y la Declaración de Río (precaución y participación).' },

  { n: '8', grupo: 'ecologica', nombre: 'Protección de las riquezas naturales',
    dice: 'Es obligación del Estado y de las personas proteger las riquezas culturales y naturales de la Nación.',
    caso: 'La obligación recae a la vez sobre las autoridades y sobre la empresa: ambos responden por el cuidado de las fuentes hídricas y los suelos de la vereda.' },
  { n: '58', grupo: 'ecologica', nombre: 'Función social y ecológica de la propiedad',
    dice: 'La propiedad es una función social que implica obligaciones; como tal, le es inherente una función ecológica.',
    caso: 'La empresa no puede usar sus predios de un modo que contamine el agua o degrade los suelos de sus vecinos: ese límite hace parte del propio derecho de propiedad.' },
  { n: '80', grupo: 'ecologica', nombre: 'Prevención y control del deterioro ambiental',
    dice: 'El Estado planifica el manejo de los recursos naturales, debe prevenir y controlar los factores de deterioro ambiental, imponer sanciones y exigir la reparación de los daños.',
    caso: 'De aquí se desprende el deber de actuar antes de que el daño sea irreversible. Junto con la Ley 99 de 1993 (art. 1.6) sustenta el principio de precaución.' },
  { n: '333', grupo: 'ecologica', nombre: 'Libertad económica con límites',
    dice: 'La actividad económica y la iniciativa privada son libres dentro de los límites del bien común; la ley delimita su alcance cuando lo exijan el interés social y el ambiente.',
    caso: 'La empresa ejerce un derecho legítimo, pero no absoluto: la Constitución misma señala el ambiente como límite a su actividad.' },

  { n: '11', grupo: 'fundamentales', nombre: 'Derecho a la vida',
    dice: 'El derecho a la vida es inviolable.',
    caso: 'Leído como vida en condiciones dignas, se compromete cuando el agua de consumo y el aire que respira la comunidad están contaminados.' },
  { n: '49', grupo: 'fundamentales', nombre: 'Salud y saneamiento ambiental',
    dice: 'La atención de la salud y el saneamiento ambiental son servicios públicos a cargo del Estado.',
    caso: 'Los riesgos para la salud por agua contaminada, quemas y agroquímicos exigen medidas de prevención, no solo la verificación de permisos.' },
  { n: '366', grupo: 'fundamentales', nombre: 'Agua potable como objetivo del Estado',
    dice: 'La solución de las necesidades insatisfechas de salud, saneamiento ambiental y agua potable es objetivo fundamental de la actividad estatal.',
    caso: 'Respalda la exigencia de agua apta para el consumo. La Corte Constitucional reconoce el agua para consumo humano como derecho fundamental (T-740 de 2011).' },
  { n: '13', grupo: 'fundamentales', nombre: 'Igualdad material',
    dice: 'El Estado promueve las condiciones para que la igualdad sea real y efectiva y protege especialmente a quienes se encuentran en debilidad manifiesta.',
    caso: 'La comunidad rural está en desventaja frente a la empresa y a la administración: el Estado debe inclinarse hacia la parte más débil.' },
  { n: '44', grupo: 'fundamentales', nombre: 'Derechos prevalentes de los niños',
    dice: 'Son derechos fundamentales de los niños la vida, la integridad física y la salud; sus derechos prevalecen sobre los de los demás.',
    caso: 'El riesgo para la salud de los niños de la vereda refuerza la urgencia y abre la puerta a la acción de tutela.' },
  { n: '46', grupo: 'fundamentales', nombre: 'Protección de los adultos mayores',
    dice: 'El Estado, la sociedad y la familia concurren en la protección y asistencia de las personas de la tercera edad.',
    caso: 'Los adultos mayores expuestos a la contaminación son sujetos de especial protección constitucional.' },
  { n: '64', grupo: 'fundamentales', nombre: 'Campesinado como sujeto de especial protección',
    dice: 'El campesinado es sujeto de derechos y de especial protección; tiene un relacionamiento particular con la tierra basado en la producción de alimentos (Acto Legislativo 01 de 2023).',
    caso: 'La alteración de las prácticas agrícolas tradicionales de la vereda afecta el modo de vida que la Constitución hoy protege expresamente.' },

  { n: '79', grupo: 'colectivos', nombre: 'Ambiente sano y participación',
    dice: 'Todas las personas tienen derecho a gozar de un ambiente sano. La ley garantizará la participación de la comunidad en las decisiones que puedan afectarlo.',
    caso: 'Es la norma central del caso: recoge tanto el daño ambiental como la falta de información y participación en la ampliación de las operaciones.' },
  { n: '88', grupo: 'colectivos', nombre: 'Acciones populares e intereses colectivos',
    dice: 'La ley regulará las acciones populares para la protección de los derechos e intereses colectivos, como el ambiente, la salubridad y la seguridad públicas.',
    caso: 'Ofrece la vía judicial principal para la comunidad: la acción popular (Ley 472 de 1998), con posibilidad de medidas cautelares.' },
  { n: '23', grupo: 'colectivos', nombre: 'Derecho de petición',
    dice: 'Toda persona puede presentar peticiones respetuosas a las autoridades y obtener pronta resolución.',
    caso: 'Las solicitudes de la comunidad merecían una respuesta de fondo. Además, sirven como reclamación previa para acudir a la acción popular.' }
];

/* ---------- Hechos del caso y su relación con la matriz ---------- */
const hechos = [
  { id: 'agua', etiqueta: 'Agua contaminada', etapa: 2, zona: 'zona-rio',
    titulo: 'Contaminación de las fuentes hídricas',
    texto: 'Las fuentes que la comunidad usa para consumo humano y riego presentan contaminación, presuntamente por vertimientos residuales de la empresa. Lo que en apariencia es un asunto ambiental colectivo toca de inmediato derechos fundamentales: sin agua apta para el consumo se comprometen la salud y la vida digna.',
    arts: ['11', '49', '366', '79', '80', '93'] },
  { id: 'aire', etiqueta: 'Quemas y agroquímicos', etapa: 2, zona: 'zona-cultivos',
    titulo: 'Deterioro de la calidad del aire',
    texto: 'Las quemas controladas y el uso de agroquímicos disminuyen la calidad del aire. Que una práctica esté permitida no agota el análisis: la libertad económica tiene como límite expreso el ambiente, y la propiedad cumple una función ecológica.',
    arts: ['49', '79', '80', '58', '333'] },
  { id: 'suelo', etiqueta: 'Suelos y cultivos tradicionales', etapa: 2, zona: 'zona-parcelas',
    titulo: 'Afectación de suelos, ecosistemas y agricultura campesina',
    texto: 'La degradación de suelos y ecosistemas ha alterado las prácticas agrícolas tradicionales. Está en juego el entorno natural y también el modo de vida campesino, que desde 2023 cuenta con protección constitucional reforzada.',
    arts: ['8', '58', '64', '79', '80'] },
  { id: 'salud', etiqueta: 'Niños y adultos mayores', etapa: 2, zona: 'zona-escuela',
    titulo: 'Riesgos para la salud de la población más vulnerable',
    texto: 'El caso menciona riesgos para la salud de niños, adultos mayores y población en general. La presencia de sujetos de especial protección eleva el deber de diligencia del Estado y justifica una respuesta judicial urgente.',
    arts: ['11', '13', '44', '46', '49'] },
  { id: 'participacion', etiqueta: 'Ampliación sin participación', etapa: 2, zona: 'zona-casas',
    titulo: 'Falta de información y participación',
    texto: 'La comunidad no fue informada ni consultada sobre la ampliación de las operaciones. Al tratarse de una comunidad campesina no opera la consulta previa de los pueblos étnicos, pero sí el derecho de toda comunidad a participar en las decisiones que afectan su ambiente (art. 79) mediante audiencias públicas y demás instrumentos de la Ley 99 de 1993.',
    arts: ['1', '2', '79', '23', '64'] },
  { id: 'estado', etiqueta: 'Respuesta de las autoridades', etapa: 3, zona: 'zona-alcaldia',
    titulo: 'Inacción amparada en la licencia vigente',
    texto: 'La administración municipal y la autoridad ambiental responden que la empresa tiene licencias vigentes y se limitan a realizar visitas técnicas, sin medidas de mitigación ni de prevención. Esa respuesta confunde la legalidad formal del permiso con el cumplimiento de los deberes constitucionales de protección.',
    arts: ['1', '2', '80', '228', '23'] }
];

const etapas = [
  { nombre: 'Antes de la ampliación', capas: [],
    texto: 'La empresa agroindustrial opera en las cercanías con licencia. La vereda vive de la agricultura tradicional y toma el agua de sus fuentes para consumo y riego.' },
  { nombre: 'Ampliación de las operaciones', capas: ['capa-ampliacion', 'capa-agua', 'capa-aire', 'capa-suelo'],
    texto: 'La empresa amplía sus operaciones sin informar ni consultar a la comunidad. Aparecen la contaminación del agua, el deterioro del aire y la afectación de los suelos.' },
  { nombre: 'Reclamos sin respuesta efectiva', capas: ['capa-ampliacion', 'capa-agua', 'capa-aire', 'capa-suelo', 'capa-estado'],
    texto: 'La comunidad eleva múltiples solicitudes. Las autoridades invocan la licencia vigente y solo realizan visitas técnicas, sin medidas concretas de mitigación.' },
  { nombre: 'Organización y defensa constitucional', capas: ['capa-ampliacion', 'capa-agua', 'capa-aire', 'capa-suelo', 'capa-estado', 'capa-proteccion'],
    texto: 'La comunidad se organiza y busca asesoría jurídica. Se abre la ruta de las acciones constitucionales: acción popular con medidas cautelares y tutela para el agua y la salud.' }
];

/* ---------- Constructor del problema jurídico ---------- */
const piezas = [
  { id: 'sujeto', titulo: '¿A quién se examina?', guia: 'El problema debe señalar de quién es la conducta que se juzga.',
    opciones: [
      { t: 'A la empresa agroindustrial, por contaminar', ok: false, frag: null,
        pista: 'La empresa causa el daño, pero el caso pregunta por la respuesta del Estado: el vacío está en las autoridades que no actúan. La empresa aparece en el problema como origen de la afectación.' },
      { t: 'A la administración municipal y a la autoridad ambiental competente', ok: true,
        frag: '¿Vulneran la administración municipal y la autoridad ambiental competente',
        pista: 'Correcto. Son las autoridades las que tienen el deber constitucional de proteger (arts. 2, 79 y 80) y las que deciden no intervenir.' },
      { t: 'A la comunidad, por no haber demandado antes', ok: false, frag: null,
        pista: 'La comunidad es titular de los derechos, no la obligada. Además, sí acudió a las autoridades con múltiples solicitudes.' }
    ] },
  { id: 'conducta', titulo: '¿Qué conducta se cuestiona?', guia: 'Debe describir el hecho con relevancia constitucional, sin adelantar la respuesta.',
    opciones: [
      { t: 'Haber otorgado una licencia ambiental', ok: false, frag: null,
        pista: 'El caso no cuestiona el otorgamiento inicial, sino lo que ocurrió después: la ampliación sin participación y la falta de medidas ante el daño.' },
      { t: 'Abstenerse de adoptar medidas de prevención y mitigación, y no garantizar la participación de la comunidad, con el argumento de que la empresa tiene licencias vigentes', ok: true,
        frag: 'al abstenerse de adoptar medidas de prevención y mitigación frente a las afectaciones ambientales causadas por una empresa agroindustrial, y al no garantizar la participación de la comunidad en la ampliación de sus operaciones, con el argumento de que la empresa cuenta con licencias vigentes?',
        pista: 'Correcto. Recoge la omisión, la falta de participación y la razón que la administración ofrece: los tres elementos que el juez tendría que valorar.' },
      { t: 'Actuar de mala fe en favor de la empresa', ok: false, frag: null,
        pista: 'El caso no ofrece hechos que permitan afirmar mala fe. Un problema jurídico se construye con los hechos probados o narrados, no con suposiciones.' }
    ] },
  { id: 'derecho', titulo: '¿Qué se pone en riesgo?', guia: 'Debe identificar los principios y derechos constitucionales comprometidos.',
    opciones: [
      { t: 'Las normas técnicas sobre vertimientos', ok: false, frag: null,
        pista: 'Ese sería un problema de legalidad ordinaria. El análisis que pide la fase es constitucional: principios, derechos y fines del Estado.' },
      { t: 'Únicamente el derecho colectivo al ambiente sano', ok: false, frag: null,
        pista: 'Es parte de la respuesta, pero incompleta: el caso también compromete la salud, el agua, la participación y la protección de niños y adultos mayores.' },
      { t: 'Los principios del Estado social de derecho y los derechos al ambiente sano, la salud, el agua y la participación de la comunidad', ok: true,
        frag: 'los principios del Estado social de derecho (arts. 1 y 2 C. P.) y los derechos al ambiente sano, a la salud, al agua y a la participación de la comunidad de la vereda El Encanto (arts. 49, 79, 80 y 366 C. P.),',
        pista: 'Correcto. Articula la parte axiológica de la Constitución con los derechos concretos afectados.' }
    ] }
];

/* ---------- Balanza de ponderación ---------- */
const pesas = [
  { id: 'esd', t: 'Dignidad humana y Estado social de derecho', n: 'Arts. 1 y 2 C. P.' },
  { id: 'eco', t: 'Función ecológica de la propiedad', n: 'Art. 58 C. P.' },
  { id: 'pre', t: 'Deber de prevención y principio de precaución', n: 'Art. 80 C. P. · Ley 99 de 1993, art. 1.6' },
  { id: 'agua', t: 'Agua para consumo humano y salud', n: 'Arts. 49 y 366 C. P. · T-740 de 2011' },
  { id: 'suj', t: 'Niños, adultos mayores y campesinado', n: 'Arts. 13, 44, 46 y 64 C. P.' },
  { id: 'par', t: 'Participación omitida en la ampliación', n: 'Art. 79 C. P. · Ley 99 de 1993, art. 72' }
];
const PESO_IZQ = 3;
const lecturas = [
  { titulo: 'Lectura formalista: la licencia decide',
    texto: 'Si solo se pesan la libertad de empresa y la presunción de legalidad del permiso, la balanza favorece a la empresa. Es la respuesta que dieron las autoridades: revisar papeles y dar por cumplido su deber.' },
  { titulo: 'Tensión abierta: el caso exige ponderar',
    texto: 'Al incorporar principios y derechos de la Carta, la licencia deja de ser un argumento concluyente. Ya no basta con invocarla: hay que justificar por qué debería prevalecer sobre los derechos de la comunidad.' },
  { titulo: 'Garantía sustancial: prevalece la protección',
    texto: 'Vistos en conjunto, los principios del Estado social de derecho pesan más que el respaldo formal del permiso. La libertad de empresa no desaparece, pero debe ejercerse sin sacrificar el agua, la salud y el ambiente de la vereda.' }
];

/* ---------- Audiencia pública ---------- */
const actores = [
  { id: 'empresa', icono: '🏭', nombre: 'Empresa agroindustrial', rol: 'Titular de las licencias',
    alegato: '«Operamos con licencias vigentes y dentro de los parámetros de la norma. Generamos empleo en la región y ejercemos una actividad lícita, protegida por la libertad de empresa».',
    analisis: 'El argumento es atendible: la iniciativa privada tiene protección constitucional (art. 333). Su debilidad está en lo que omite. El mismo artículo fija como límites el bien común y el ambiente, y el artículo 58 hace de la función ecológica una parte del derecho de propiedad. La licencia autoriza una actividad; no autoriza a causar daño ni exime de responder por él.',
    normas: 'Arts. 58, 333 y 95.8 C. P.', sello: 'mixto', lectura: 'Derecho legítimo, pero no absoluto' },
  { id: 'comunidad', icono: '🏡', nombre: 'Comunidad de El Encanto', rol: 'Titular de los derechos afectados',
    alegato: '«El agua que tomamos y con la que regamos está contaminada. Nuestros niños y nuestros mayores se están enfermando. Nadie nos informó de la ampliación ni nos preguntó; hemos escrito muchas veces y solo vienen a hacer visitas».',
    analisis: 'La comunidad plantea un reclamo que reúne derechos colectivos (ambiente sano, salubridad pública) y derechos fundamentales (salud, agua, vida digna), además del derecho a participar en las decisiones ambientales. Al organizarse y acudir a los mecanismos de la Carta, ejerce la democracia participativa que la Constitución de 1991 quiso poner en manos de la ciudadanía.',
    normas: 'Arts. 11, 44, 46, 49, 64, 79 y 366 C. P.', sello: 'sustancial', lectura: 'Reclamo propio del Estado social de derecho' },
  { id: 'autoridades', icono: '🏛️', nombre: 'Alcaldía y autoridad ambiental', rol: 'Responsables del control',
    alegato: '«La empresa cuenta con licencias vigentes y sus actividades se desarrollan dentro de los parámetros normativos. Hemos realizado las visitas técnicas correspondientes».',
    analisis: 'Es la postura más problemática. Las autoridades reducen su función a constatar la existencia del permiso, cuando la Constitución les ordena prevenir y controlar el deterioro ambiental (art. 80) y garantizar la efectividad de los derechos (art. 2). Una licencia no congela la realidad: si aparecen daños, la autoridad puede y debe imponer medidas preventivas, exigir ajustes e incluso revisar el permiso.',
    normas: 'Arts. 2, 80 y 209 C. P. · Ley 99 de 1993 · Ley 1333 de 2009', sello: 'formal', lectura: 'Formalismo: el trámite sustituye la protección' },
  { id: 'defensoria', icono: '⚖️', nombre: 'Defensoría del Pueblo y Personería', rol: 'Ministerio Público',
    alegato: '«Frente a un riesgo serio para la salud de niños y adultos mayores, la falta de certeza científica no justifica la espera. Solicitamos medidas inmediatas y la apertura de espacios reales de participación».',
    analisis: 'El Ministerio Público recuerda el contenido del principio de precaución: ante el peligro de daño grave e irreversible, la falta de certeza científica absoluta no es razón para postergar medidas eficaces. También puede acompañar a la comunidad e incluso interponer las acciones populares y de tutela en su nombre.',
    normas: 'Arts. 118, 277 y 282 C. P. · Ley 472 de 1998, art. 12', sello: 'sustancial', lectura: 'Garantía sustancial de los derechos' }
];

const remedios = [
  { t: 'Suspender de manera preventiva los vertimientos y las quemas mientras se verifica su impacto', ok: true,
    por: 'Procede. El juez de la acción popular puede decretar medidas cautelares para prevenir un daño inminente o hacer cesar el causado (Ley 472 de 1998, art. 25).' },
  { t: 'Ordenar el suministro provisional de agua potable a la comunidad', ok: true,
    por: 'Procede. Protege de inmediato el derecho al agua para consumo humano y la salud, con prioridad para niños y adultos mayores (arts. 44, 46, 49 y 366).' },
  { t: 'Archivar el reclamo porque la licencia está vigente', ok: false,
    por: 'No procede. La vigencia del permiso no responde a la pregunta por el daño. Decidir así haría prevalecer la forma sobre el derecho sustancial (arts. 2 y 228).' },
  { t: 'Ordenar estudios técnicos independientes de agua, aire y suelos, con seguimiento de la comunidad', ok: true,
    por: 'Procede. Supera las visitas sin consecuencias y da base probatoria a las decisiones de fondo; el comité de verificación permite el seguimiento (Ley 472 de 1998, art. 34).' },
  { t: 'Convocar una audiencia pública ambiental sobre la ampliación de las operaciones', ok: true,
    por: 'Procede. Repara el déficit de participación: la comunidad tiene derecho a ser informada y oída en las decisiones que afectan su ambiente (art. 79; Ley 99 de 1993, art. 72).' },
  { t: 'Anular la licencia ambiental dentro de la misma acción popular', ok: false,
    por: 'No por esta vía. El juez popular puede ordenar todo lo necesario para hacer cesar la amenaza, pero no anular el acto administrativo (CPACA, art. 144). La nulidad de la licencia se tramita por su propio medio de control.' }
];

/* ---------- Ruta judicial ---------- */
const vias = [
  { necesidad: 'Detener la contaminación del agua, el aire y los suelos de toda la vereda',
    nombre: 'Acción popular', base: 'Art. 88 C. P. · Ley 472 de 1998',
    filas: [
      ['Protege', 'Derechos e intereses colectivos: ambiente sano, salubridad pública, equilibrio ecológico.'],
      ['Quién', 'Cualquier persona u organización de la comunidad; también la Defensoría o la Personería.'],
      ['Ante quién', 'Juez administrativo, porque se cuestiona también la omisión de autoridades públicas.'],
      ['Qué pedir', 'Medidas cautelares de suspensión de vertimientos y quemas, estudios técnicos, restauración y comité de verificación.']
    ],
    alerta: 'Antes de demandar debe pedirse a la autoridad que adopte las medidas de protección; si no responde en quince días o se niega, se acude al juez (CPACA, art. 144). Las solicitudes que la comunidad ya presentó sirven a este propósito.' },
  { necesidad: 'Proteger con urgencia la salud y el agua de niños y adultos mayores',
    nombre: 'Acción de tutela', base: 'Art. 86 C. P. · Decreto 2591 de 1991',
    filas: [
      ['Protege', 'Derechos fundamentales: salud, agua para consumo humano, vida digna, derechos de los niños.'],
      ['Quién', 'Las personas afectadas, por sí mismas o por medio de agente oficioso, Defensoría o Personería.'],
      ['Ante quién', 'Cualquier juez del lugar; decide en un máximo de diez días.'],
      ['Qué pedir', 'Suministro de agua potable, atención en salud y medidas inmediatas frente a la fuente de riesgo.']
    ],
    alerta: 'La tutela es subsidiaria. Procede aunque el origen sea un daño colectivo cuando se demuestra la afectación directa de un derecho fundamental de personas determinadas (Corte Constitucional, SU-1116 de 2001).' },
  { necesidad: 'Cuestionar la licencia por haberse ampliado la operación sin participación',
    nombre: 'Nulidad del acto administrativo', base: 'CPACA, art. 137 · Ley 99 de 1993, art. 73',
    filas: [
      ['Protege', 'La legalidad del acto y, a través de ella, el derecho de participación en materia ambiental.'],
      ['Quién', 'Cualquier persona, tratándose de actos que expiden o modifican licencias ambientales.'],
      ['Ante quién', 'Jurisdicción de lo contencioso administrativo.'],
      ['Qué pedir', 'Nulidad del acto que autorizó la ampliación y su suspensión provisional mientras se decide.']
    ],
    alerta: 'Exige identificar el acto concreto y el vicio que se le atribuye (por ejemplo, expedición irregular por omitir instancias de participación). Es una vía más lenta: complementa, no reemplaza, a la acción popular.' },
  { necesidad: 'Obligar a las autoridades a ejercer el control que la ley les ordena',
    nombre: 'Acción de cumplimiento', base: 'Art. 87 C. P. · Ley 393 de 1997',
    filas: [
      ['Protege', 'La eficacia de normas con fuerza de ley y de actos administrativos.'],
      ['Quién', 'Cualquier persona.'],
      ['Ante quién', 'Juez administrativo.'],
      ['Qué pedir', 'Que la autoridad cumpla un deber claro y expreso: monitoreos, seguimiento a la licencia, medidas del plan de manejo.']
    ],
    alerta: 'Requiere constituir antes en renuencia a la autoridad y no procede si existe otro medio judicial eficaz. En este caso su papel es secundario.' },
  { necesidad: 'Ser informados y oídos antes de acudir a los jueces',
    nombre: 'Petición y participación ambiental', base: 'Arts. 23 y 79 C. P. · Ley 1755 de 2015 · Ley 99 de 1993, arts. 69 a 72',
    filas: [
      ['Protege', 'El acceso a la información y la participación en las decisiones ambientales.'],
      ['Quién', 'Cualquier persona, sin necesidad de demostrar interés jurídico.'],
      ['Ante quién', 'Alcaldía y autoridad ambiental.'],
      ['Qué pedir', 'Copia de las licencias y de los informes de las visitas, intervención en el trámite y audiencia pública ambiental.']
    ],
    alerta: 'No detiene por sí sola la contaminación, pero permite obtener pruebas, dejar constancia de la omisión y cumplir la reclamación previa de la acción popular.' }
];

/* =========================================================
   Lógica
   ========================================================= */

/* ----- Visor territorial y matriz ----- */
function iniciarVisor() {
  const chips = $('#chipsHechos');
  const cajaGrupos = $('#matriz');
  const detalle = $('#detalleHecho');
  const ficha = $('#fichaArticulo');
  const rango = $('#etapa');
  let hechoActivo = null;

  grupos.forEach(g => {
    const sec = document.createElement('div');
    sec.className = 'grupo';
    sec.innerHTML = `<h4>${g.nombre}</h4><div class="articulos"></div>`;
    const caja = $('.articulos', sec);
    articulos.filter(a => a.grupo === g.id).forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'articulo';
      b.dataset.art = a.n;
      b.setAttribute('aria-expanded', 'false');
      b.innerHTML = `<b>Art. ${a.n}</b><span>${a.nombre}</span>`;
      b.addEventListener('click', () => mostrarArticulo(a, b));
      caja.append(b);
    });
    cajaGrupos.append(sec);
  });

  function mostrarArticulo(a, boton) {
    $$('.articulo').forEach(x => x.setAttribute('aria-expanded', String(x === boton)));
    ficha.hidden = false;
    boton.closest('.grupo').after(ficha);
    ficha.innerHTML = `<h4>Artículo ${a.n} · ${a.nombre}</h4>
      <p><b>Qué establece.</b> ${a.dice}</p>
      <p><b>Relación con el caso.</b> ${a.caso}</p>`;
    if (ficha.getBoundingClientRect().bottom > innerHeight) ficha.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function pintarEtapa(i) {
    const e = etapas[i];
    $('#etapaNombre').textContent = `Etapa ${i + 1} de ${etapas.length} · ${e.nombre}`;
    $('#etapaTexto').textContent = e.texto;
    rango.setAttribute('aria-valuetext', e.nombre);
    $$('.capa').forEach(c => c.classList.toggle('visible', e.capas.includes(c.id)));
  }

  function elegirHecho(id) {
    hechoActivo = hechoActivo === id ? null : id;
    const h = hechos.find(x => x.id === hechoActivo);
    $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.hecho === hechoActivo)));
    $$('.zona').forEach(z => z.classList.toggle('activa', !!h && z.id === h.zona));
    $$('.articulo').forEach(a => a.classList.toggle('resaltado', !!h && h.arts.includes(a.dataset.art)));
    $$('.articulos').forEach(c => c.classList.toggle('filtrando', !!h));
    if (!h) {
      detalle.innerHTML = `<h3>Explora el territorio</h3>
        <p>Selecciona un hecho o una zona del mapa para ver qué ocurre allí y qué normas de la Constitución se activan en la matriz.</p>`;
      return;
    }
    if (Number(rango.value) < h.etapa - 1) { rango.value = h.etapa - 1; pintarEtapa(h.etapa - 1); }
    detalle.innerHTML = `<h3>${h.titulo}</h3><p>${h.texto}</p>
      <p class="normas">Normas que se activan: arts. ${h.arts.join(', ')} C. P.</p>
      <p class="no-imprimir"><a class="boton-texto" href="#matrizTitulo">Ver estas normas en la matriz ↓</a></p>`;
    if (matchMedia('(max-width: 900px)').matches) acercar(detalle);
  }

  hechos.forEach(h => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.hecho = h.id;
    c.setAttribute('aria-pressed', 'false');
    c.textContent = h.etiqueta;
    c.addEventListener('click', () => elegirHecho(h.id));
    chips.append(c);
    const zona = document.getElementById(h.zona);
    if (zona) {
      zona.addEventListener('click', () => elegirHecho(h.id));
      zona.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); elegirHecho(h.id); }
      });
    }
  });

  rango.addEventListener('input', () => pintarEtapa(Number(rango.value)));
  pintarEtapa(Number(rango.value));
  elegirHecho(null);
}

/* ----- Constructor del problema jurídico ----- */
function iniciarConstructor() {
  const caja = $('#constructor');
  const salida = $('#problemaTexto');
  const estado = $('#problemaEstado');
  const eleccion = {};
  const completo = [piezas[0], piezas[2], piezas[1]].map(p => p.opciones.find(o => o.ok).frag).join(' ');

  function actualizar() {
    const aciertos = piezas.filter(p => eleccion[p.id] && eleccion[p.id].ok).length;
    if (aciertos === piezas.length) {
      salida.textContent = completo;
      estado.textContent = 'Problema jurídico formulado: identifica a los obligados, la conducta y los derechos comprometidos, y puede responderse con un sí o un no argumentado.';
    } else {
      const partes = [piezas[0], piezas[2], piezas[1]].map(p =>
        eleccion[p.id] && eleccion[p.id].ok ? eleccion[p.id].frag : '[ … ]');
      salida.textContent = partes.join(' ');
      estado.textContent = `Piezas correctas: ${aciertos} de ${piezas.length}. Elige una opción en cada columna para armar la pregunta.`;
    }
  }

  piezas.forEach(p => {
    const col = document.createElement('div');
    col.className = 'pieza panel';
    col.innerHTML = `<h3>${p.titulo}</h3><p>${p.guia}</p><div class="opciones"></div><p class="pista" aria-live="polite"></p>`;
    const pista = $('.pista', col);
    p.opciones.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opcion';
      b.setAttribute('aria-pressed', 'false');
      b.textContent = o.t;
      b.addEventListener('click', () => {
        $$('.opcion', col).forEach(x => { x.setAttribute('aria-pressed', 'false'); x.classList.remove('acierto', 'impreciso'); });
        b.setAttribute('aria-pressed', 'true');
        b.classList.add(o.ok ? 'acierto' : 'impreciso');
        pista.textContent = o.pista;
        eleccion[p.id] = o;
        actualizar();
      });
      $('.opciones', col).append(b);
    });
    caja.append(col);
  });

  $('#verProblema').addEventListener('click', () => {
    piezas.forEach((p, i) => {
      const idx = p.opciones.findIndex(o => o.ok);
      $$('.pieza', caja)[i].querySelectorAll('.opcion')[idx].click();
    });
  });
  actualizar();
  // La versión impresa siempre muestra el problema completo.
  window.addEventListener('beforeprint', () => { salida.dataset.previo = salida.textContent; salida.textContent = completo; });
  window.addEventListener('afterprint', () => { if (salida.dataset.previo) salida.textContent = salida.dataset.previo; });
}

/* ----- Balanza ----- */
function iniciarBalanza() {
  const caja = $('#pesas');
  const activas = new Set();
  const L = 150, CX = 240, CY = 96;

  function pintar() {
    const der = activas.size;
    const angulo = Math.max(-13, Math.min(15, (der - PESO_IZQ) * 4.5));
    const rad = angulo * Math.PI / 180;
    $('#brazo').style.transform = `rotate(${angulo}deg)`;
    $('#platoIzq').style.transform = `translate(${CX - L * Math.cos(rad)}px, ${CY - L * Math.sin(rad)}px)`;
    $('#platoDer').style.transform = `translate(${CX + L * Math.cos(rad)}px, ${CY + L * Math.sin(rad)}px)`;
    $$('#platoDer .ficha-peso').forEach((f, i) => f.style.opacity = i < der ? 1 : 0);
    const nivel = der < PESO_IZQ ? 0 : der === PESO_IZQ ? 1 : 2;
    const l = lecturas[nivel];
    const lectura = $('#lectura');
    lectura.dataset.nivel = nivel;
    lectura.innerHTML = `<strong>${l.titulo}</strong><p>${l.texto}</p>`;
    $('#medidorPunto').style.left = `${(der / pesas.length) * 100}%`;
  }

  pesas.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pesa';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span>${p.t}<small>${p.n}</small></span>`;
    b.addEventListener('click', () => {
      activas.has(p.id) ? activas.delete(p.id) : activas.add(p.id);
      b.setAttribute('aria-pressed', String(activas.has(p.id)));
      pintar();
    });
    caja.append(b);
  });
  pintar();
}

/* ----- Audiencia ----- */
function iniciarAudiencia() {
  const lista = $('#actores');
  const panel = $('#alegato');
  const oidos = new Set();

  function mostrar(a, porClic) {
    oidos.add(a.id);
    $$('.actor', lista).forEach(b => b.setAttribute('aria-selected', String(b.dataset.actor === a.id)));
    panel.innerHTML = `<p class="antetitulo">${a.rol}</p>
      <h3>${a.nombre}</h3>
      <blockquote style="margin-top:14px">${a.alegato}</blockquote>
      <h4>Análisis dogmático</h4><p>${a.analisis}</p>
      <h4>Normas en juego</h4><p>${a.normas}</p>
      <span class="sello ${a.sello}">${a.lectura}</span>`;
    $('#oidos').textContent = `Intervenciones escuchadas: ${oidos.size} de ${actores.length}`;
    if (porClic) acercar(panel);
  }

  actores.forEach(a => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'actor';
    b.dataset.actor = a.id;
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.innerHTML = `<i aria-hidden="true">${a.icono}</i><span><b>${a.nombre}</b><small>${a.rol}</small></span>`;
    b.addEventListener('click', () => mostrar(a, true));
    lista.append(b);
  });
  mostrar(actores[0]);

  const caja = $('#remedios');
  const veredicto = $('#veredicto');
  remedios.forEach(r => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `remedio ${r.ok ? 'procede' : 'no-procede'}`;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `${r.t}<em>${r.por}</em>`;
    b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      const marcados = $$('.remedio[aria-pressed="true"]', caja);
      const buenos = marcados.filter(x => x.classList.contains('procede')).length;
      const malos = marcados.length - buenos;
      const total = remedios.filter(x => x.ok).length;
      veredicto.textContent = marcados.length === 0 ? '' :
        `Medidas procedentes adoptadas: ${buenos} de ${total}` + (malos ? ` · Decisiones que no proceden: ${malos}` : '') +
        (buenos === total && !malos ? '. La decisión protege a la comunidad sin desbordar las competencias del juez.' : '.');
    });
    caja.append(b);
  });
}

/* ----- Ruta judicial ----- */
function iniciarRuta() {
  const lista = $('#necesidades');
  const panel = $('#via');
  function mostrar(v, boton, porClic) {
    $$('.necesidad', lista).forEach(b => b.setAttribute('aria-selected', String(b === boton)));
    panel.innerHTML = `<p class="antetitulo">Vía recomendada</p><h3>${v.nombre}</h3>
      <p class="nota">${v.base}</p>
      <dl>${v.filas.map(f => `<div><dt>${f[0]}</dt><dd>${f[1]}</dd></div>`).join('')}</dl>
      <p class="alerta"><b>Ten en cuenta.</b> ${v.alerta}</p>`;
    if (porClic) acercar(panel);
  }
  vias.forEach((v, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'necesidad';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.textContent = v.necesidad;
    b.addEventListener('click', () => mostrar(v, b, true));
    lista.append(b);
    if (i === 0) mostrar(v, b);
  });
}

/* ----- Navegación, impresión y conteo ----- */
function iniciarPagina() {
  const enlaces = $$('.indice a');
  const barra = $('.indice ol');
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      enlaces.forEach(a => {
        const actual = a.getAttribute('href') === `#${e.target.id}`;
        a.classList.toggle('actual', actual);
        if (actual) barra.scrollTo({ left: a.offsetLeft - (barra.clientWidth - a.offsetWidth) / 2, behavior: 'instant' });
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => observador.observe(s));

  $('#btnPdf').addEventListener('click', () => window.print());
  let abiertas = [];
  window.addEventListener('beforeprint', () => {
    abiertas = $$('details').filter(d => d.open);
    $$('details').forEach(d => d.open = true);
  });
  window.addEventListener('afterprint', () => $$('details').forEach(d => d.open = abiertas.includes(d)));

  const palabras = $$('#ensayo p:not(.conteo)').map(p => p.textContent).join(' ').trim().split(/\s+/).length;
  $('#conteo').textContent = `Extensión de la explicación escrita: ${palabras.toLocaleString('es-CO')} palabras.`;
}

iniciarVisor();
iniciarConstructor();
iniciarBalanza();
iniciarAudiencia();
iniciarRuta();
iniciarPagina();
