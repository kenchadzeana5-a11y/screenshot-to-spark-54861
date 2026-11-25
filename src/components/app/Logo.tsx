export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <defs>
        <linearGradient id="ssg" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0" stopColor="var(--chart-1)" /><stop offset="1" stopColor="var(--chart-2)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ssg)" />
      <circle cx="16" cy="16" r="9" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.2" className="text-primary-foreground" />
      <circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeOpacity=".6" strokeWidth="1.2" className="text-primary-foreground" />
      <path d="M16 16 L23 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-primary-foreground" />
      <circle cx="21" cy="12" r="1.8" fill="currentColor" className="text-primary-foreground" />
    </svg>
  );
}
