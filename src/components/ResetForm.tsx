'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@/i18n/navigation';
import { checkPassword } from '@/lib/password';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { PasswordInput } from './forms/StepAccount';
import { ErrorText, primaryButton } from './forms/ui';

/** Opened from the link in the reset e-mail (the callback has already signed the person in). */
export function ResetForm() {
  const t = useTranslations('Reset');
  const tErr = useTranslations('Register.errors');
  const tAccount = useTranslations('Register.account');
  const [state, setState] = useState<'checking' | 'ready' | 'expired' | 'done'>(() =>
    getSupabaseBrowser() ? 'checking' : 'expired',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [problems, setProblems] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? '');
      setState(data.user ? 'ready' : 'expired');
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = checkPassword(password, email);
    setProblems(found);
    if (found.length > 0) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setFailed(false);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setFailed(true);
    else setState('done');
  };

  if (state === 'checking') return null;

  if (state === 'expired') {
    return (
      <div className="space-y-4">
        <p>{t('noSession')}</p>
        <Link href="/forgot-password" className="font-semibold text-accent-text underline underline-offset-4">
          {t('requestNew')}
        </Link>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className="space-y-4">
        <p role="status">{t('done')}</p>
        <Link href="/profile" className={primaryButton}>
          {t('toProfile')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="new-password" className="block font-semibold text-text">
          {t('newPassword')}
        </label>
        <div className="mt-2">
          <PasswordInput
            id="new-password"
            autoComplete="new-password"
            hint={tAccount('passwordHint')}
            registerProps={{ value: password, onChange: (e) => setPassword(e.target.value), required: true }}
          />
        </div>
        {problems.map((p) => (
          <ErrorText key={p} code={p} />
        ))}
      </div>
      {failed && (
        <p role="alert" className="text-sm font-medium text-danger">
          {tErr('signUpFailed')}
        </p>
      )}
      <button type="submit" disabled={busy} className={`${primaryButton} w-full`}>
        {t('submit')}
      </button>
    </form>
  );
}
