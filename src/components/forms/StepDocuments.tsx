'use client';

import { useTranslations } from 'next-intl';
import type { UseFormReturn } from 'react-hook-form';
import { calcAge } from '@/lib/age';
import { DOC_KEYS, DOC_STATUSES, defaultDocuments, type DocEntry, type DocKey } from '@/lib/registration/documents';
import type { RegistrationForm } from '@/lib/registration/schema';
import { CountryMultiSelect } from './CountryMultiSelect';
import { ErrorText, inputClass } from './ui';

/** Step 3: a status for every document: have / in progress / do not have. */
export function StepDocuments({ form }: { form: UseFormReturn<RegistrationForm> }) {
  const t = useTranslations('Register.documents');
  const { watch, setValue, formState } = form;
  const docs = watch('documents') ?? defaultDocuments();
  const birthDate = watch('birthDate');

  // The parental-consent row is only for people under 18 (SPEC.md section 9).
  const age = calcAge(birthDate);
  const keys = DOC_KEYS.filter((k) => k !== 'parental_consent' || (age !== null && age < 18));

  const update = (key: DocKey, patch: Partial<DocEntry>) =>
    setValue('documents', { ...docs, [key]: { ...(docs[key] ?? { status: 'none' }), ...patch } }, { shouldDirty: true });

  const dateErrors = formState.errors.documents as Record<string, { expectedDate?: { message?: string } }> | undefined;

  return (
    <div className="space-y-6">
      <p className="text-muted">{t('intro')}</p>
      <p className="text-sm text-muted">{t('why')}</p>

      {keys.map((key) => {
        const entry = docs[key] ?? { status: 'none' as const };
        return (
          <fieldset key={key} className="rounded-2xl border border-line bg-surface p-4">
            <legend className="px-1 font-semibold text-text">{t(`items.${key}`)}</legend>

            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {DOC_STATUSES.map((s) => (
                <label key={s} className="inline-flex min-h-10 items-center gap-2">
                  <input
                    type="radio"
                    name={`doc-${key}`}
                    checked={entry.status === s}
                    onChange={() => update(key, { status: s })}
                    className="h-5 w-5 accent-accent"
                  />
                  {t(`status.${s}`)}
                </label>
              ))}
            </div>

            {key === 'study_visa' && entry.status !== 'none' && (
              <div className="mt-3">
                <p className="mb-1 text-sm font-medium">{t('visaCountries')}</p>
                <CountryMultiSelect
                  inputId="visa-countries"
                  value={entry.countries ?? []}
                  onChange={(countries) => update(key, { countries })}
                />
              </div>
            )}

            {key === 'education' && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="edu-kind" className="mb-1 block text-sm font-medium">
                    {t('eduKind')}
                  </label>
                  <select
                    id="edu-kind"
                    value={entry.eduKind ?? 'school_certificate'}
                    onChange={(e) => update(key, { eduKind: e.target.value as DocEntry['eduKind'] })}
                    className={inputClass}
                  >
                    <option value="school_certificate">{t('eduSchool')}</option>
                    <option value="diploma">{t('eduDiploma')}</option>
                  </select>
                </div>
                {entry.status !== 'have' && (
                  <div>
                    <label htmlFor="edu-date" className="mb-1 block text-sm font-medium">
                      {t('expectedDate')}
                    </label>
                    <input
                      id="edu-date"
                      type="date"
                      value={entry.expectedDate ?? ''}
                      onChange={(e) => update(key, { expectedDate: e.target.value })}
                      className={inputClass}
                    />
                    <ErrorText code={dateErrors?.[key]?.expectedDate?.message} />
                  </div>
                )}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
