// Small line icons for the home page. Decorative: they are hidden from screen readers.
import type { ReactNode } from 'react';

function Icon({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const MapIcon = () => (
  <Icon>
    <path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4z" />
    <path d="M9 4v13M15 7v13" />
  </Icon>
);
export const SparkIcon = () => (
  <Icon>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
  </Icon>
);
export const ShieldIcon = () => (
  <Icon>
    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);
export const GlobeIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
  </Icon>
);
export const CapIcon = () => (
  <Icon size={18}>
    <path d="M12 5 2 10l10 5 10-5-10-5z" />
    <path d="M6 12.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-3.5" />
  </Icon>
);

/** The decorative picture of the hero: a stylised map with glowing pins. */
export function HeroArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 420 320" className="h-auto w-full max-w-[460px]">
      <defs>
        <linearGradient id="hero-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--bg)" />
          <stop offset="1" stopColor="var(--surface)" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="210" cy="170" rx="200" ry="140" fill="url(#hero-glow)" />
      <rect x="40" y="40" width="340" height="230" rx="26" fill="url(#hero-card)" stroke="var(--border-strong)" strokeOpacity="0.45" strokeWidth="2" />
      <g stroke="var(--border-strong)" strokeOpacity="0.35" strokeWidth="1.5" fill="none">
        <path d="M40 110h340M40 175h340M40 235h340M120 40v230M210 40v230M300 40v230" />
        <path d="M60 230c50-45 85-5 130-50s70-45 120-90" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="3" strokeDasharray="3 8" />
      </g>
      {[
        { x: 105, y: 150, c: 'var(--accent)' },
        { x: 215, y: 105, c: 'var(--gold)' },
        { x: 300, y: 190, c: 'var(--accent)' },
        { x: 170, y: 215, c: 'var(--gold)' },
        { x: 335, y: 95, c: 'var(--gold)' },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`}>
          <circle r="20" fill={p.c} opacity="0.18" />
          <path d="M0 14C-9 2-11-2-11-8a11 11 0 0 1 22 0c0 6-2 10-11 22z" fill={p.c} stroke="#fff" strokeWidth="2" />
          <circle cy="-8" r="4" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}
