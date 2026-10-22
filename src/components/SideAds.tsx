import type { ReactNode } from 'react';
import { AdSlot } from './AdSlot';

/** Content with a vertical ad column on each side. The columns appear on wide screens only. */
export function SideAds({ children }: { children: ReactNode }) {
  const rail = (
    <div data-ad-column className="hidden xl:block">
      <div className="sticky top-24">
        <AdSlot kind="skyscraper" />
      </div>
    </div>
  );
  return (
    <div className="ads-side-grid mx-auto grid max-w-[1500px] gap-6 px-4">
      {rail}
      <div className="min-w-0">{children}</div>
      {rail}
    </div>
  );
}