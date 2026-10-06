'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';
import { PasswordInput } from './forms/StepAccount';
import { GoogleButton } from './GoogleButton';
import { Turnstile, captchaEnabled } from './Turnstile';
import { Field, inputClass, primaryButton, secondaryButton } from './forms/ui';

export function LoginForm() {
  const t = useTranslations('Login');
  const router = useRouter();
  const params = useSearchParams();
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  // Only plain in-site paths are accepted as "where to go after login".
  const requested = params.get('next') ?? '';
  const next = /^\/[a-z0-9-/]*$/i.test(requested) && !requested.startsWith('//') ? requested : '/profile';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (captchaEnabled && !captcha) return setError(t('errors.captcha'));
    setBusy(true);
    setError(null);
    setUnconfirmed(false);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password, options: captcha ? { captchaToken: captcha } : undefined });
    setBusy(false);
    if (err) setResetSignal((n) => n + 1);
    if (!err) {
      router.replace(next);
      return;
    }
    if (err.code === 'email_not_confirmed') {
      setUnconfirmed(true);
      setError(t('errors.notConfirmed'));
    } else if (err.code === 'invalid_credentials') {
      setError(t('errors.invalid'));
    } else if (err.status === 429) {
      setError(t('errors.rateLimit'));
    } else {
      setError(t('errors.generic'));
    }
  };

  const resend = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.resend({ type: 'signup', email: email.trim() });
    setResent(true);
  };

  return (
    <>
    <GoogleButton next={next} />
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {params.get('notice') === 'link' && (
        <p role="status" className="rounded-xl border border-line-strong bg-accent-soft p-3 text-sm">
          {t('notices.link')}
        </p>
      )}
      {!configured && (
        <p role="alert" className="rounded-xl border border-line-strong bg-accent-soft p-3 text-sm">
          {t('notConfigured')}
        </p>
      )}

      <Field label={t('email')} htmlFor="login-email">
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </Field>

      <div>
        <label htmlFor="login-password" className="block font-semibold text-text">
          {t('password')}
        </label>
        <div className="mt-2">
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            registerProps={{ value: password, onChange: (e) => setPassword(e.target.value), required: true }}
          />
        </div>
      </div>

      <Turnstile onToken={setCaptcha} resetSignal={resetSignal} />
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {unconfirmed && (
        <div>
          <button type="button" onClick={resend} className={secondaryButton}>
            {t('resend')}
          </button>
          {resent && (
            <p role="status" className="mt-2 text-sm text-muted">
              {t('resent')}
            </p>
          )}
        </div>
      )}

      <button type="submit" disabled={busy || !configured} className={`${primaryButton} w-full`}>
        {busy ? t('submitting') : t('submit')}
      </button>

      <p className="text-sm">
        <Link href="/forgot-password" className="font-medium text-accent-text underline underline-offset-4">
          {t('forgot')}
        </Link>
      </p>
      <p className="text-sm text-muted">
        {t('noAccount')}{' '}
        <Link href="/register" className="font-semibold text-accent-text underline underline-offset-4">
          {t('register')}
        </Link>
      </p>
    </form>
    </>
  );
}
