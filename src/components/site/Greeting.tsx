"use client";

import { useEffect, useState } from "react";
import { mulberry32, seedFromString, todayKey } from "@/lib/daily";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FACTS = [
  "A group of squid is called a shoal — and some squid species hunt in organised packs.",
  "The deepest fish ever filmed was a snailfish seen at over 8,300 metres down.",
  "The word 'quiz' has no known origin — nobody can agree on where it came from.",
  "Octopuses have three hearts, and two of them stop beating when they swim.",
  "Honey found in ancient tombs was still edible after thousands of years.",
  "The dot over a lowercase i is called a tittle.",
  "A 'baker's dozen' is 13 because medieval law punished short-weight bakers.",
  "Bananas are berries by the botanical definition — strawberries are not.",
  "The Great Wall of China, all branches together, stretches over 21,000 km.",
  "Light from the Sun takes a little over eight minutes to reach your eyes.",
];

/**
 * Editorial greeting hero: "Good morning. It is 8:03 AM. Tuesday, November 10, 2026."
 * Rendered on the client so it always matches the visitor's own clock.
 */
export function Greeting() {
  const [line, setLine] = useState("");
  const [fact, setFact] = useState("");

  useEffect(() => {
    const build = () => {
      const d = new Date();
      const h = d.getHours();
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const part = h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
      setLine(
        `Good ${part}. It is ${h12}:${mm} ${ampm}. ${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}.`
      );
    };
    build();
    const id = window.setInterval(build, 20000);
    const rng = mulberry32(seedFromString(`fact:${todayKey()}`));
    setFact(FACTS[Math.floor(rng() * FACTS.length)]);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div>
      <p className="min-h-[2.4rem] font-serif text-xl font-semibold leading-snug text-foreground sm:text-2xl">
        {line || "\u00A0"}
      </p>
      <div className="mt-4 max-w-2xl rounded-xl border border-coin/60 bg-coin/10 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground/70">
          Did you know?
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/85">
          {fact || "A new fact about oceans, words and oddities loads with the page."}
        </p>
      </div>
    </div>
  );
}
