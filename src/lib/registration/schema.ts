import { z } from 'zod';
import { isPlausibleBirthDate, parseIsoDate } from '../age';
import { COUNTRY_CODES } from '../countries';
import { INSTITUTION_TYPES } from '../institutions/types';
import { checkPassword } from '../password';
import { DOC_KEYS, defaultDocuments, type DocumentsForm } from './documents';

// Error messages are KEYS of Register.errors.* in the translation files, not texts.
//
// Registration asks only for the age (to apply the minimum age before an account exists,
// SPEC.md section 6) and for the account. Everything else lives in the profile and can be
// filled in and changed at any time, so the profile fields are optional.

const countryCode = z.string().refine((c) => COUNTRY_CODES.has(c), 'required');

const birthDateField = z
  .string()
  .min(1, 'required')
  .refine((v) => isPlausibleBirthDate(v), 'birthInvalid');
const residenceField = z.string().refine((c) => COUNTRY_CODES.has(c), 'residenceRequired');

const searchShape = {
  regions: z.array(z.string()),
  countries: z.array(countryCode),
  types: z.array(z.enum(INSTITUTION_TYPES)),
};

const aboutShape = {
  birthDate: birthDateField,
  gender: z.enum(['male', 'female', 'undisclosed', '']),
  residenceCountry: residenceField,
  citizenships: z.array(countryCode),
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

/** The registration form: age first, then the account. */
export const registrationSchema = z
  .object({
    birthDate: birthDateField,
    residenceCountry: residenceField,
    ageConfirmed: z.boolean().refine((v) => v, 'ageCheckRequired'),
    ...accountShape,
  })
  .superRefine((v, ctx) => {
    // The password rules depend on the e-mail, so they are checked on the whole form.
    for (const problem of checkPassword(v.password, v.email)) {
      ctx.addIssue({ code: 'custom', message: problem, path: ['password'] });
    }
  });

/** The profile form: about you, what you are looking for, documents. */
export const profileSchema = z.object({ ...searchShape, ...aboutShape, ...documentsShape });

/** All fields of both forms: the step components work with this one type. */
export type RegistrationForm = z.infer<typeof profileSchema> & {
  ageConfirmed: boolean;
  email: string;
  password: string;
  consentAccepted: boolean;
  marketingOptIn: boolean;
};
export type ProfileForm = z.infer<typeof profileSchema>;

/** Which fields belong to which registration step (used to validate one step at a time). */
export const STEP_FIELDS = [
  ['birthDate', 'residenceCountry', 'ageConfirmed'],
  ['email', 'password', 'consentAccepted'],
] as const satisfies readonly (readonly (keyof RegistrationForm)[])[];

export function emptyRegistration(): RegistrationForm {
  return {
    regions: [],
    countries: [],
    types: [],
    birthDate: '',
    gender: '',
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

/** The profile form -> columns of the profiles table. */
export function profileValuesToDb(v: ProfileForm) {
  return {
    birth_date: v.birthDate,
    gender: v.gender || null,
    residence_country: v.residenceCountry,
    citizenships: v.citizenships,
    target_regions: v.regions,
    target_countries: v.countries,
    target_types: v.types,
  };
}

/** Data sent to Supabase inside user_metadata.wizard; the database trigger validates it again. */
export function buildSignUpMetadata(v: Pick<RegistrationForm, 'birthDate' | 'residenceCountry' | 'consentAccepted' | 'marketingOptIn'>) {
  return {
    wizard: {
      birth_date: v.birthDate,
      residence_country: v.residenceCountry,
      privacy_accepted: v.consentAccepted,
      terms_accepted: v.consentAccepted,
      marketing_opt_in: v.marketingOptIn,
    },
  };
}
