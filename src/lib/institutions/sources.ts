// The data sources behind the programmes (the key is saved in each programme as requirements.source by
// scripts/load-programs.mjs). Used for the source line on a programme card and for the "Data sources" page.
export interface DataSource {
  name: string;
  url: string;
  /** countries whose programmes come from this source */
  countries: string[];
}

export const SOURCES: Record<string, DataSource> = {
  cricos: { name: 'CRICOS, Australian Government', url: 'https://cricos.education.gov.au/', countries: ['AU'] },
  scorecard: { name: 'College Scorecard, U.S. Department of Education', url: 'https://collegescorecard.ed.gov/', countries: ['US'] },
  studyin_cz: { name: 'Study in Czechia, Ministry of Education of the Czech Republic', url: 'https://studyin.gov.cz/', countries: ['CZ'] },
  opintopolku: { name: 'Studyinfo (Opintopolku), Finnish National Agency for Education', url: 'https://opintopolku.fi/', countries: ['FI'] },
  studyinnl: { name: 'Study in NL, Nuffic', url: 'https://www.studyinnl.org/', countries: ['NL'] },
  daad: { name: 'DAAD, International Programmes in Germany', url: 'https://www2.daad.de/deutschland/studienangebote/international-programmes/en/', countries: ['DE'] },
  discoveruni: { name: 'Discover Uni, HESA (CC BY 4.0)', url: 'https://discoveruni.gov.uk/', countries: ['GB'] },
  tr_university_sites: { name: "The universities' own websites", url: '', countries: ['TR'] },
  official_university_sites_region: { name: "The universities' own websites", url: '', countries: ['KZ', 'AM', 'KG', 'UZ'] },
  institution: { name: 'The institution itself', url: '', countries: [] },
};

/** The source of a programme by its key, or null when unknown. */
export function sourceOf(key: string | null): DataSource | null {
  return key && key in SOURCES ? SOURCES[key] : null;
}
