import { describe, expect, it } from 'vitest';
import { defaultDocuments, documentsFromDb, documentsToDb } from './documents';

describe('documents mapping', () => {
  it('maps the "education" row to the code the person chose', () => {
    const docs = defaultDocuments();
    docs.education = { status: 'in_progress', eduKind: 'diploma', expectedDate: '2027-06-30' };
    const row = documentsToDb(docs, false).find((r) => r.doc_type === 'diploma');
    expect(row).toEqual({ doc_type: 'diploma', status: 'in_progress', details: { expected_date: '2027-06-30' } });
    expect(documentsToDb(docs, false).some((r) => r.doc_type === 'school_certificate')).toBe(false);
  });

  it('drops the expected date once the document is in hand', () => {
    const docs = defaultDocuments();
    docs.education = { status: 'have', eduKind: 'school_certificate', expectedDate: '2027-06-30' };
    expect(documentsToDb(docs, false).find((r) => r.doc_type === 'school_certificate')!.details).toEqual({});
  });

  it('keeps visa countries', () => {
    const docs = defaultDocuments();
    docs.study_visa = { status: 'have', countries: ['GE', 'DE'] };
    expect(documentsToDb(docs, false).find((r) => r.doc_type === 'study_visa')!.details).toEqual({
      countries: ['GE', 'DE'],
    });
  });

  it('parental consent is only included for minors', () => {
    const docs = defaultDocuments();
    expect(documentsToDb(docs, false).some((r) => r.doc_type === 'parental_consent')).toBe(false);
    expect(documentsToDb(docs, true).some((r) => r.doc_type === 'parental_consent')).toBe(true);
  });

  it('saves 9 rows for an adult (10 form rows, parental consent hidden)', () => {
    expect(documentsToDb(defaultDocuments(), false)).toHaveLength(9);
  });

  it('round-trips through the database format', () => {
    const docs = defaultDocuments();
    docs.passport = { status: 'have' };
    docs.study_visa = { status: 'in_progress', countries: ['KZ'] };
    docs.education = { status: 'in_progress', eduKind: 'diploma', expectedDate: '2027-01-15' };
    const back = documentsFromDb(documentsToDb(docs, true));
    expect(back.passport).toEqual({ status: 'have' });
    expect(back.study_visa).toEqual({ status: 'in_progress', countries: ['KZ'] });
    expect(back.education).toEqual({ status: 'in_progress', eduKind: 'diploma', expectedDate: '2027-01-15' });
  });
});
