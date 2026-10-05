import { TYPE_ICON_PATHS } from '@/lib/institutions/icons';
import type { InstitutionType } from '@/lib/institutions/types';

/** A round badge in the type colour with the type icon inside (legend, cards). Decorative. */
export function TypeDot({ type, size = 28 }: { type: InstitutionType; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `var(--type-${type})`,
        color: `var(--type-${type}-on)`,
        boxShadow: '0 0 0 2px var(--map-ring), 0 0 0 3px var(--border-strong)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.64}
        height={size * 0.64}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={TYPE_ICON_PATHS[type]} />
      </svg>
    </span>
  );
}
