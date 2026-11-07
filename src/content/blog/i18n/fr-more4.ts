import type { Translations } from '@/lib/blog/types';

// Machine translation of the article on tuition by country (fr).
export const frMore4: Translations = {
  'how-much-does-it-cost-to-study-abroad-tuition-by-country': {
    title: 'Combien coûtent les études à l’étranger : les frais dans 5 pays',
    description: 'Ce que paient les étudiants internationaux aux États-Unis, en Australie, aux Pays-Bas, en Finlande et en Suède : frais typiques en licence et master, données officielles.',
    blocks: [
      { t: 'p', text: 'La question la plus fréquente d’un candidat est « combien ça coûte ? ». La réponse dépend du pays, de l’université et du programme, mais l’ordre de grandeur est clair. Voici les **frais de scolarité** typiques pour les étudiants internationaux dans cinq pays, calculés à partir des prix publiés dont dispose YourHEI (données d’octobre 2026). Le coût de la vie n’est pas inclus : voir la fin de l’article.' },
      { t: 'h2', id: 'how', text: 'Comment nous avons calculé' },
      {
        t: 'ul',
        items: [
          '**La médiane** est le prix du milieu : la moitié des programmes coûte moins cher, l’autre moitié plus cher. Elle est plus juste que la moyenne, car quelques programmes très chers ne la faussent pas.',
          '**La fourchette** montre où se situent 80 % des prix : les 10 % les moins chers et les 10 % les plus chers sont écartés.',
          '**Prix par an.** Quand une source donne le prix de toute la formation, nous le divisons par sa durée en années.',
          '**Seulement les programmes dont le prix est connu** et s’applique aux étudiants internationaux. Pour les autres, nous n’avons pas de prix et nous n’en inventons pas.',
        ],
      },
      { t: 'h2', id: 'usa', text: 'États-Unis' },
      {
        t: 'ul',
        items: [
          '**Un établissement typique :** environ 17 500 $ par an (médiane sur 3 083 établissements avec un prix publié, community colleges compris).',
          '**Fourchette :** de 6 600 $ à 47 500 $ par an.',
          '**Comment le lire.** Pour les universités publiques, la base contient le prix pour les étudiants d’autres États, que paient généralement aussi les étudiants internationaux. Les universités privées appliquent le même prix à tous. Il s’agit uniquement des frais de scolarité, sans logement, livres ni assurance.',
          'Les programmes de licence sont plus fréquents dans les établissements chers : calculée sur les programmes plutôt que sur les établissements, la médiane est plus élevée, environ 31 000 $.',
        ],
      },
      { t: 'p', text: 'Établissements et programmes aux États-Unis : [Étudier aux États-Unis](/study/us).' },
      { t: 'h2', id: 'australia', text: 'Australie' },
      {
        t: 'ul',
        items: [
          '**Licence :** environ 40 400 dollars australiens par an (fourchette 24 200–57 100), 3 300 programmes.',
          '**Master :** environ 24 000 dollars australiens par an (fourchette 12 000–38 800), 1 570 programmes.',
          'La source est le registre officiel CRICOS, qui indique le coût total de la formation ; nous le divisons par sa durée.',
        ],
      },
      { t: 'p', text: 'Programmes en Australie : [Étudier en Australie](/study/au).' },
      { t: 'h2', id: 'netherlands', text: 'Pays-Bas' },
      {
        t: 'ul',
        items: [
          '**Licence :** environ 16 900 euros par an (fourchette 11 800–24 500), 109 programmes.',
          '**Master :** environ 22 900 euros par an (fourchette 19 600–26 000), 385 programmes.',
          'Le prix pour les étudiants hors EEE est indiqué pour environ un tiers des programmes (494 sur 1 474) : pour les autres, la source ne donne pas de prix pour ces étudiants. Dans ce cas, renseignez-vous auprès de l’université.',
        ],
      },
      { t: 'p', text: 'Programmes aux Pays-Bas : [Étudier aux Pays-Bas](/study/nl) ; comment et quand candidater : [Pays-Bas : Studielink et dates limites](/blog/netherlands-application-deadlines-studielink) ; une bourse : [NL Scholarship](/blog/nl-scholarship-netherlands-how-to-apply).' },
      { t: 'h2', id: 'finland', text: 'Finlande' },
      {
        t: 'ul',
        items: [
          '**Licence :** environ 10 000 euros par an (fourchette 9 500–12 000), 262 programmes.',
          '**Master :** environ 12 000 euros par an (fourchette 10 000–18 000), 589 programmes.',
          'Les études en finnois ou en suédois et le doctorat sont gratuits ([en savoir plus](/blog/free-tuition-germany-czechia-finland)).',
        ],
      },
      { t: 'p', text: 'Programmes en Finlande : [Étudier en Finlande](/study/fi).' },
      { t: 'h2', id: 'sweden', text: 'Suède' },
      {
        t: 'ul',
        items: [
          '**Licence :** environ 150 000 couronnes suédoises par an (fourchette 97 000–290 000), 101 programmes.',
          '**Master :** environ 147 000 couronnes suédoises par an (fourchette 97 000–192 500), 894 programmes.',
          'La source est le portail officiel d’admission suédois universityadmissions.se, qui indique le coût total d’un programme ; nous le divisons par sa durée. Les étudiants de l’UE, de l’EEE et de la Suisse ne paient rien : pour eux, les études sont gratuites.',
        ],
      },
      { t: 'h2', id: 'germany', text: 'Et l’Allemagne et la Tchéquie ?' },
      { t: 'p', text: 'Dans les universités publiques allemandes, les études sont gratuites dans la plupart des cas, et en Tchéquie les programmes en tchèque sont gratuits. Ces règles et leurs exceptions sont expliquées à part : [Les études sont-elles gratuites en Allemagne, en Tchéquie et en Finlande ?](/blog/free-tuition-germany-czechia-finland).' },
      { t: 'h2', id: 'living', text: 'Les frais de scolarité ne sont pas tout' },
      {
        t: 'ul',
        items: [
          'Pour un visa étudiant, vous devez prouver que vous pouvez payer votre vie sur place : les montants pour 14 pays sont dans [Combien d’argent justifier pour un visa étudiant](/blog/proof-of-funds-student-visa).',
          'Les dépenses réelles sont généralement supérieures au minimum exigé pour le visa, surtout dans les grandes villes.',
          'Les frais de scolarité peuvent être réduits grâce à une bourse : [bourses complètes pour étudiants internationaux](/blog/fully-funded-scholarships-for-international-students) et [la base des bourses nationales](/scholarships).',
        ],
      },
      { t: 'note', text: 'Les prix changent chaque année, et les universités ont leurs propres conditions et réductions. Avant de candidater, vérifiez le prix sur la page officielle du programme : chaque page d’établissement sur YourHEI en donne le lien.' },
      { t: 'p', text: 'Dans le [catalogue](/catalog), vous pouvez afficher les prix dans votre devise et filtrer les programmes par pays, niveau et budget.' },
      {
        t: 'p',
        text: 'Sources des données : [US College Scorecard](https://collegescorecard.ed.gov/data/) ; [CRICOS, le registre des formations pour étudiants internationaux en Australie](https://cricos.education.gov.au/) ; [Study in NL](https://www.studyinnl.org/) ; [Studyinfo, Finlande](https://opintopolku.fi/konfo/en/) ; [universityadmissions.se, Suède](https://www.universityadmissions.se/).',
      },
      { t: 'cta', href: '/catalog', text: 'Trouver un programme selon votre budget' },
      { t: 'cta', href: '/scholarships', text: 'Bourses' },
    ],
  },
};
