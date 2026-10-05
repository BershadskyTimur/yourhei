'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Link } from '@/i18n/navigation';
import type { RegistrationForm } from '@/lib/registration/schema';
import { ErrorText, Field, inputClass } from './ui';

/** The password field with a show / hide button. */
export function PasswordInput({
  id,
  hint,
  autoComplete,
  describedBy,
  registerProps,
}: {
  id: string;
  hint?: string;
  autoComplete: 'new-password' | 'current-password';
  describedBy?: string;
  registerProps: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> };
}) {
  const t = useTranslations('Register.account');
  const [shown, setShown] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          className={inputClass}
          {...registerProps}
        />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          className="h-11 shrink-0 rounded-xl border border-line-strong bg-bg px-3 text-sm text-text hover:bg-surface-strong"
        >
          {shown ? t('hide') : t('show')}
        </button>
      </div>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

/** Step 4: e-mail, password and the consents. */
export function StepAccount({ form }: { form: UseFormReturn<RegistrationForm> }) {
  const t = useTranslations('Register.account');
  const { register, formState } = form;
  const errors = formState.errors;

  // With criteriaMode "all" every password problem is reported, not only the first one.
  const passwordIssues = errors.password
    ? [
        ...new Set(
          [errors.password.message, ...Object.values(errors.password.types ?? {}).flat()].filter(
            (x): x is string => typeof x === 'string',
          ),
        ),
      ]
    : [];

  return (
    <div className="space-y-6">
      <Field label={t('email')} why={t('emailWhy')} error={errors.email?.message} htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-describedby="email-error"
          className={inputClass}
          {...register('email')}
        />
      </Field>

      <div>
        <label htmlFor="password" className="block font-semibold text-text">
          {t('password')}
        </label>
        <div className="mt-2">
          <PasswordInput
            id="password"
            hint={t('passwordHint')}
            autoComplete="new-password"
            describedBy="password-error"
            registerProps={register('password')}
          />
        </div>
        <div id="password-error">
          {passwordIssues.map((code) => (
            <ErrorText key={code} code={code} />
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-accent" {...register('consentAccepted')} />
          <span>
            {t.rich('consent', {
              privacy: (chunks) => (
                <Link href="/privacy" target="_blank" className="font-medium text-accent-text underline underline-offset-4">
                  {chunks}
                </Link>
              ),
              terms: (chunks) => (
                <Link href="/terms" target="_blank" className="font-medium text-accent-text underline underline-offset-4">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        <ErrorText code={errors.consentAccepted?.message} />
      </div>

      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-accent" {...register('marketingOptIn')} />
        <span>{t('marketing')}</span>
      </label>
    </div>
  );
}
