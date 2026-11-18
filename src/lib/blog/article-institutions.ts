// Institutions an article links to when its country has no deadline calendar to take them from (the calendar block of the article
// page covers Germany, the Netherlands, Finland, Czechia and Sweden by itself). Only institutions that are on YourHEI with programmes;
// the names are the ones the database has (checked 09.11.2026), so the article page asks the database nothing.

export interface ArticleInstitution {
  slug: string;
  names: { en: string; ru?: string };
}

export const ARTICLE_INSTITUTIONS: Record<string, { country: string; items: ArticleInstitution[] }> = {
  // The United States has no country guide, so the Common App article lists the seven colleges its text is about (the pages are the ones the
  // article on Harvard and the Ivy League links to, checked on the live site 13.11.2026)
  'common-app-how-to-apply-us-universities': {
    country: 'US',
    items: [
      { slug: 'harvard-university', names: { en: 'Harvard University', ru: 'Гарвардский университет' } },
      { slug: 'yale-university', names: { en: 'Yale University', ru: 'Йельский университет' } },
      { slug: 'princeton-university', names: { en: 'Princeton University', ru: 'Принстонский университет' } },
      { slug: 'brown-university', names: { en: 'Brown University', ru: 'Брауновский университет' } },
      { slug: 'cornell-university', names: { en: 'Cornell University', ru: 'Корнеллский университет' } },
      { slug: 'university-of-pennsylvania', names: { en: 'University of Pennsylvania', ru: 'Пенсильванский университет' } },
      { slug: 'dartmouth-college', names: { en: 'Dartmouth College', ru: 'Дартмутский колледж' } },
    ],
  },
  // Sweden has no country guide and no deadline block in the article page, so the article lists the institutions its text links to
  // (the names of the pages are the ones of the article on Swedish tuition, checked on the live site 13.11.2026)
  'sweden-how-to-apply-universityadmissions': {
    country: 'SE',
    items: [
      { slug: 'lund-university', names: { en: 'Lund University', ru: 'Лундский университет' } },
      { slug: 'uppsala-university', names: { en: 'Uppsala University', ru: 'Уппсальский университет' } },
      { slug: 'stockholm-university', names: { en: 'Stockholm University', ru: 'Стокгольмский университет' } },
      { slug: 'university-of-gothenburg', names: { en: 'University of Gothenburg', ru: 'Гётеборгский университет' } },
      { slug: 'royal-institute-of-technology', names: { en: 'KTH Royal Institute of Technology', ru: 'Королевский технологический институт (KTH)' } },
      { slug: 'chalmers-university-of-technology', names: { en: 'Chalmers University of Technology', ru: 'Чалмерский технологический институт' } },
    ],
  },
  'stipendium-hungaricum-how-to-apply': {
    country: 'HU',
    items: [
      { slug: 'corvinus-university-of-budapest', names: { en: 'Corvinus University of Budapest', ru: 'Университет Корвина' } },
      { slug: 'budapest-university-of-technology-and-economics', names: { en: 'Budapest University of Technology and Economics', ru: 'Будапештский университет технологии и экономики' } },
      { slug: 'obuda-university', names: { en: 'Óbuda University', ru: 'Обудский университет' } },
      { slug: 'university-of-szeged', names: { en: 'University of Szeged', ru: 'Сегедский университет' } },
    ],
  },
  // Poland has no deadline calendar; the two Polish institutions with a world ranking (data/generated/ranked-institutions.json,
  // checked 17.11.2026)
  'poland-recognition-of-certificate-and-diploma-nawa': {
    country: 'PL',
    items: [
      { slug: 'jagiellonian-university', names: { en: 'Jagiellonian University', ru: 'Ягеллонский университет' } },
      { slug: 'warsaw-university-of-technology', names: { en: 'Warsaw University of Technology', ru: 'Варшавский политехнический университет' } },
    ],
  },
};
