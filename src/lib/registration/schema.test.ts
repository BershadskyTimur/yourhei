import { describe, expect, it } from 'vitest';
import { buildSignUpMetadata, emptyRegistration, registrationSchema, type RegistrationForm } from './schema';

const valid = (): RegistrationForm => ({
  ...emptyRegistration(),
  regions: ['caucasus-ca-ee'],
  countries: ['GE', 'KZ'],
  types: ['university'],
  birthDate: '2007-03-15',
  gender: 'undisclosed',
  residenceCountry: 'GE',
  citizenships: ['GE'],
  ageConfirmed: true,
  email: 'student@example.com',
  password: 'Maple-tree-4-ever',
  consentAccepted: true,
});

const messages = (v: RegistrationForm) => {
  const r = registrationSchema.safeParse(v);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}:${i.message}`);
};

describe('registrationSchema', () => {
  it('accepts a complete form', () => {
    expect(messages(valid())).toEqual([]);
  });

  it('reports empty search choices with translation keys', () => {
    const v = { ...valid(), regions: [], countries: [], types: [] };
    expect(messages(v)).toEqual(
      expect.arrayContaining(['regions:regionsMin', 'countries:countriesMin', 'types:typesMin']),
    );
  });

  it('requires the age box, the consents and a gender choice', () => {
    const v = { ...valid(), ageConfirmed: false, consentAccepted: false, gender: '' as never };
    expect(messages(v)).toEqual(
      expect.arrayContaining([
        'ageConfirmed:ageCheckRequired',
        'consentAccepted:consentRequired',
        'gender:genderRequired',
      ]),
    );
  });

  it('rejects impossible and future birth dates', () => {
    expect(messages({ ...valid(), birthDate: '2008-02-30' })).toContain('birthDate:birthInvalid');
    expect(messages({ ...valid(), birthDate: '2999-01-01' })).toContain('birthDate:birthInvalid');
  });

  it('rejects an invalid e-mail and a weak password', () => {
    const m = messages({ ...valid(), email: 'nope', password: 'abc' });
    expect(m).toContain('email:emailInvalid');
    expect(m).toContain('password:passwordTooShort');
  });

  it('rejects an unknown country code', () => {
    expect(messages({ ...valid(), residenceCountry: 'XK' })).toContain('residenceCountry:residenceRequired');
  });
});

describe('buildSignUpMetadata', () => {
  it('sends profile data, documents and consents, but never the password', () => {
    const meta = buildSignUpMetadata(valid(), new Date(2026, 9, 5));
    expect(meta.wizard.residence_country).toBe('GE');
    expect(meta.wizard.target_countries).toEqual(['GE', 'KZ']);
    expect(meta.wizard.privacy_accepted).toBe(true);
    expect(JSON.stringify(meta)).not.toContain('Maple');
  });

  it('includes the parental-consent document only for minors', () => {
    const adult = buildSignUpMetadata({ ...valid(), birthDate: '2000-01-01' }, new Date(2026, 9, 5));
    const minor = buildSignUpMetadata({ ...valid(), birthDate: '2010-10-05' }, new Date(2026, 9, 5));
    expect('parental_consent' in adult.wizard.documents).toBe(false);
    expect('parental_consent' in minor.wizard.documents).toBe(true);
  });
});
