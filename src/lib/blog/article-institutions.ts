// Institutions an article links to when its country has no deadline calendar to take them from (the calendar block of the article
// page covers Germany, the Netherlands, Finland, Czechia and Sweden by itself). Only institutions that are on YourHEI with programmes;
// the names are the ones the database has (checked 09.11.2026), so the article page asks the database nothing.

export interface ArticleInstitution {
  slug: string;
  names: { en: string; ru?: string };
}

export const ARTICLE_INSTITUTIONS: Record<string, { country: string; items: ArticleInstitution[] }> = {
  'stipendium-hungaricum-how-to-apply': {
    country: 'HU',
    items: [
      { slug: 'corvinus-university-of-budapest', names: { en: 'Corvinus University of Budapest', ru: 'Университет Корвина' } },
      { slug: 'budapest-university-of-technology-and-economics', names: { en: 'Budapest University of Technology and Economics', ru: 'Будапештский университет технологии и экономики' } },
      { slug: 'obuda-university', names: { en: 'Óbuda University', ru: 'Обудский университет' } },
      { slug: 'university-of-szeged', names: { en: 'University of Szeged', ru: 'Сегедский университет' } },
    ],
  },
};
