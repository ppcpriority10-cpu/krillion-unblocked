import { cn } from "@/lib/utils";

export type GameIconName =
  | "squid"
  | "balloon"
  | "grid"
  | "gauge"
  | "palette"
  | "pulse"
  | "city";

/** Original inline SVG icons (stroke follows currentColor). */
export function GameIcon({
  name,
  className,
}: {
  name: GameIconName;
  className?: string;
}) {
  const common = {
    className: cn("h-6 w-6", className),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "squid":
      return (
        <svg {...common}>
          <path d="M12 3c3.6 0 6 2.5 6 5.8 0 1.8-.7 3.1-1.8 4.2H7.8C6.7 11.9 6 10.6 6 8.8 6 5.5 8.4 3 12 3Z" />
          <circle cx="9.8" cy="8.4" r="0.4" fill="currentColor" />
          <circle cx="14.2" cy="8.4" r="0.4" fill="currentColor" />
          <path d="M8 13c-.9 1.4-2.1 2.1-3.5 2.1M10.6 13v3.4c0 1.3-.6 2-1.6 2.4M13.4 13v4.6c0 1.1.5 1.8 1.4 2.2M16 13c.6 1.6 1.7 2.5 3.5 2.7" />
        </svg>
      );
    case "balloon":
      return (
        <svg {...common}>
          <path d="M12 2.5c3.3 0 5.5 2.4 5.5 5.6 0 3.4-2.7 6.4-5.5 6.4S6.5 11.5 6.5 8.1C6.5 4.9 8.7 2.5 12 2.5Z" />
          <path d="M12 14.5l-1 2.3h2l-1 2.2" />
          <path d="M9 21.5c1-1.2 2.3-1.2 3 0 .7 1.2 2 1.2 3 0" />
        </svg>
      );
    case "city":
      return (
        <svg {...common}>
          <path d="M4 21V9l4-2.5V21" />
          <path d="M10 21V4l5-2v19" />
          <path d="M17 21v-8l3-2v10" />
          <path d="M3 21h18" />
          <path d="M5.8 11h.8M5.8 14h.8M5.8 17h.8M12 7h.8M12 10h.8M12 13h.8M12 16h.8M18.6 14h.8M18.6 17h.8" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
          <path d="M8.2 6.1h-1M16.9 16.9h-1M17 6.5l-1.6 2.4h2.2L16 11M7.7 16.4c0-1 .8-1.5 1.5-1.1.8.4.5 1.5-.4 2L7.5 19h2.2" />
        </svg>
      );
    case "gauge":
      return (
        <svg {...common}>
          <path d="M4.5 14.5a7.5 7.5 0 1 1 15 0" />
          <path d="M12 14.5 15.8 9" />
          <circle cx="12" cy="14.5" r="1.4" />
          <path d="M3 19h18" />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.8 2-1.8 0-1.4-1.1-1.7-1.1-2.9 0-1 .8-1.8 2-1.8h1.8c2.4 0 4.3-1.6 4.3-4C21 6.4 17 3 12 3Z" />
          <circle cx="8" cy="9" r="1" fill="currentColor" />
          <circle cx="12.5" cy="7" r="1" fill="currentColor" />
          <circle cx="7.5" cy="13.5" r="1" fill="currentColor" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...common}>
          <rect x="3.5" y="6.5" width="4.6" height="11" rx="1.4" />
          <rect x="9.7" y="6.5" width="4.6" height="11" rx="1.4" />
          <rect x="15.9" y="6.5" width="4.6" height="11" rx="1.4" />
          <path d="M5.8 10v4M12 10v4M18.2 10v4" />
        </svg>
      );
  }
}
