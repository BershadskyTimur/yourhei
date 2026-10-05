import type { ReactNode } from 'react';

/** Simple centred text page (about, contacts, legal templates, "coming soon"). */
export function PageShell({
  title,
  banner,
  children,
}: {
  title: string;
  banner?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">{title}</h1>
      {banner && (
        <p className="mt-4 rounded-xl border border-line-strong bg-accent-soft px-4 py-3 text-sm font-medium text-text">
          {banner}
        </p>
      )}
      <div className="mt-6 space-y-4 text-lg leading-relaxed">{children}</div>
    </article>
  );
}
