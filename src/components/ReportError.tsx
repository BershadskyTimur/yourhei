'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { inputClass, primaryButton, secondaryButton } from './forms/ui';

/**
 * "Report an error on this page": a small form that saves the message in the admin panel (function submit_error_report,
 * migration 0029). When that is not possible, the visitor is offered the e-mail link instead.
 */
export function ReportError({ label, mailto }: { label: string; mailto?: string }) {
  const t = useTranslations('ReportError');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [contact, setContact] = useState('');
  const [trap, setTrap] = useState(''); // a field people do not see: robots fill it in
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const send = async () => {
    if (note.trim().length < 5) return;
    if (trap) return setState('sent'); // a robot: pretend all is well
    const supabase = getSupabaseBrowser();
    if (!supabase) return setState('failed');
    setState('sending');
    const { error } = await supabase.rpc('submit_error_report', {
      p_path: window.location.pathname,
      p_note: note.trim(),
      p_contact: contact.trim() || null,
      p_locale: locale,
    });
    setState(error ? 'failed' : 'sent');
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="underline underline-offset-4">
        {label}
      </button>
    );
  }
  if (state === 'sent') return <p role="status" className="font-medium">{t('sent')}</p>;
  return (
    <form
      className="mt-2 max-w-xl space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <div>
        <label htmlFor="report-note" className="mb-1 block text-sm font-medium text-text">{t('prompt')}</label>
        <textarea id="report-note" required minLength={5} maxLength={1500} rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${inputClass} !h-auto py-2`} />
      </div>
      <div>
        <label htmlFor="report-contact" className="mb-1 block text-sm font-medium text-text">{t('contactLabel')}</label>
        <input id="report-contact" type="email" maxLength={200} autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
      </div>
      {state === 'failed' && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t('failed')} {mailto && <a href={mailto} className="underline underline-offset-4">{label}</a>}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={state === 'sending'} className={primaryButton}>{t('send')}</button>
        <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>{t('cancel')}</button>
      </div>
    </form>
  );
}
