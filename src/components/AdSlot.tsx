import { useTranslations } from 'next-intl';

/**
 * A reserved place for an advertisement (SPEC.md section 1: the layout must leave room for ads).
 * Sizes follow the common ad formats. When an ad network is connected, its code replaces the
 * placeholder inside the element that has the data-ad-slot attribute.
 */
const SIZES = {
  leaderboard: { box: 'min-h-[90px] w-full max-w-[728px]', label: '728 × 90' },
  banner: { box: 'min-h-[100px] w-full', label: '970 × 100' },
  rectangle: { box: 'min-h-[250px] w-full max-w-[300px]', label: '300 × 250' },
  skyscraper: { box: 'min-h-[600px] w-[160px]', label: '160 × 600' },
} as const;

export type AdKind = keyof typeof SIZES;

export function AdSlot({ kind, className = '' }: { kind: AdKind; className?: string }) {
  const t = useTranslations('Ads');
  const size = SIZES[kind];
  return (
    <aside
      aria-label={t('label')}
      data-ad-slot={kind}
      className={`mx-auto flex flex-col items-center justify-center rounded-lg border border-[var(--ad-border)] bg-[var(--ad-bg)] text-center ${size.box} ${className}`}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">{t('label')}</span>
      <span className="mt-1 text-xs text-muted">{size.label}</span>
    </aside>
  );
}
