export default function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="7" fill="var(--color-panel-raised)" />
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke="var(--color-amber)"
        strokeWidth="1.3"
        strokeDasharray="2.4 2.6"
        opacity="0.85"
      />
      <circle cx="16" cy="4" r="1.7" fill="var(--color-amber)" />
      <path
        d="M16 23V16.5"
        stroke="var(--color-green)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 16.5C11.8 16.5 9.6 13.4 10.4 9.4C14.6 9.4 16.8 12.5 16 16.5Z"
        fill="var(--color-green)"
      />
      <path
        d="M16 16.5C20.2 16.5 22.4 13.4 21.6 9.4C17.4 9.4 15.2 12.5 16 16.5Z"
        fill="#6FDE8C"
      />
    </svg>
  );
}
