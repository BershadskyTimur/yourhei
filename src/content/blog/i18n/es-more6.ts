import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (es).
export const esMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: 'Cuánto cuesta estudiar en Australia para estudiantes internacionales',
    description: 'Cuánto cuesta un año de estudios en Australia para un estudiante internacional: grado, máster, formación profesional, cursos de inglés y grandes universidades, según CRICOS.',
    blocks: [
      { t: 'p', text: 'Un año de grado en una universidad australiana cuesta a un estudiante internacional unos **43 000 AUD**. Es el precio típico (mediana) de 4562 cursos en 63 universidades para 2026. La formación profesional en colleges cuesta un tercio de eso, unos 13 500 AUD al año. Abajo están los precios por nivel y en las grandes universidades, y cuánto dinero hay que demostrar para el visado.' },
      { t: 'h2', id: 'levels', text: 'Precios por nivel' },
      {
        t: 'ul',
        items: [
          '**Grado en una universidad:** unos 43 000 AUD al año. El 80 % de los cursos cuesta entre 30 800 y 58 300 AUD (4562 cursos).',
          '**Máster en una universidad:** unos 35 300 AUD al año. El 80 % de los cursos cuesta entre 22 100 y 54 900 AUD (705 cursos en 35 universidades; las grandes universidades registran menos másteres que grados).',
          '**Formación profesional (VET) en colleges e institutos:** unos 13 500 AUD al año, el 80 % entre 8000 y 25 000 AUD (3768 cursos).',
          '**Cursos de inglés:** unos 17 100 AUD al año, el 80 % entre 11 900 y 25 600 AUD (948 cursos).',
          '**Colegio para alumnos internacionales:** unos 31 000 AUD al año (838 cursos).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Precios en las grandes universidades (grado)' },
      { t: 'p', text: 'El precio típico de un año en los cursos de grado de la universidad, de menor a mayor:' },
      {
        t: 'ul',
        items: [
          '[Universidad Deakin](/institutions/au/deakin-university): unos 44 400 AUD',
          '[Universidad de Queensland](/institutions/au/university-of-queensland): unos 47 200 AUD',
          '[Universidad Macquarie](/institutions/au/macquarie-university): unos 48 200 AUD',
          '[Universidad RMIT](/institutions/au/rmit-university): unos 49 000 AUD',
          '[Universidad de Melbourne](/institutions/au/university-of-melbourne): unos 49 100 AUD',
          '[Universidad Tecnológica de Sídney](/institutions/au/university-of-technology-sydney): unos 51 000 AUD',
          '[Universidad de Australia Occidental](/institutions/au/university-of-western-australia): unos 51 100 AUD',
          '[Universidad de Nueva Gales del Sur](/institutions/au/university-of-new-south-wales): unos 56 000 AUD',
          '[Universidad Nacional Australiana](/institutions/au/australian-national-university): unos 56 100 AUD',
          '[Universidad Monash](/institutions/au/monash-university): unos 59 300 AUD',
          '[Universidad de Sídney](/institutions/au/university-of-sydney): unos 63 600 AUD',
        ],
      },
      { t: 'p', text: 'Los precios varían mucho entre los cursos de una misma universidad. El precio de cada curso está en su ficha en la página de la universidad.' },
      { t: 'cta', href: '/institutions/au', text: 'Todas las instituciones de Australia' },
      { t: 'cta', href: '/study/au', text: 'Estudiar en Australia: áreas' },
      { t: 'h2', id: 'how', text: 'Cómo lo calculamos' },
      {
        t: 'ul',
        items: [
          '**La fuente** es CRICOS, el registro oficial del Gobierno de Australia: recoge cada curso al que se puede ir con visado de estudiante, con su precio para estudiantes internacionales. Nuestra base tiene 1540 instituciones y unos 19 000 cursos con precio para 2026.',
          '**Precio por año.** El registro indica el precio de todo el curso; lo dividimos por su duración en años.',
          '**La mediana** es el precio del medio: la mitad de los cursos cuesta menos y la otra mitad más.',
          '**Solo matrícula.** No incluye alojamiento, comida, seguro médico para estudiantes (OSHC) ni visado.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Cuánto dinero hace falta para vivir' },
      { t: 'p', text: 'Para el visado de estudiante (subclass 500) hay que demostrar dinero para vivir: **29 710 AUD al año** para un estudiante, según el Departamento del Interior de Australia para 2026. Eso se suma a la matrícula y al viaje. Comprueba los documentos y la cantidad en la web del Departamento antes de solicitarlo.' },
      { t: 'note', text: 'Cantidades de otros países: [cuánto dinero hay que demostrar para un visado de estudiante](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Si es demasiado caro' },
      { t: 'p', text: 'Compara con otros países: [cuánto cuesta estudiar en el extranjero](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [países donde estudiar es gratis o casi gratis](/blog/free-tuition-germany-czechia-finland). Becas que lo cubren todo: [becas completas para estudiantes internacionales](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Fuentes' },
      { t: 'p', text: 'Precios: [CRICOS](https://cricos.education.gov.au/), Departamento de Educación del Gobierno de Australia, datos abiertos en data.gov.au, descargados en octubre de 2026. Dinero para vivir: [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), Departamento del Interior, comprobado el 8 de octubre de 2026. Antes de solicitar, comprueba el precio en la página del curso.' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: 'Cuánto cuesta estudiar en los Países Bajos para estudiantes internacionales',
    description: 'Cuánto cuesta un año de estudios en los Países Bajos: la tasa legal para ciudadanos de la UE, los precios para los demás por universidad y el coste del permiso de residencia.',
    blocks: [
      { t: 'p', text: 'Un año de máster en los Países Bajos cuesta a un estudiante de fuera de la UE unos **22 900 €**, un año de grado unos **16 900 €**. Son precios típicos (medianas) de 501 programas para los cursos 2026/27 y 2027/28. Los ciudadanos de la UE, el EEE, Suiza y Surinam pagan la tasa legal: **2694 €** en 2026/27, y la mayoría de los programas para 2027/28 indican **2771 €**.' },
      { t: 'h2', id: 'who-pays', text: 'Quién paga qué' },
      {
        t: 'ul',
        items: [
          '**La tasa legal (wettelijk collegegeld)** es para ciudadanos del EEE, Suiza y Surinam que aún no tienen el mismo título de una institución pública neerlandesa. Es igual en todas las instituciones públicas.',
          '**La tasa de la institución (instellingscollegegeld)** es para todos los demás, incluidos los estudiantes de la CEI, Asia y África. Cada institución fija la suya, así que varía entre instituciones y programas.',
          'Algunas instituciones cobran además a los estudiantes de fuera del EEE una tasa de solicitud: entre 75 y 100 €, según Study in NL.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Precios para estudiantes de fuera de la UE' },
      {
        t: 'ul',
        items: [
          '**Máster:** unos 22 900 € al año. El 80 % de los programas cuesta entre 19 600 y 26 000 € (385 programas).',
          '**Grado:** unos 16 900 € al año. El 80 % de los programas cuesta entre 11 800 y 24 500 € (116 programas).',
          'Un máster en los Países Bajos suele durar uno o dos años; un grado, tres años en una universidad de investigación y cuatro en una universidad de ciencias aplicadas.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Precios en las grandes universidades' },
      { t: 'p', text: 'El precio típico de un año para un estudiante de fuera de la UE:' },
      {
        t: 'ul',
        items: [
          '[Universidad Radboud](/institutions/nl/radboud-university): grado unos 15 800 €, máster unos 19 600 €',
          '[Universidad de Leiden](/institutions/nl/leiden-university): grado unos 14 700 €, máster unos 22 900 €',
          '[Universidad de Twente](/institutions/nl/university-of-twente): grado unos 16 900 €, máster unos 22 300 €',
          '[Universidad de Groninga](/institutions/nl/university-of-groningen): máster unos 22 800 €',
          '[Universidad de Ámsterdam](/institutions/nl/university-of-amsterdam): grado unos 17 600 €, máster unos 25 900 €',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Todas las instituciones de los Países Bajos' },
      { t: 'cta', href: '/study/nl', text: 'Estudiar en los Países Bajos: áreas' },
      { t: 'h2', id: 'how', text: 'Cómo lo calculamos' },
      {
        t: 'ul',
        items: [
          '**La fuente** es Study in NL (Nuffic), el portal oficial sobre estudiar en los Países Bajos. Nuestra base tiene 39 instituciones y 1481 programas; 501 de ellos indican un precio para estudiantes de fuera de la UE.',
          '**La mediana** es el precio del medio: la mitad de los programas cuesta menos y la otra mitad más.',
          '**Solo matrícula.** No incluye alojamiento, comida, seguro ni permiso de residencia.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Permiso de residencia y dinero para vivir' },
      {
        t: 'ul',
        items: [
          '**La tasa del IND** por el permiso de residencia para estudiar es de 254 € (importe de 2026; el IND la cambia cada año el 1 de enero). Normalmente la institución presenta la solicitud en nombre del estudiante.',
          '**Dinero para vivir:** el IND pide demostrar 1130,77 € al mes (norma de 2026), unos 13 600 € por año de estudios.',
          '**Trabajo:** con un permiso de residencia por estudios se puede trabajar hasta 16 horas a la semana, o a jornada completa en junio, julio y agosto; el empleador suele necesitar un permiso de trabajo.',
        ],
      },
      { t: 'note', text: 'Para entrar en una institución neerlandesa se solicita a través de Studielink, y muchos programas tienen plazos tempranos: [plazos y cómo funciona Studielink](/blog/netherlands-application-deadlines-studielink). Una beca para estudiantes de fuera del EEE: [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Si es demasiado caro' },
      { t: 'p', text: 'Compara con otros países: [cuánto cuesta estudiar en el extranjero](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Alemania, Chequia, Finlandia: dónde estudiar es gratis o casi gratis](/blog/free-tuition-germany-czechia-finland), [precio de estudiar en Suecia](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Fuentes' },
      { t: 'p', text: 'Precios de los programas: Study in NL (Nuffic), cursos 2026/27 y 2027/28. La tasa legal y quién la paga: [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Tasa del permiso de residencia: [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Dinero para vivir: [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). Comprobado el 18 de noviembre de 2026. Antes de solicitar, comprueba el precio en la página del programa.' },
    ],
  },
};
