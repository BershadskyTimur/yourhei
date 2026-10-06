'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Link } from '@/i18n/navigation';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';
import { Turnstile, captchaEnabled } from './Turnstile';
import { Field, inputClass, primaryButton } from './forms/ui';

export function ForgotForm() {
  const t = useTranslations('Forgot');
  const tLogin = useTranslations('Login');
  const locale = useLocale();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (captchaEnabled && !captcha) return;
    setBusy(true);
    const next = encodeURIComponent(`/${locale}/reset-password`);
    // The answer is the same whether or not the address has an account (no account guessing).
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      captchaToken: captcha ?? undefined,
    });
    setResetSignal((n) => n + 1);
    setBusy(false);
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <p className="text-muted">{t('text')}</p>
      {!configured && (
        <p role="alert" className="rounded-xl border border-line-strong bg-accent-soft p-3 text-sm">
          {tLogin('notConfigured')}
        </p>
      )}
      <Field label={t('email')} htmlFor="forgot-email">
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Turnstile onToken={setCaptcha} resetSignal={resetSignal} />
      {sent && (
        <p role="status" className="rounded-xl border border-line-strong bg-accent-soft p-3 text-sm">
          {t('sent')}
        </p>
      )}
      <button type="submit" disabled={busy || !configured || !email || (captchaEnabled && !captcha)} className={`${primaryButton} w-full`}>
        {t('submit')}
      </button>
      <p className="text-sm">
        <Link href="/login" className="font-medium text-accent-text underline underline-offset-4">
          {t('back')}
        </Link>
      </p>
    </form>
  );
}
