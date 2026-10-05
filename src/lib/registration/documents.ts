// The documents of SPEC.md section 9, step 3.
// The form shows 10 rows. The row "education" ("certificate / diploma") is stored in the database
// under two different codes, because DATA_COLLECTION.md distinguishes them: the person says which.

export const DOC_KEYS = [
  'passport',
  'study_visa',
  'education',
  'transcript',
  'apostille',
  'notarized_translation',
  'recognition',
  'proof_of_funds',
  'health_insurance',
  'parental_consent',
] as const;
export type DocKey = (typeof DOC_KEYS)[number];

export const DOC_STATUSES = ['have', 'in_progress', 'none'] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];

export type EducationKind = 'school_certificate' | 'diploma';

export interface DocEntry {
  status: DocStatus;
  /** study_visa: countries where the visa / residence permit is valid */
  countries?: string[];
  /** education: when the document will be received (if not yet) */
  expectedDate?: string;
  /** education: which document it is */
  eduKind?: EducationKind;
}
export type DocumentsForm = Partial<Record<DocKey, DocEntry>>;

export interface DbDocument {
  doc_type: string;
  status: DocStatus;
  details: Record<string, unknown>;
}

export function defaultDocuments(): DocumentsForm {
  return Object.fromEntries(
    DOC_KEYS.map((k) => [k, { status: 'none' as DocStatus, ...(k === 'education' ? { eduKind: 'school_certificate' as const } : {}) }]),
  );
}

/** Form -> rows for the database / the sign-up metadata. */
export function documentsToDb(docs: DocumentsForm, includeParentalConsent: boolean): DbDocument[] {
  const rows: DbDocument[] = [];
  for (const key of DOC_KEYS) {
    const e = docs[key];
    if (!e) continue;
    if (key === 'parental_consent' && !includeParentalConsent) continue;
    const details: Record<string, unknown> = {};
    if (key === 'study_visa' && e.countries?.length) details.countries = e.countries;
    if (key === 'education' && e.expectedDate && e.status !== 'have') details.expected_date = e.expectedDate;
    const docType = key === 'education' ? (e.eduKind ?? 'school_certificate') : key;
    rows.push({ doc_type: docType, status: e.status, details });
  }
  return rows;
}

/** Rows from the database -> form (the opposite of documentsToDb). */
export function documentsFromDb(rows: readonly DbDocument[]): DocumentsForm {
  const docs = defaultDocuments();
  for (const row of rows) {
    const d = row.details ?? {};
    if (row.doc_type === 'school_certificate' || row.doc_type === 'diploma') {
      docs.education = {
        status: row.status,
        eduKind: row.doc_type,
        expectedDate: typeof d.expected_date === 'string' ? d.expected_date : undefined,
      };
    } else if ((DOC_KEYS as readonly string[]).includes(row.doc_type)) {
      const key = row.doc_type as DocKey;
      docs[key] = {
        status: row.status,
        ...(key === 'study_visa' && Array.isArray(d.countries) ? { countries: d.countries as string[] } : {}),
      };
    }
  }
  return docs;
}
