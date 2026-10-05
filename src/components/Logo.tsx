/** The YourHEI logo: a gradient badge with a graduation cap and a map pin, and the two-colour word mark. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logo-badge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--gold)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="13" fill="url(#logo-badge)" />
        {/* graduation cap */}
        <path d="M24 12 8 20l16 8 16-8-16-8z" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M14 23.5v7c0 2.4 4.5 4.5 10 4.5s10-2.1 10-4.5v-7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M40 20v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="40" cy="31" r="2.2" fill="#fff" />
      </svg>
      <span className="text-2xl font-extrabold leading-none tracking-tight">
        <span className="text-text">Your</span>
        <span className="gold-gradient-text">HEI</span>
      </span>
    </span>
  );
}
