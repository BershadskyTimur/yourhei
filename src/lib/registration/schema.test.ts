import { describe, expect, it } from 'vitest';
import {
  buildSignUpMetadata,
  emptyRegistration,
  profileSchema,
  profileValuesToDb,
  registrationSchema,
  type RegistrationForm,
} from './schema';

const valid = (): RegistrationForm => ({
  ...emptyRegistration(),
  birthDate: '2007-03-15',
  residenceCountry: 'GE',
  ageConfirmed: true,
  email: 'student@example.com',
  password: 'Maple-tree-4-ever',
  consentAccepted: true,
});

const messages = (schema: typeof registrationSchema | typeof profileSchema, v: RegistrationForm) => {
  const r = schema.safeParse(v);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}:${i.message}`);
};

describe('registrationSchema (age + account only)', () => {
  it('accepts age and account without any profile data', () => {
    expect(messages(registrationSchema, valid())).toEqual([]);
  });

  it('requires the age box and the consent', () => {
    const v = { ...valid(), ageConfirmed: false, consentAccepted: false };
    expect(messages(registrationSchema, v)).toEqual(
      expect.arrayContaining(['ageConfirmed:ageCheckRequired', 'consentAccepted:consentRequired']),
    );
  });

  it('rejects impossible and future birth dates', () => {
    expect(messages(registrationSchema, { ...valid(), birthDate: '2008-02-30' })).toContain('birthDate:birthInvalid');
    expect(messages(registrationSchema, { ...valid(), birthDate: '2999-01-01' })).toContain('birthDate:birthInvalid');
  });

  it('rejects an invalid e-mail and a weak password', () => {
    const m = messages(registrationSchema, { ...valid(), email: 'nope', password: 'abc' });
    expect(m).toContain('email:emailInvalid');
    expect(m).toContain('password:passwordTooShort');
  });

  it('rejects an unknown country code', () => {
    expect(messages(registrationSchema, { ...valid(), residenceCountry: 'XK' })).toContain(
      'residenceCountry:residenceRequired',
    );
  });
});

describe('profileSchema (everything optional except age data)', () => {
  it('can be saved with no search choices, no gender and no citizenship', () => {
    expect(messages(profileSchema, valid())).toEqual([]);
  });
  it('still needs a real birth date and country', () => {
    expect(messages(profileSchema, { ...valid(), birthDate: '', residenceCountry: '' })).toEqual(
      expect.arrayContaining(['birthDate:required', 'residenceCountry:residenceRequired']),
    );
  });
  it('turns an empty gender into null for the database', () => {
    expect(profileValuesToDb(valid()).gender).toBeNull();
    expect(profileValuesToDb({ ...valid(), gender: 'female' }).gender).toBe('female');
  });
});

describe('buildSignUpMetadata', () => {
  it('sends only the age data and the consents, never the password', () => {
    const meta = buildSignUpMetadata(valid());
    expect(meta.wizard).toEqual({
      birth_date: '2007-03-15',
      residence_country: 'GE',
      privacy_accepted: true,
      terms_accepted: true,
      marketing_opt_in: false,
    });
    expect(JSON.stringify(meta)).not.toContain('Maple');
  });
});
