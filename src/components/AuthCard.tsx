import type { ReactNode } from 'react';

/** A narrow centred card for sign-in style pages. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}
