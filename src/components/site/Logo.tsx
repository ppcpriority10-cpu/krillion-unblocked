export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ku-logo-g" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#96BFFF" />
          <stop offset="0.55" stopColor="#003F63" />
          <stop offset="1" stopColor="#0A2536" />
        </linearGradient>
      </defs>
      {/* squid head */}
      <path
        d="M24 3c9.4 0 15.5 6.6 15.5 15.2 0 4.4-1.6 7.6-4 10.3-.8.9-1.6 1.7-2.4 2.6H14.9c-.8-.9-1.6-1.7-2.4-2.6-2.4-2.7-4-5.9-4-10.3C8.5 9.6 14.6 3 24 3Z"
        fill="url(#ku-logo-g)"
      />
      {/* eyes */}
      <circle cx="18.2" cy="18" r="2.6" fill="#0A0A0A" />
      <circle cx="29.8" cy="18" r="2.6" fill="#0A0A0A" />
      <circle cx="19.1" cy="17.1" r="0.9" fill="#E3EEF5" />
      <circle cx="30.7" cy="17.1" r="0.9" fill="#E3EEF5" />
      {/* tentacles */}
      <path
        d="M12 33.5c-2.4 2.6-4.8 3.4-7 3.1 2.6 3 6.7 3.6 9.6 1M18.4 35v6.2c0 2-1.2 3.2-3 3.8 3.3 1 6.1-.7 6.6-3.6M24 35.4v8.1c0 1.9 1 3 2.6 3.5-2.9 1.6-6.2.2-6.9-2.8M31.4 35l2.5 7.3c.6 1.8 2 2.6 3.8 2.6-2.4 2.5-6 2.2-7.5-.7M36.6 32.6c1.5 3.3 3.8 5 6.9 5-1.6 3-5.5 4-8.6 2"
        stroke="url(#ku-logo-g)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoWordmark() {
  return (
    <span className="flex flex-col leading-none">
      <span className="font-serif text-[19px] font-bold tracking-tight text-foreground">
        Krillion <span className="text-steel">Unblocked</span>
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Daily games · Free
      </span>
    </span>
  );
}
