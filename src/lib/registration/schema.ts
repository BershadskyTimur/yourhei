import { z } from 'zod';
import { calcAge, isPlausibleBirthDate, parseIsoDate } from '../age';
import { COUNTRY_CODES } from '../countries';
import { INSTITUTION_TYPES } from '../institutions/types';
import { checkPassword } from '../password';
import { DOC_KEYS, defaultDocuments, documentsToDb, type DocumentsForm } from './documents';

// Error messages are KEYS of Register.errors.* in the translation files, not texts.

const countryCode = z.string().refine((c) => COUNTRY_CODES.has(c), 'required');

const searchShape = {
  regions: z.array(z.string()).min(1, 'regionsMin'),
  countries: z.array(countryCode).min(1, 'countriesMin'),
  types: z.array(z.enum(INSTITUTION_TYPES)).min(1, 'typesMin'),
};

const aboutShape = {
  birthDate: z
    .string()
    .min(1, 'required')
    .refine((v) => isPlausibleBirthDate(v), 'birthInvalid'),
  gender: z.enum(['male', 'female', 'undisclosed'], 'genderRequired'),
  residenceCountry: z.string().refine((c) => COUNTRY_CODES.has(c), 'residenceRequired'),
  citizenships: z.array(countryCode).min(1, 'citizenshipRequired'),
  ageConfirmed: z.boolean().refine((v) => v, 'ageCheckRequired'),
};

const documentsShape = {
  documents: z.custom<DocumentsForm>().superRefine((docs, ctx) => {
    for (const key of DOC_KEYS) {
      const date = docs[key]?.expectedDate;
      if (date && !parseIsoDate(date)) {
        ctx.addIssue({ code: 'custom', message: 'dateInvalid', path: [key, 'expectedDate'] });
      }
    }
  }),
};

const accountShape = {
  email: z.email('emailInvalid'),
  password: z.string().min(1, 'required'),
  // One check box covers both the privacy policy and the terms of use.
  consentAccepted: z.boolean().refine((v) => v, 'consentRequired'),
  marketingOptIn: z.boolean(),
};

export const registrationSchema = z
  .object({ ...searchShape, ...aboutShape, ...documentsShape, ...accountShape })
  .superRefine((v, ctx) => {
    // The password rules depend on the e-mail, so they are checked on the whole form.
    for (const problem of checkPassword(v.password, v.email)) {
      ctx.addIssue({ code: 'custom', message: problem, path: ['password'] });
    }
  });

/** The same form without the account step: used when editing a profile. */
export const profileSchema = z.object({ ...searchShape, ...aboutShape, ...documentsShape });

export type RegistrationForm = z.infer<typeof registrationSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;

/** Which fields belong to which step (used to validate one step at a time). */
export const STEP_FIELDS = [
  ['regions', 'countries', 'types'],
  ['birthDate', 'gender', 'residenceCountry', 'citizenships', 'ageConfirmed'],
  ['documents'],
  ['email', 'password', 'consentAccepted'],
] as const satisfies readonly (readonly (keyof RegistrationForm)[])[];

export function emptyRegistration(): RegistrationForm {
  return {
    regions: [],
    countries: [],
    types: [],
    birthDate: '',
    gender: '' as RegistrationForm['gender'],
    residenceCountry: '',
    citizenships: [],
    ageConfirmed: false,
    documents: defaultDocuments(),
    email: '',
    password: '',
    consentAccepted: false,
    marketingOptIn: false,
  };
}

/** The part of the form that is the same in registration and in the profile editor. */
export function profileValuesToDb(v: ProfileForm) {
  return {
    birth_date: v.birthDate,
    gender: v.gender,
    residence_country: v.residenceCountry,
    citizenships: v.citizenships,
    target_regions: v.regions,
    target_countries: v.countries,
    target_types: v.types,
  };
}

/** Data sent to Supabase inside user_metadata.wizard; the database trigger validates it again. */
export function buildSignUpMetadata(v: RegistrationForm, today: Date = new Date()) {
  const minor = (calcAge(v.birthDate, today) ?? 99) < 18;
  return {
    wizard: {
      ...profileValuesToDb(v),
      documents: Object.fromEntries(
        documentsToDb(v.documents, minor).map((d) => [d.doc_type, { status: d.status, details: d.details }]),
      ),
      privacy_accepted: v.consentAccepted,
      terms_accepted: v.consentAccepted,
      marketing_opt_in: v.marketingOptIn,
    },
  };
}
