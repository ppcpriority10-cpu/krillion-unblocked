"use client";

import { useEffect, useState } from "react";
import { countdownLabel, msUntilMidnight } from "@/lib/daily";

/** Live countdown to the visitor's next local midnight. */
export function MidnightCountdown({ prefix = "New game in" }: { prefix?: string }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(msUntilMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="font-mono tabular-nums">
      {ms === null ? "--:--:--" : `${prefix} ${countdownLabel(ms)}`}
    </span>
  );
}
