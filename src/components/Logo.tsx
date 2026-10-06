/** The YourHEI logo: a flat badge with a graduation cap, and the word mark. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" className="shrink-0">
        <rect width="48" height="48" rx="10" fill="var(--accent)" />
        <path d="M24 12 8 20l16 8 16-8-16-8z" fill="none" stroke="var(--on-accent)" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M14 23.5v7c0 2.4 4.5 4.5 10 4.5s10-2.1 10-4.5v-7" fill="none" stroke="var(--on-accent)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M40 20v9" stroke="var(--on-accent)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="text-2xl font-semibold leading-none tracking-tight">
        <span className="text-text">Your</span>
        <span className="text-accent-text">HEI</span>
      </span>
    </span>
  );
}