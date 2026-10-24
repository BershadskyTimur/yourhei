import { describe, expect, it } from 'vitest';
import { breadcrumbList, jsonLdText, organizationLd, websiteLd } from './structured';

describe('structured data', () => {
  it('breadcrumbs are numbered from 1 and point to the language version', () => {
    const b = breadcrumbList('ru', [{ name: 'YourHEI', path: '' }, { name: 'Германия', path: '/study/de' }]);
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item.endsWith('/ru/study/de')).toBe(true);
  });
  it('organization and website carry only the brand', () => {
    expect(organizationLd().name).toBe('YourHEI');
    expect(websiteLd('en', 'x').inLanguage).toBe('en');
  });
  it('the script text can not close the tag', () => {
    expect(jsonLdText({ a: '</script><b>' })).not.toContain('<');
  });
});
