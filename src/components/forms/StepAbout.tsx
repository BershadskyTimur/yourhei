'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { minAgeFor } from '@/lib/age';
import { sortedCountryNames } from '@/lib/countries';
import type { RegistrationForm } from '@/lib/registration/schema';
import { CountryMultiSelect } from './CountryMultiSelect';
import { ErrorText, Field, Group, inputClass } from './ui';

const GENDERS = ['male', 'female', 'undisclosed'] as const;

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Step 2: date of birth, gender, residence, citizenships and the age check box. */
export function StepAbout({ form }: { form: UseFormReturn<RegistrationForm> }) {
  const t = useTranslations('Register.about');
  const locale = useLocale();
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;

  const residence = watch('residenceCountry');
  const citizenships = watch('citizenships');
  const countries = useMemo(() => sortedCountryNames(locale), [locale]);
  const revalidate = formState.isSubmitted;

  return (
    <div className="space-y-8">
      <Field label={t('birthDate')} why={t('birthDateWhy')} error={errors.birthDate?.message} htmlFor="birthDate">
        <input
          id="birthDate"
          type="date"
          max={todayIso()}
          min="1900-01-01"
          autoComplete="bday"
          aria-describedby="birthDate-error"
          className={inputClass}
          {...register('birthDate')}
        />
      </Field>

      <Group legend={t('gender')} why={t('genderWhy')} error={errors.gender?.message}>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {GENDERS.map((g) => (
            <label key={g} className="inline-flex min-h-10 items-center gap-2">
              <input type="radio" value={g} className="h-5 w-5 accent-accent" {...register('gender')} />
              {t(g)}
            </label>
          ))}
        </div>
      </Group>

      <Field
        label={t('residence')}
        why={t('residenceWhy')}
        error={errors.residenceCountry?.message}
        htmlFor="residenceCountry"
      >
        <select
          id="residenceCountry"
          autoComplete="country"
          aria-describedby="residenceCountry-error"
          className={inputClass}
          {...register('residenceCountry')}
        >
          <option value="">{t('residencePlaceholder')}</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t('citizenship')} why={t('citizenshipWhy')} error={errors.citizenships?.message} htmlFor="citizenships">
        <CountryMultiSelect
          inputId="citizenships"
          value={citizenships}
          onChange={(next) =>
            setValue('citizenships', next, { shouldDirty: true, shouldValidate: revalidate || !!errors.citizenships })
          }
        />
      </Field>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-accent" {...register('ageConfirmed')} />
          <span>
            <span className="font-semibold">{t('ageCheck', { age: minAgeFor(residence || '') })}</span>
            <span className="block text-sm text-muted">{t('ageCheckWhy')}</span>
          </span>
        </label>
        <ErrorText code={errors.ageConfirmed?.message} />
      </div>
    </div>
  );
}
