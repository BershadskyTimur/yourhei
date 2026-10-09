'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { sortedCountryNames } from '@/lib/countries';
import type { RegistrationForm } from '@/lib/registration/schema';
import { CountryMultiSelect } from './CountryMultiSelect';
import { DateSelect } from './DateSelect';
import { Field, Group, inputClass } from './ui';

const GENDERS = ['male', 'female', 'undisclosed'] as const;

/** Profile: date of birth, country of residence, gender (optional) and citizenships. */
export function StepAbout({ form }: { form: UseFormReturn<RegistrationForm> }) {
  const t = useTranslations('Register.about');
  const locale = useLocale();
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;

  const citizenships = watch('citizenships');
  const countries = useMemo(() => sortedCountryNames(locale), [locale]);

  return (
    <div className="space-y-8">
      <Field label={t('birthDate')} why={t('birthDateWhy')} error={errors.birthDate?.message} htmlFor="birthDate">
        <DateSelect
          id="birthDate"
          value={watch('birthDate')}
          onChange={(iso) => setValue('birthDate', iso, { shouldValidate: formState.isSubmitted })}
          yearFrom={1900}
          yearTo={new Date().getFullYear()}
          autoComplete="bday"
          describedBy="birthDate-error"
        />
      </Field>

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

      <Field label={t('citizenship')} why={t('citizenshipWhy')} error={errors.citizenships?.message} htmlFor="citizenships">
        <CountryMultiSelect
          inputId="citizenships"
          value={citizenships}
          onChange={(next) => setValue('citizenships', next, { shouldDirty: true })}
        />
      </Field>
    </div>
  );
}
