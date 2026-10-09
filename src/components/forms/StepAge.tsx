'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { minAgeFor } from '@/lib/age';
import { sortedCountryNames } from '@/lib/countries';
import type { RegistrationForm } from '@/lib/registration/schema';
import { DateSelect } from './DateSelect';
import { ErrorText, Field, inputClass } from './ui';

/** Registration step 1: only what is needed to apply the minimum age before the account exists. */
export function StepAge({ form }: { form: UseFormReturn<RegistrationForm> }) {
  const t = useTranslations('Register.about');
  const locale = useLocale();
  const { register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const residence = watch('residenceCountry');
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
