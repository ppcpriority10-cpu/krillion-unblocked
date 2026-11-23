"use client";

import { useState } from "react";
import { clipboardCopy } from "@/lib/share";

/** Spoiler-free result text with a one-click copy button (light editorial). */
export function ShareBox({ text, label = "Share your result" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await clipboardCopy(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <pre className="scroll-slim mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-card p-3 font-mono text-[13px] leading-relaxed text-foreground/90">
        {text}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-3 w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
      >
        {copied ? "Copied ✓" : "Copy result"}
      </button>
    </div>
  );
}
