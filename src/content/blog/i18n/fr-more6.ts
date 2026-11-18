import type { Translations } from '@/lib/blog/types';

// Machine translation of the articles on tuition in Australia and in the Netherlands (fr).
export const frMore6: Translations = {
  'australia-tuition-fees-international-students': {
    title: 'Frais de scolarité en Australie pour les étudiants internationaux',
    description: 'Ce que coûte une année d’études en Australie pour un étudiant international : licence, master, formation professionnelle, anglais et grandes universités, d’après CRICOS.',
    blocks: [
      { t: 'p', text: 'Une année de licence (bachelor) dans une université australienne coûte à un étudiant international environ **43 000 AUD**. C’est le prix typique (médiane) de 4 562 formations dans 63 universités pour 2026. La formation professionnelle dans les colleges coûte trois fois moins, environ 13 500 AUD par an. Voici les prix par niveau et dans les grandes universités, et combien d’argent il faut justifier pour le visa.' },
      { t: 'h2', id: 'levels', text: 'Prix par niveau' },
      {
        t: 'ul',
        items: [
          '**Licence à l’université :** environ 43 000 AUD par an. 80 % des formations coûtent entre 30 800 et 58 300 AUD (4 562 formations).',
          '**Master à l’université :** environ 35 300 AUD par an. 80 % des formations coûtent entre 22 100 et 54 900 AUD (705 formations dans 35 universités ; les grandes universités inscrivent moins de masters que de licences au registre).',
          '**Formation professionnelle (VET) dans les colleges et instituts :** environ 13 500 AUD par an, 80 % entre 8 000 et 25 000 AUD (3 768 formations).',
          '**Cours d’anglais :** environ 17 100 AUD par an, 80 % entre 11 900 et 25 600 AUD (948 cours).',
          '**École pour élèves internationaux :** environ 31 000 AUD par an (838 formations).',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Prix dans les grandes universités (licence)' },
      { t: 'p', text: 'Le prix typique d’une année sur les licences de l’université, du moins cher au plus cher :' },
      {
        t: 'ul',
        items: [
          '[Université Deakin](/institutions/au/deakin-university) : environ 44 400 AUD',
          '[Université du Queensland](/institutions/au/university-of-queensland) : environ 47 200 AUD',
          '[Université Macquarie](/institutions/au/macquarie-university) : environ 48 200 AUD',
          '[Université RMIT](/institutions/au/rmit-university) : environ 49 000 AUD',
          '[Université de Melbourne](/institutions/au/university-of-melbourne) : environ 49 100 AUD',
          '[Université de technologie de Sydney](/institutions/au/university-of-technology-sydney) : environ 51 000 AUD',
          '[Université d’Australie-Occidentale](/institutions/au/university-of-western-australia) : environ 51 100 AUD',
          '[Université de Nouvelle-Galles du Sud](/institutions/au/university-of-new-south-wales) : environ 56 000 AUD',
          '[Université nationale australienne](/institutions/au/australian-national-university) : environ 56 100 AUD',
          '[Université Monash](/institutions/au/monash-university) : environ 59 300 AUD',
          '[Université de Sydney](/institutions/au/university-of-sydney) : environ 63 600 AUD',
        ],
      },
      { t: 'p', text: 'Les prix varient beaucoup d’une formation à l’autre dans une même université. Le prix de chaque formation figure sur sa fiche, sur la page de l’université.' },
      { t: 'cta', href: '/institutions/au', text: 'Tous les établissements d’Australie' },
      { t: 'cta', href: '/study/au', text: 'Étudier en Australie : domaines' },
      { t: 'h2', id: 'how', text: 'Comment nous avons calculé' },
      {
        t: 'ul',
        items: [
          '**La source** est CRICOS, le registre officiel du gouvernement australien : il recense chaque formation accessible avec un visa étudiant, avec son prix pour les étudiants internationaux. Notre base compte 1 540 établissements et environ 19 000 formations avec un prix pour 2026.',
          '**Prix par an.** Le registre indique le prix de toute la formation ; nous le divisons par sa durée en années.',
          '**La médiane** est le prix du milieu : la moitié des formations coûte moins, l’autre moitié plus.',
          '**Frais de scolarité seulement.** Le logement, la nourriture, l’assurance santé étudiante (OSHC) et le visa ne sont pas inclus.',
        ],
      },
      { t: 'h2', id: 'visa-money', text: 'Combien d’argent faut-il pour vivre' },
      { t: 'p', text: 'Pour le visa étudiant (subclass 500), il faut justifier de ressources pour vivre : **29 710 AUD par an** pour un étudiant, selon le ministère de l’Intérieur australien pour 2026. Cette somme s’ajoute aux frais de scolarité et au voyage. Vérifiez les documents et le montant sur le site du ministère avant de déposer la demande.' },
      { t: 'note', text: 'Les montants pour d’autres pays : [combien d’argent justifier pour un visa étudiant](/blog/proof-of-funds-student-visa).' },
      { t: 'h2', id: 'cheaper', text: 'Si c’est trop cher' },
      { t: 'p', text: 'Comparez avec d’autres pays : [combien coûtent les études à l’étranger](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [pays où les études sont gratuites ou presque](/blog/free-tuition-germany-czechia-finland). Des bourses qui couvrent tout : [bourses complètes pour étudiants internationaux](/blog/fully-funded-scholarships-for-international-students).' },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Prix : [CRICOS](https://cricos.education.gov.au/), ministère de l’Éducation du gouvernement australien, données ouvertes sur data.gov.au, téléchargées en octobre 2026. Ressources pour vivre : [Student visa (subclass 500)](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500), ministère de l’Intérieur, vérifié le 8 octobre 2026. Avant de candidater, vérifiez le prix sur la page de la formation.' },
    ],
  },
  'netherlands-tuition-fees-international-students': {
    title: 'Frais de scolarité aux Pays-Bas pour les étudiants internationaux',
    description: 'Ce que coûte une année d’études aux Pays-Bas : les frais légaux pour les citoyens de l’UE, les prix pour les autres par université et le coût du titre de séjour.',
    blocks: [
      { t: 'p', text: 'Une année de master aux Pays-Bas coûte à un étudiant hors UE environ **22 900 €**, une année de licence environ **16 900 €**. Ce sont des prix typiques (médianes) sur 501 programmes pour les années 2026/27 et 2027/28. Les citoyens de l’UE, de l’EEE, de la Suisse et du Suriname paient les frais légaux : **2 694 €** en 2026/27, et la plupart des programmes pour 2027/28 indiquent **2 771 €**.' },
      { t: 'h2', id: 'who-pays', text: 'Qui paie quoi' },
      {
        t: 'ul',
        items: [
          '**Les frais légaux (wettelijk collegegeld)** concernent les citoyens de l’EEE, de la Suisse et du Suriname qui n’ont pas encore le même diplôme d’un établissement public néerlandais. Ils sont identiques dans tous les établissements publics.',
          '**Les frais de l’établissement (instellingscollegegeld)** concernent tous les autres, y compris les étudiants de la CEI, d’Asie et d’Afrique. Chaque établissement fixe les siens, ils varient donc d’un établissement et d’un programme à l’autre.',
          'Certains établissements demandent aussi aux étudiants hors EEE des frais de dossier : entre 75 et 100 €, selon Study in NL.',
        ],
      },
      { t: 'h2', id: 'levels', text: 'Prix pour les étudiants hors UE' },
      {
        t: 'ul',
        items: [
          '**Master :** environ 22 900 € par an. 80 % des programmes coûtent entre 19 600 et 26 000 € (385 programmes).',
          '**Licence :** environ 16 900 € par an. 80 % des programmes coûtent entre 11 800 et 24 500 € (116 programmes).',
          'Un master aux Pays-Bas dure en général un ou deux ans ; une licence trois ans dans une université de recherche et quatre dans une université de sciences appliquées.',
        ],
      },
      { t: 'h2', id: 'universities', text: 'Prix dans les grandes universités' },
      { t: 'p', text: 'Le prix typique d’une année pour un étudiant hors UE :' },
      {
        t: 'ul',
        items: [
          '[Université Radboud](/institutions/nl/radboud-university) : licence environ 15 800 €, master environ 19 600 €',
          '[Université de Leyde](/institutions/nl/leiden-university) : licence environ 14 700 €, master environ 22 900 €',
          '[Université de Twente](/institutions/nl/university-of-twente) : licence environ 16 900 €, master environ 22 300 €',
          '[Université de Groningue](/institutions/nl/university-of-groningen) : master environ 22 800 €',
          '[Université d’Amsterdam](/institutions/nl/university-of-amsterdam) : licence environ 17 600 €, master environ 25 900 €',
        ],
      },
      { t: 'cta', href: '/institutions/nl', text: 'Tous les établissements des Pays-Bas' },
      { t: 'cta', href: '/study/nl', text: 'Étudier aux Pays-Bas : domaines' },
      { t: 'h2', id: 'how', text: 'Comment nous avons calculé' },
      {
        t: 'ul',
        items: [
          '**La source** est Study in NL (Nuffic), le portail officiel sur les études aux Pays-Bas. Notre base compte 39 établissements et 1 481 programmes ; 501 indiquent un prix pour les étudiants hors UE.',
          '**La médiane** est le prix du milieu : la moitié des programmes coûte moins, l’autre moitié plus.',
          '**Frais de scolarité seulement.** Le logement, la nourriture, l’assurance et le titre de séjour ne sont pas inclus.',
        ],
      },
      { t: 'h2', id: 'permit', text: 'Titre de séjour et argent pour vivre' },
      {
        t: 'ul',
        items: [
          '**Les frais de l’IND** pour un titre de séjour pour études sont de 254 € (montant de 2026 ; l’IND le modifie chaque année au 1er janvier). En général, l’établissement dépose la demande pour l’étudiant.',
          '**Argent pour vivre :** l’IND demande de justifier 1 130,77 € par mois (norme de 2026), soit environ 13 600 € par année d’études.',
          '**Travail :** avec un titre de séjour pour études, on peut travailler jusqu’à 16 heures par semaine, ou à temps plein en juin, juillet et août ; l’employeur a généralement besoin d’un permis de travail.',
        ],
      },
      { t: 'note', text: 'On candidate aux établissements néerlandais via Studielink, et beaucoup de programmes ont des dates limites précoces : [dates limites et fonctionnement de Studielink](/blog/netherlands-application-deadlines-studielink). Une bourse pour les étudiants hors EEE : [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'cheaper', text: 'Si c’est trop cher' },
      { t: 'p', text: 'Comparez avec d’autres pays : [combien coûtent les études à l’étranger](/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country), [Allemagne, Tchéquie, Finlande : où les études sont gratuites ou presque](/blog/free-tuition-germany-czechia-finland), [frais de scolarité en Suède](/blog/sweden-tuition-fees-international-students).' },
      { t: 'h2', id: 'sources', text: 'Sources' },
      { t: 'p', text: 'Prix des programmes : Study in NL (Nuffic), années 2026/27 et 2027/28. Les frais légaux et qui les paie : [Study in NL, Tuition fees](https://www.studyinnl.org/finances/tuition-fees). Frais du titre de séjour : [IND, Fees](https://ind.nl/en/fees-costs-of-an-application). Argent pour vivre : [IND, Required amounts](https://ind.nl/en/required-amounts-income-requirements). Vérifié le 18 novembre 2026. Avant de candidater, vérifiez le prix sur la page du programme.' },
    ],
  },
};
