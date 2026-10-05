'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { TypeDot } from '@/components/TypeDot';
import { REGIONS, countriesOfRegions, groupBySubregion } from '@/lib/countries';
import { INSTITUTION_TYPES, type InstitutionType } from '@/lib/institutions/types';
import type { RegistrationForm } from '@/lib/registration/schema';
import { Chip, Group } from './ui';

const toggle = <T,>(list: readonly T[], item: T): T[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

/** Step 1: regions -> countries (all preselected) and institution types. */
export function StepSearch({ form }: { form: UseFormReturn<RegistrationForm> }) {
  const t = useTranslations('Register.search');
  const tTypes = useTranslations('Types');
  const tSub = useTranslations('Subregions');
  const locale = useLocale();
  const { watch, setValue, formState } = form;
  const errors = formState.errors;

  const regions = watch('regions');
  const countries = watch('countries');
  const types = watch('types');

  const countryName = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    return (code: string) => names.of(code) ?? code;
  }, [locale]);
  const groups = useMemo(() => groupBySubregion(countriesOfRegions(regions)), [regions]);

  // After a first failed attempt the field is re-checked on every change.
  const set = (name: 'regions' | 'countries', value: string[]) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: formState.isSubmitted || !!errors[name] });
  const setTypes = (value: InstitutionType[]) =>
    setValue('types', value, { shouldDirty: true, shouldValidate: formState.isSubmitted || !!errors.types });

  const toggleRegion = (id: string) => {
    const next = toggle(regions, id);
    // Choosing a region selects all its countries; unchoosing removes the ones no other region has.
    const available = new Set(countriesOfRegions(next));
    const nextCountries = regions.includes(id)
      ? countries.filter((c) => available.has(c))
      : [...new Set([...countries, ...(REGIONS.find((r) => r.id === id)?.countries ?? [])])];
    set('regions', next);
    set('countries', nextCountries);
  };

  return (
    <div className="space-y-8">
      <Group legend={t('regionsTitle')} why={t('regionsHint')} error={errors.regions?.message}>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <Chip key={r.id} pressed={regions.includes(r.id)} onClick={() => toggleRegion(r.id)}>
              {t(`regions.${r.id}` as 'regions.europe')}
            </Chip>
          ))}
        </div>
      </Group>

      <Group legend={t('countriesTitle')} why={t('countriesHint')} error={errors.countries?.message}>
        {groups.length === 0 ? (
          <p className="text-muted">{t('pickRegion')}</p>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => {
              const allOn = g.countries.every((c) => countries.includes(c));
              return (
                <div key={g.subregion} role="group" aria-label={t('groupLabel', { group: tSub(g.subregion as 'central-asia') })}>
                  <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h3 className="font-semibold text-brand">{tSub(g.subregion as 'central-asia')}</h3>
                    <button
                      type="button"
                      className="text-sm font-medium text-accent-text underline underline-offset-4"
                      onClick={() =>
                        set(
                          'countries',
                          allOn
                            ? countries.filter((c) => !g.countries.includes(c))
                            : [...new Set([...countries, ...g.countries])],
                        )
                      }
                    >
                      {allOn ? t('clearAll') : t('selectAll')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.countries
                      .map((code) => ({ code, name: countryName(code) }))
                      .sort((a, b) => a.name.localeCompare(b.name, locale))
                      .map((c) => (
                        <Chip
                          key={c.code}
                          pressed={countries.includes(c.code)}
                          onClick={() => set('countries', toggle(countries, c.code))}
                        >
                          {c.name}
                        </Chip>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Group>

      <Group legend={t('typesTitle')} why={t('typesHint')} error={errors.types?.message}>
        <div className="flex flex-wrap gap-2">
          {INSTITUTION_TYPES.map((type: InstitutionType) => {
            const on = types.includes(type);
            return (
              <button
                key={type}
                type="button"
                aria-pressed={on}
                onClick={() => setTypes(toggle(types, type))}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                  on ? 'border-line-strong bg-accent-soft text-text' : 'border-dashed border-line-strong bg-bg text-muted'
                }`}
              >
                <TypeDot type={type} size={24} />
                {tTypes(type)}
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}
