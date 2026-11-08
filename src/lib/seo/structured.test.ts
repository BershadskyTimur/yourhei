import { describe, expect, it } from 'vitest';
import { aboutPageLd, breadcrumbList, faqPageLd, institutionLd, jsonLdText, organizationId, organizationLd, websiteLd } from './structured';

describe('institution and question-and-answer data', () => {
  it('a university with its place, site and Wikidata item', () => {
    const ld = institutionLd({ type: 'university', name: 'Harvard University', original: 'Harvard University', website: 'https://www.harvard.edu', country: 'US', city: 'Cambridge', foundedYear: 1636, wikidataId: 'Q13371' });
    expect(ld['@type']).toBe('CollegeOrUniversity');
    expect(ld).toMatchObject({ name: 'Harvard University', url: 'https://www.harvard.edu', sameAs: ['https://www.wikidata.org/wiki/Q13371'], foundingDate: '1636' });
    expect(ld).not.toHaveProperty('alternateName');
    expect(ld.address).toEqual({ '@type': 'PostalAddress', addressCountry: 'US', addressLocality: 'Cambridge' });
    expect(ld).not.toHaveProperty('@id');
  });

  it('an institution on its page has an id of that page and the text shown there', () => {
    const ld = institutionLd({ type: 'university', name: 'Harvard University', country: 'US', pagePath: '/en/institutions/us/harvard-university', description: 'A private university.' });
    expect(ld['@id']).toMatch(/\/en\/institutions\/us\/harvard-university#institution$/);
    expect(ld.mainEntityOfPage).toMatch(/\/en\/institutions\/us\/harvard-university$/);
    expect(ld.description).toBe('A private university.');
  });

  it('what is not known is left out; a county is not given as the city; a school is not a university', () => {
    const ld = institutionLd({ type: 'school', name: 'School', original: 'Škola', country: 'CZ', city: 'Middlesex County' });
    expect(ld['@type']).toBe('EducationalOrganization');
    expect(ld).toMatchObject({ alternateName: 'Škola' });
    expect(ld).not.toHaveProperty('url');
    expect(ld).not.toHaveProperty('sameAs');
    expect(ld).not.toHaveProperty('foundingDate');
    expect(ld.address).toEqual({ '@type': 'PostalAddress', addressCountry: 'CZ' });
  });

  it('the question-and-answer data repeats the texts it is given', () => {
    const ld = faqPageLd([{ question: 'How much?', answer: '1 000 € a year.' }]);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity).toEqual([{ '@type': 'Question', name: 'How much?', acceptedAnswer: { '@type': 'Answer', text: '1 000 € a year.' } }]);
  });
});

describe('structured data', () => {
  it('breadcrumbs are numbered from 1 and point to the language version', () => {
    const b = breadcrumbList('ru', [{ name: 'YourHEI', path: '' }, { name: 'Германия', path: '/study/de' }]);
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item.endsWith('/ru/study/de')).toBe(true);
  });
  it('organization and website carry only the brand', () => {
    expect(organizationLd().name).toBe('YourHEI');
    expect(organizationLd()).not.toHaveProperty('email');
    expect(websiteLd('en', 'x').inLanguage).toBe('en');
  });
  it('the organization has a square logo, one id and, when set, the public contact address', () => {
    const o = organizationLd('help@example.org');
    expect(o['@id']).toBe(organizationId());
    expect(o.logo).toMatchObject({ width: 180, height: 180 });
    expect(o.logo.url.endsWith('/apple-icon.png')).toBe(true);
    expect(o).toMatchObject({ email: 'help@example.org', contactPoint: { email: 'help@example.org' } });
  });
  it('the about and contact pages point to the organization', () => {
    const a = aboutPageLd('ContactPage', 'ru', '/contact', 'Контакты', 'Напишите нам.');
    expect(a['@type']).toBe('ContactPage');
    expect(a.url.endsWith('/ru/contact')).toBe(true);
    expect(a.about).toEqual({ '@id': organizationId() });
  });
  it('the script text can not close the tag', () => {
    expect(jsonLdText({ a: '</script><b>' })).not.toContain('<');
  });
});
