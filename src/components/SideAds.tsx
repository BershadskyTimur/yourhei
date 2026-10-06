import type { ReactNode } from 'react';
import { AdSlot } from './AdSlot';

/** Content with a vertical ad column on each side. The columns appear on wide screens only. */
export function SideAds({ children }: { children: ReactNode }) {
  const rail = (
    <div className="hidden xl:block">
      <div className="sticky top-24">
        <AdSlot kind="skyscraper" />
      </div>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 xl:grid-cols-[160px_minmax(0,1fr)_160px]">
      {rail}
      <div className="min-w-0">{children}</div>
      {rail}
    </div>
  );
}