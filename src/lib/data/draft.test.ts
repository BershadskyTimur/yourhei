import { describe, expect, it } from 'vitest';
import {
  countryDraftToSql,
  institutionDraftToSql,
  institutionReview,
  validateCountryDraft,
  validateInstitutionDraft,
} from './draft';

const draft = () => ({
  schema_version: 1,
  collected_at: '2026-10-05',
  academic_year: '2026/2027',
  institution: {
    external_ids: { wikidata: 'Q1' },
    names: { original: "Ilia's University", en: "Ilia's University" },
    type: 'university',
    country: 'GE',
    city: { en: 'Tbilisi' },
    ownership: 'public',
    founded_year: 2006,
    website: 'https://iliauni.edu.ge',
    description: { en: "Ilia's public university." },
    dormitory: { available: true },
    rankings: [{ name: 'QS', year: 2026, position: '801-1000', source_url: 'https://example.org/qs' }],
    features: ['internship'],
  },
  programs: [
    {
      names: { original: 'Software', en: 'Software engineering' },
      level: 'bachelor', isced_f: '0613', languages: ['en'], duration_years: 4, format: 'on_campus', intakes: ['09'],
      tuition: [{ amount: 3000, currency: 'GEL', period: 'year', applies_to: 'international' }],
      requirements: { documents: ['passport'], min_scores: [{ exam: 'ielts', min: 6 }, { exam: 'toefl', min: null }], min_gpa: null },
      deadlines: [{ intake: '2027-09', applies_to: 'international', date: '2027-07-15' }],
      application_fee: { amount: 50, currency: 'GEL' }, application_url: 'https://iliauni.edu.ge/apply',
    },
  ],
  scholarships: [{ names: { original: 'Grant', en: 'Grant' }, covers: 'partial', eligibility: { en: 'Top students' }, url: null }],
  sources: [
    { field: 'programs[0].tuition[0].amount', url: 'https://iliauni.edu.ge/fees', accessed_at: '2026-10-05', confidence: 'high' },
    { field: 'institution.dormitory', url: 'https://iliauni.edu.ge/dorm', accessed_at: '2026-10-05', confidence: 'medium' },
  ],
  notes_for_reviewer: 'Fees page is dated 2025.',
});

describe('validateInstitutionDraft', () => {
  it('accepts a complete draft', () => {
    const r = validateInstitutionDraft(draft());
    expect(r.ok).toBe(true);
  });

  it('reports what is wrong with a path', () => {
    const d = draft();
    (d.institution as Record<string, unknown>).country = 'Georgia';
    (d.programs[0] as Record<string, unknown>).level = 'diploma';
    const r = validateInstitutionDraft(d);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.join('\n')).toContain('institution.country');
      expect(r.errors.join('\n')).toContain('programs.0.level');
    }
  });

  it('rejects an unknown schema version and a bad currency or month', () => {
    const d = draft();
    (d as Record<string, unknown>).schema_version = 2;
    (d.programs[0].tuition[0] as Record<string, unknown>).currency = 'gel';
    (d.programs[0] as Record<string, unknown>).intakes = ['13'];
    const r = validateInstitutionDraft(d);
    expect(r.ok).toBe(false);
  });

  it('warns about facts without a source', () => {
    const d = draft();
    d.sources = [];
    const r = validateInstitutionDraft(d);
    expect(r.ok && r.warnings).toEqual(['programs[0].tuition[0].amount has no source', 'institution.dormitory has no source']);
  });

  it('allows empty (not found) values', () => {
    const d = draft();
    d.programs[0].tuition = [{ amount: null as unknown as number, currency: 'GEL', period: 'year', applies_to: 'all' }];
    expect(validateInstitutionDraft(d).ok).toBe(true);
  });
});

describe('institutionDraftToSql', () => {
  const sql = (publish: boolean) => {
    const r = validateInstitutionDraft(draft());
    if (!r.ok) throw new Error('draft is invalid');
    return institutionDraftToSql(r.data, 'ilia-state-university', { publish });
  };

  it('finds the institution by country and slug and fails loudly when it is missing', () => {
    expect(sql(false)).toContain("where country = 'GE' and slug = 'ilia-state-university'");
    expect(sql(false)).toContain('raise exception');
  });

  it('creates a missing institution from the card when it has coordinates', () => {
    const d = draft();
    (d.institution as Record<string, unknown>).location = { lat: 41.7, lng: 44.8 };
    const r = validateInstitutionDraft(d);
    if (!r.ok) throw new Error(r.errors.join('\n'));
    const s = institutionDraftToSql(r.data, 'ilia', { publish: true });
    expect(s).toContain('insert into public.institutions');
    expect(s).toContain('ST_MakePoint(44.8, 41.7)');
    expect(s).not.toContain('raise exception');
  });
  it('rejects coordinates that are out of range', () => {
    const d = draft();
    (d.institution as Record<string, unknown>).location = { lat: 141, lng: 44.8 };
    expect(validateInstitutionDraft(d).ok).toBe(false);
  });  it('stores drafts hidden and published rows with a verification date', () => {
    expect(sql(false)).toContain("'draft'");
    expect(sql(false)).not.toContain('now()');
    expect(sql(true)).toContain("'published'");
    expect(sql(true)).toContain('now()');
  });

  it('escapes quotes so a name like Ilia\'s cannot break the SQL', () => {
    expect(sql(false)).toContain("Ilia''s public university.");
  });

  it('drops requirements without a value and marks free programmes', () => {
    const s = sql(false);
    expect(s).toContain('"exam":"ielts","min":6');
    expect(s).not.toContain('toefl');
    const free = validateInstitutionDraft({ ...draft(), programs: [{ ...draft().programs[0], tuition: [{ amount: 0, currency: 'GEL', period: 'year', applies_to: 'all' }] }] });
    if (!free.ok) throw new Error('invalid');
    expect(institutionDraftToSql(free.data, 'x', { publish: false })).toMatch(/, true, '\{/);
  });

  it('replaces the earlier version of the card instead of duplicating it', () => {
    const s = sql(false);
    expect(s).toContain('delete from public.programs where institution_id = v');
    expect(s).toContain('delete from public.sources');
    expect(s).toContain("insert into public.rankings");
    expect(s).toContain("insert into public.scholarships");
  });
});

describe('country drafts and the review report', () => {
  const country = {
    schema_version: 1, collected_at: '2026-10-05', country: 'GE', currency: 'GEL', academic_year_start: '09',
    study_visa: { summary: { en: 'Apply for a student visa.' }, official_url: 'https://evisa.gov.ge' },
    work_during_study: { allowed: true, summary: { en: 'Allowed.' } },
    post_study_work_visa: { available: null, summary: { en: 'Unclear.' } },
    cost_of_living: [{ city: { en: 'Tbilisi' }, amount_per_month: 800, currency: 'GEL' }],
    diploma_recognition: { summary: { en: 'See ENIC.' }, official_url: null },
    application_systems: [{ name: 'Unified exams', url: 'https://naec.ge' }],
    sources: [{ field: 'study_visa', url: 'https://evisa.gov.ge', accessed_at: '2026-10-05', confidence: 'high' }],
    notes_for_reviewer: '',
  };

  it('validates and converts a country draft to an upsert', () => {
    const r = validateCountryDraft(country);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const s = countryDraftToSql(r.data, { publish: true });
      expect(s).toContain('insert into public.country_data');
      expect(s).toContain('on conflict (country) do update');
      expect(s).toContain("'published'");
    }
  });

  it('the review report shows prices, requirements, doubts and the sources', () => {
    const r = validateInstitutionDraft(draft());
    if (!r.ok) throw new Error('invalid');
    const text = institutionReview(r.data, 'ilia-state-university', r.warnings);
    expect(text).toContain('3000 GEL / year (international)');
    expect(text).toContain('ielts ≥ 6');
    expect(text).toContain('institution.dormitory (medium)');
    expect(text).toContain('Fees page is dated 2025.');
  });
});
