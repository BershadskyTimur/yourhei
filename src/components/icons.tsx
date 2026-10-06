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
