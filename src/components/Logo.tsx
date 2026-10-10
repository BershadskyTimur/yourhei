/** The YourHEI logo: an outlined square with a graduation cap (the lower part in brass), and the serif word mark. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 36 36" className="shrink-0">
        <rect x="0.75" y="0.75" width="34.5" height="34.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 15l11-5.5L29 15l-11 5.5z" fill="currentColor" />
        <path d="M12 19v5c0 1.8 2.7 3.5 6 3.5s6-1.7 6-3.5v-5l-6 3z" fill="var(--gold)" />
      </svg>
      <span className="font-serif text-[1.75rem] font-medium leading-none tracking-tight text-text">YourHEI</span>
    </span>
  );
}
