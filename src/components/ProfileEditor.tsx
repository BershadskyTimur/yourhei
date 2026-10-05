'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { Link, useRouter } from '@/i18n/navigation';
import { calcAge, isOldEnough, minAgeFor } from '@/lib/age';
import { documentsFromDb, documentsToDb, type DbDocument } from '@/lib/registration/documents';
import {
  emptyRegistration,
  profileSchema,
  profileValuesToDb,
  type ProfileForm,
  type RegistrationForm,
} from '@/lib/registration/schema';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { StepAbout } from './forms/StepAbout';
import { StepDocuments } from './forms/StepDocuments';
import { StepSearch } from './forms/StepSearch';
import { primaryButton, secondaryButton } from './forms/ui';

interface ProfileRow {
  birth_date: string | null;
  gender: 'male' | 'female' | 'undisclosed' | null;
  residence_country: string | null;
  citizenships: string[];
  target_regions: string[];
  target_countries: string[];
  target_types: string[];
  plan: 'free' | 'premium';
  marketing_opt_in: boolean;
  created_at: string;
}

type Message = { kind: 'ok' | 'error'; text: string } | null;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold text-brand">{title}</h2>
      {children}
    </section>
  );
}

export function ProfileEditor() {
  const t = useTranslations('Profile');
  const router = useRouter();
  const params = useSearchParams();

  // The profile editor reuses the registration steps; the account fields are simply not validated here.
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<RegistrationForm>,
    defaultValues: emptyRegistration(),
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const [citizenships, countries, types] = useWatch({
    control: form.control,
    name: ['citizenships', 'countries', 'types'],
  });
  const incomplete = citizenships.length === 0 || countries.length === 0 || types.length === 0;

  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [loadFailed, setLoadFailed] = useState(false);
  const [account, setAccount] = useState<{ id: string; email: string; createdAt: string } | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [marketing, setMarketing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);
  const [dataMessage, setDataMessage] = useState<Message>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.replace('/login');
      return;
    }
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.replace('/login?next=%2Fprofile');
        return;
      }
      const [{ data: p, error: e1 }, { data: docs, error: e2 }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_documents').select('doc_type, status, details').eq('user_id', user.id),
      ]);
      // No table (the database is not set up) or no profile row: saving could never work, so say so.
      if (e1 || e2 || !p) {
        console.error('[profile] could not load the profile', e1 ?? e2 ?? 'no profile row');
        setLoadFailed(true);
      }
      const row = p as ProfileRow | null;
      setAccount({ id: user.id, email: user.email ?? '', createdAt: user.created_at });
      setProfile(row);
      setMarketing(row?.marketing_opt_in ?? false);
      form.reset({
        ...emptyRegistration(),
        regions: row?.target_regions ?? [],
        countries: row?.target_countries ?? [],
        types: (row?.target_types ?? []) as RegistrationForm['types'],
        birthDate: row?.birth_date ?? '',
        gender: (row?.gender ?? '') as RegistrationForm['gender'],
        residenceCountry: row?.residence_country ?? '',
        citizenships: row?.citizenships ?? [],
        ageConfirmed: Boolean(row?.birth_date),
        documents: documentsFromDb((docs ?? []) as DbDocument[]),
      });
      setStatus('ready');
    })();
  }, [form, router]);

  const onSave = async (values: ProfileForm) => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !account) return;
    setSaveMessage(null);
    if (!isOldEnough(values.birthDate, values.residenceCountry)) {
      setSaveMessage({ kind: 'error', text: t('ageBlocked', { age: minAgeFor(values.residenceCountry) }) });
      return;
    }
    setSaving(true);
    const minor = (calcAge(values.birthDate) ?? 99) < 18;
    const rows = documentsToDb(values.documents, minor);

    // .select() returns the changed rows: none means there was no profile row, so nothing was saved.
    const { data: updated, error: profileError } = await supabase
      .from('profiles')
      .update(profileValuesToDb(values))
      .eq('id', account.id)
      .select('id');
    if (profileError || !updated?.length) {
      if (profileError) console.error('[profile] save failed', profileError);
      setSaving(false);
      setSaveMessage({
        kind: 'error',
        text: profileError?.message.includes('age_below_threshold')
          ? t('ageBlocked', { age: minAgeFor(values.residenceCountry) })
          : t('saveFailed'),
      });
      return;
    }

    const { error: docsError } = await supabase
      .from('user_documents')
      .upsert(rows.map((r) => ({ ...r, user_id: account.id })), { onConflict: 'user_id,doc_type' });
    // Remove documents that are no longer in the form (e.g. the other kind of education document).
    const { error: cleanError } = await supabase
      .from('user_documents')
      .delete()
      .eq('user_id', account.id)
      .not('doc_type', 'in', `(${rows.map((r) => r.doc_type).join(',')})`);

    setSaving(false);
    setSaveMessage(
      docsError || cleanError ? { kind: 'error', text: t('saveFailed') } : { kind: 'ok', text: t('saved') },
    );
  };

  const toggleMarketing = async (next: boolean) => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !account) return;
    setMarketing(next);
    const { error } = await supabase.from('profiles').update({ marketing_opt_in: next }).eq('id', account.id);
    if (error) setMarketing(!next);
  };

  const exportData = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !account) return;
    setDataMessage(null);
    const [{ data: p, error: e1 }, { data: docs, error: e2 }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', account.id).maybeSingle(),
      supabase.from('user_documents').select('*').eq('user_id', account.id),
    ]);
    if (e1 || e2) {
      setDataMessage({ kind: 'error', text: t('data.exportFailed') });
      return;
    }
    const file = {
      exported_at: new Date().toISOString(),
      account: { id: account.id, email: account.email, created_at: account.createdAt },
      profile: p,
      documents: docs,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yourhei-my-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setDataMessage(null);
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      setDataMessage({ kind: 'error', text: t('data.deleteFailed') });
      return;
    }
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (status === 'loading') {
    return <p className="text-muted">{t('loading')}</p>;
  }

  return (
    <div className="space-y-8">
      {loadFailed && (
        <p role="alert" className="rounded-xl border border-danger p-4 font-medium text-danger">
          {t('loadFailed')}
        </p>
      )}
      {params.get('welcome') === '1' && (
        <p role="status" className="rounded-xl border border-line-strong bg-accent-soft p-4 font-medium">
          {t('welcome')}
        </p>
      )}

      <dl className="grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6">
        <div>
          <dt className="text-sm text-muted">{t('email')}</dt>
          <dd className="font-semibold">{account?.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">{t('plan')}</dt>
          <dd className="font-semibold">{profile?.plan === 'premium' ? t('planPremium') : t('planFree')}</dd>
        </div>
      </dl>

      {incomplete && (
        <section className="rounded-2xl border border-line-strong bg-accent-soft p-5 sm:p-6">
          <h2 className="text-xl font-bold text-brand">{t('complete.title')}</h2>
          <p className="mt-1">{t('complete.text')}</p>
        </section>
      )}

      <section className="rounded-2xl border border-line-strong bg-accent-soft p-5 sm:p-6">
        <h2 className="text-xl font-bold text-brand">{t('survey.title')}</h2>
        <p className="mt-1">{t('survey.text')}</p>
        <Link href="/survey" className={`${primaryButton} mt-4`}>
          {t('survey.open')}
        </Link>
      </section>

      <form onSubmit={form.handleSubmit(onSave)} noValidate className="space-y-8">
        <Section title={t('sections.about')}>
          <StepAbout form={form} />
        </Section>
        <Section title={t('sections.search')}>
          <StepSearch form={form} />
        </Section>
        <Section title={t('sections.documents')}>
          <StepDocuments form={form} />
        </Section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? t('saving') : t('save')}
          </button>
          {saveMessage && (
            <p
              role={saveMessage.kind === 'error' ? 'alert' : 'status'}
              className={`font-medium ${saveMessage.kind === 'error' ? 'text-danger' : 'text-text'}`}
            >
              {saveMessage.text}
            </p>
          )}
        </div>
      </form>

      <Section title={t('sections.privacy')}>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => toggleMarketing(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-accent"
          />
          <span>{t('marketing')}</span>
        </label>
      </Section>

      <Section title={t('data.title')}>
        <div className="space-y-6">
          <div>
            <p>{t('data.exportText')}</p>
            <button type="button" onClick={exportData} className={`${secondaryButton} mt-3`}>
              {t('data.export')}
            </button>
          </div>

          <div>
            <p>{t('data.deleteText')}</p>
            {!confirmingDelete ? (
              <button type="button" onClick={() => setConfirmingDelete(true)} className={`${secondaryButton} mt-3 text-danger`}>
                {t('data.delete')}
              </button>
            ) : (
              <div role="alertdialog" aria-label={t('data.delete')} className="mt-3 rounded-xl border border-danger p-4">
                <p className="font-medium">{t('data.confirmText')}</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={deleteAccount} className="inline-flex h-11 items-center rounded-full bg-danger px-6 font-semibold text-bg">
                    {t('data.confirm')}
                  </button>
                  <button type="button" onClick={() => setConfirmingDelete(false)} className={secondaryButton}>
                    {t('data.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {dataMessage && (
            <p role="alert" className="font-medium text-danger">
              {dataMessage.text}
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}
