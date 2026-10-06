'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useForm, type FieldPath, type Resolver } from 'react-hook-form';
import { Link, useRouter } from '@/i18n/navigation';
import { isOldEnough, minAgeFor } from '@/lib/age';
import {
  STEP_FIELDS,
  buildSignUpMetadata,
  emptyRegistration,
  registrationSchema,
  type RegistrationForm,
} from '@/lib/registration/schema';
import { clearDraft, loadDraft, saveDraft } from '@/lib/registration/storage';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';
import { StepAccount } from './forms/StepAccount';
import { StepAge } from './forms/StepAge';
import { Turnstile, captchaEnabled } from './Turnstile';
import { primaryButton, secondaryButton } from './forms/ui';

const STEP_KEYS = ['age', 'account'] as const;
const LAST = STEP_KEYS.length - 1;

const subscribeNothing = () => () => {};

/**
 * The saved draft lives in the browser, so the form is created only after the page has loaded
 * there; that way the first render never differs from the server's and nothing flickers.
 */
export function RegisterWizard() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  if (!hydrated) return null;
  return <Wizard draft={loadDraft()} />;
}

function Wizard({ draft }: { draft: ReturnType<typeof loadDraft> }) {
  const t = useTranslations('Register');
  const tErr = useTranslations('Register.errors');
  const tCaptcha = useTranslations('Login.errors');
  const locale = useLocale();
  const router = useRouter();

  const form = useForm<RegistrationForm>({
    // The registration schema checks only age + account; the form type also has the profile fields.
    resolver: zodResolver(registrationSchema) as unknown as Resolver<RegistrationForm>,
    defaultValues: draft?.values ?? emptyRegistration(),
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const [step, setStep] = useState(draft ? Math.min(Math.max(draft.step, 0), LAST) : 0);
  const [underageMin, setUnderageMin] = useState<number | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendNote, setResendNote] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const configured = isSupabaseConfigured();

  // Keep saving while the person types (never the password). Once the sign-up is finished, or the
  // person was turned away for their age, nothing may stay in the browser.
  const finished = underageMin !== null || sentTo !== null;
  useEffect(() => {
    if (finished) {
      clearDraft();
      return;
    }
    saveDraft(form.getValues(), step);
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => saveDraft(values as RegistrationForm, step),
    });
  }, [step, form, finished]);

  // Below the minimum age: nothing is kept (SPEC.md section 6).
  const rejectUnderage = (country: string) => {
    clearDraft();
    form.reset(emptyRegistration());
    setStep(0);
    setUnderageMin(minAgeFor(country));
  };

  const goTo = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const onNext = async () => {
    const ok = await form.trigger([...STEP_FIELDS[step]] as FieldPath<RegistrationForm>[]);
    if (!ok) {
      requestAnimationFrame(() =>
        document.querySelector('[role="alert"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
      );
      return;
    }
    if (step === 0) {
      const { birthDate, residenceCountry } = form.getValues();
      if (!isOldEnough(birthDate, residenceCountry)) return rejectUnderage(residenceCountry);
    }
    goTo(step + 1);
  };

  const emailRedirect = (next: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const onSubmit = async (values: RegistrationForm) => {
    setSubmitError(null);
    if (!isOldEnough(values.birthDate, values.residenceCountry)) return rejectUnderage(values.residenceCountry);

    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (captchaEnabled && !captcha) return setSubmitError(tCaptcha('captcha'));
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: buildSignUpMetadata(values),
          emailRedirectTo: emailRedirect(`/${locale}/profile?welcome=1`),
          captchaToken: captcha ?? undefined,
        },
      });
      if (error) {
        setResetSignal((n) => n + 1);
        if (error.message.includes('age_below_threshold')) return rejectUnderage(values.residenceCountry);
        setSubmitError(error.status === 429 ? tErr('rateLimit') : tErr('signUpFailed'));
        return;
      }
      clearDraft();
      if (data.session) {
        router.replace('/profile?welcome=1');
        return;
      }
      setSentTo(values.email.trim());
    } catch {
      setSubmitError(tErr('network'));
    } finally {
      setSubmitting(false);
    }
  };

  // The form was invalid on submit (for example edited storage): jump to the first step with a problem.
  const onInvalid = () => {
    const errors = form.formState.errors;
    const bad = STEP_FIELDS.findIndex((fields) => fields.some((f) => errors[f]));
    if (bad >= 0 && bad !== step) goTo(bad);
  };

  const resend = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !sentTo) return;
    await supabase.auth.resend({
      type: 'signup',
      email: sentTo,
      options: { emailRedirectTo: emailRedirect(`/${locale}/profile?welcome=1`) },
    });
    setResendNote(true);
  };

  if (underageMin !== null) {
    return (
      <section aria-labelledby="underage-title" className="rounded-2xl border border-line-strong bg-accent-soft p-6">
        <h2 id="underage-title" className="text-2xl font-semibold text-text">
          {t('underage.title')}
        </h2>
        <p className="mt-3 text-lg">{t('underage.text', { age: underageMin })}</p>
        <Link href="/" className={`${primaryButton} mt-6`}>
          {t('underage.home')}
        </Link>
      </section>
    );
  }

  if (sentTo) {
    return (
      <section aria-labelledby="sent-title" className="rounded-2xl border border-line bg-surface p-6">
        <h2 id="sent-title" className="text-2xl font-semibold text-text">
          {t('account.checkEmailTitle')}
        </h2>
        <p className="mt-3 text-lg">{t('account.checkEmailText', { email: sentTo })}</p>
        <button type="button" onClick={resend} className={`${secondaryButton} mt-6`}>
          {t('account.resend')}
        </button>
        {resendNote && (
          <p role="status" className="mt-3 text-sm text-muted">
            {t('account.resent')}
          </p>
        )}
      </section>
    );
  }

  return (
    <form onSubmit={(e) => form.handleSubmit(onSubmit, onInvalid)(e)} noValidate>
      <p className="text-muted">{t('intro')}</p>

      <div className="mt-6">
        <div
          role="progressbar"
          aria-label={t('progressLabel')}
          aria-valuemin={1}
          aria-valuemax={STEP_KEYS.length}
          aria-valuenow={step + 1}
          aria-valuetext={t('stepOf', { current: step + 1, total: STEP_KEYS.length })}
          className="flex gap-2"
        >
          {STEP_KEYS.map((k, i) => (
            <span
              key={k}
              className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-surface-strong'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-muted">
          {t('stepOf', { current: step + 1, total: STEP_KEYS.length })}
        </p>
      </div>

      <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-semibold text-text outline-none">
        {t(`steps.${STEP_KEYS[step]}`)}
      </h2>

      <div className="mt-6">
        {step === 0 && <StepAge form={form} />}
        {step === 1 && <StepAccount form={form} />}
      </div>

      {step === LAST && !configured && (
        <p role="alert" className="mt-6 rounded-xl border border-line-strong bg-accent-soft p-3 text-sm">
          {t('account.notConfigured')}
        </p>
      )}
      {step === LAST && <div className="mt-6"><Turnstile onToken={setCaptcha} resetSignal={resetSignal} /></div>}
      {submitError && (
        <p role="alert" className="mt-6 text-sm font-medium text-danger">
          {submitError}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={() => goTo(step - 1)} className={secondaryButton}>
            {t('back')}
          </button>
        )}
        {step < LAST ? (
          <button type="button" onClick={onNext} className={primaryButton}>
            {t('next')}
          </button>
        ) : (
          <button type="submit" disabled={submitting || !configured} className={primaryButton}>
            {submitting ? t('creating') : t('create')}
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">
        {t('alreadyHave')}{' '}
        <Link href="/login" className="font-semibold text-accent-text underline underline-offset-4">
          {t('loginLink')}
        </Link>
      </p>
    </form>
  );
}
