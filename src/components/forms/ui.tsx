'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export const inputClass =
  'h-11 w-full rounded-xl border border-line-strong bg-bg px-3 text-text placeholder:text-muted';
export const primaryButton =
  'inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 font-semibold text-on-accent hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60';
export const secondaryButton =
  'inline-flex h-11 items-center justify-center rounded-full border border-line-strong bg-bg px-6 font-semibold text-text hover:bg-surface-strong disabled:opacity-60';

/** A translated validation message. The code is a key of Register.errors.* */
export function ErrorText({ code, id }: { code?: string; id?: string }) {
  const t = useTranslations('Register.errors');
  if (!code) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm font-medium text-danger">
      {t(code as 'required')}
    </p>
  );
}

/** Label + optional "why we ask" + the control + the error. */
export function Field({
  label,
  why,
  error,
  htmlFor,
  children,
}: {
  label: string;
  why?: string;
  error?: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block font-semibold text-text">
        {label}
      </label>
      {why && <p className="mt-0.5 text-sm text-muted">{why}</p>}
      <div className="mt-2">{children}</div>
      <ErrorText code={error} id={`${htmlFor}-error`} />
    </div>
  );
}

/** A group of related controls (radio buttons, check boxes) with a visible title. */
export function Group({
  legend,
  why,
  error,
  children,
}: {
  legend: string;
  why?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-semibold text-text">{legend}</legend>
      {why && <p className="mt-0.5 text-sm text-muted">{why}</p>}
      <div className="mt-2">{children}</div>
      <ErrorText code={error} />
    </fieldset>
  );
}

/** A toggle button that looks like a chip (used for regions, countries, types). */
export function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1 text-sm ${
        pressed
          ? 'border-line-strong bg-accent-soft text-text'
          : 'border-dashed border-line-strong bg-bg text-muted'
      }`}
    >
      {pressed && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 5 5 9-10" />
        </svg>
      )}
      {children}
    </button>
  );
}
