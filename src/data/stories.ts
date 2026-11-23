/**
 * Stories — original articles for the blog.
 * Each story is a list of typed blocks rendered by /stories/[slug].
 * To add a story: copy an object, change the slug/title/blocks.
 */

export type StoryBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface Story {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  readMinutes: number;
  tag: string;
  relatedGame: string;
  excerpt: string;
  blocks: StoryBlock[];
}

export const STORIES: Story[] = [
  {
    slug: "how-to-play-krillion-unblocked",
    title: "How to Play Krillion Unblocked: Rules, Scoring and Tiers",
    description:
      "The complete rulebook for Krillion Unblocked: seven prompts, 25 seconds each, six scoring tiers and the 7,000-metre depth meter explained.",
    date: "2026-10-02",
    readMinutes: 5,
    tag: "Guides",
    relatedGame: "krillion-unblocked",
    excerpt:
      "Seven prompts, 25 seconds each and one rule that changes everything: the obvious answer is the worst answer. Here is exactly how a dive works.",
    blocks: [
      {
        type: "p",
        text: "Krillion Unblocked looks like a simple quiz until the first score lands. You type 'apple' for \"Name a fruit\" and climb barely off the seabed; someone types 'quince' and rockets past you. That single twist — obvious answers are nearly worthless, rare answers are gold — is the whole game, and it is easier to love than to master. This guide walks through every rule, every tier and exactly how the depth meter turns points into metres, so nothing on the result screen surprises you.",
      },
      { type: "h2", text: "The rules in five steps" },
      {
        type: "ol",
        items: [
          "A daily dive gives you seven prompts, always the same seven for everyone on that calendar day. They appear one at a time, and you never know what number eight would have been — there is no number eight.",
          "For each prompt you type one single answer. Not a list, not a sentence, one answer. \"Name a fruit\" wants a fruit, not a fruit salad.",
          "You have 25 seconds per prompt. A timer ring drains around the prompt card while you think; if time runs out the prompt scores zero and the game moves on. The timer stops the moment you submit, so a fast confident answer never gets punished for being fast.",
          "Your answer is scored against the site's answer bank: a survey-style list where every accepted answer carries a popularity score from 1 (almost nobody says it) to 100 (the word that jumps to everyone's mind). Plurals and small spelling variations are forgiven — 'tomatoes' and 'tomato' are the same answer.",
          "One attempt per day. Finish or fail, your seven answers are locked in, the result screen takes over, and the next dive waits at midnight. There are no retries, which is precisely why every submit feels enormous.",
        ],
      },
      { type: "h2", text: "How the scoring tiers work" },
      {
        type: "p",
        text: "Every accepted answer maps to one of six tiers, decided purely by how common the answer is in the bank. The game never tells you which answers exist, so the tiers are your only feedback — and your only map for tomorrow. Here is the full table, exactly as the game scores it:",
      },
      {
        type: "table",
        headers: ["Tier", "How common your answer is", "Points"],
        rows: [
          ["One in a Krillion", "Popularity 1–5 — almost nobody says it", "100"],
          ["Deep Cut", "Popularity 6–15 — a genuinely rare pick", "85"],
          ["Rare", "Popularity 16–30 — nicely uncommon", "60"],
          ["Schooler", "Popularity 31–50 — solid mid-crowd", "30"],
          ["Too Clever", "Popularity 51–70 — more common than you thought", "15"],
          ["Plankton", "Popularity 71–100 — everyone says it", "10"],
          ["No Catch", "Not on the answer board at all", "0"],
        ],
      },
      {
        type: "p",
        text: "Two details worth burning into memory. First, 'Too Clever' is the tier that stings: it means your answer was on the board but far more popular than you judged it to be. Second, a 'No Catch' scores zero but still counts as your answer — there is no penalty system beyond the zero, so a brave wrong guess and a blank screen cost the same.",
      },
      {
        type: "p",
        text: "Points then convert straight into depth: every point is ten metres. A perfect seven answers of \"One in a Krillion\" scores 700 points and reaches the floor at 7,000 metres, which is where the game's name lives — an answer so rare it is one in a krillion. Most good daily dives land somewhere between 1,500 and 4,500 metres, and the animated depth meter fills as your total climbs, so you always know whether you are drifting in the sunlight zone or brushing the trench.",
      },
      { type: "h2", text: "Daily mode versus Unlimited" },
      {
        type: "p",
        text: "The main page at /krillion-unblocked is the Daily: shared prompts, one attempt, a streak that grows when you show up on consecutive days. Unlimited mode, at /unlimited, uses the same answer bank but feeds you prompt after prompt with no daily lock and no shared puzzle. It is the practice ground: no stakes, no streak on the line, just reps for your rarity instinct. Most players warm up in Unlimited in the morning and take their real dive later in the day.",
      },
      { type: "h2", text: "The result screen and the spoiler rule" },
      {
        type: "p",
        text: "After the seventh answer you get your total, your depth, a tier badge for each prompt and your running streak, plus a share box. The share text is deliberately spoiler-free: it shows coloured squares for your tiers and never reveals a single answer, so posting it cannot ruin the puzzle for a friend who has not played yet. They will know you hit a Deep Cut on prompt four and a No Catch on prompt six, and that is all they will know.",
      },
      { type: "h2", text: "Quick answers to common rule questions" },
      {
        type: "ul",
        items: [
          "Ran out the clock on one prompt? The other six still count. The dive continues.",
          "Typed something with a typo? Light plural and spelling tolerance is applied, but a genuinely different word is a No Catch. Type deliberately.",
          "Changed your mind mid-typing? Nothing is scored until you submit or the timer dies. Clear and retype freely.",
          "Can you play yesterday's dive? No — each day's puzzle exists only on that day. The streak tab on the result screen is your only history.",
          "Do Unlimited scores affect the daily? They do not. Daily results and Unlimited bests live in separate slots in your browser.",
        ],
      },
      {
        type: "p",
        text: "That is the complete rulebook. When you can explain the tier table from memory, you are ready for the real skill: guessing rarity before the badge tells you. The full rules hub collects this page alongside every other game on the site, and if you want the same seven prompts played backwards, Noillirk awaits — there, the most obvious answer on the board is suddenly the best one.",
      },
    ],
  },
  {
    slug: "when-does-krillion-unblocked-reset",
    title: "When Does Krillion Unblocked Reset? Daily Reset Times Explained",
    description:
      "Krillion Unblocked resets at midnight in your own time zone. Here is why the daily uses your local clock, what happens to streaks, and how the countdown works.",
    date: "2026-10-09",
    readMinutes: 4,
    tag: "Guides",
    relatedGame: "krillion-unblocked",
    excerpt:
      "No server clock, no UTC hand-off: the daily puzzle turns over at midnight on your device. Here is exactly what that means for you and your streak.",
    blocks: [
      {
        type: "p",
        text: "Every daily game on Krillion Unblocked is built around one quiet fact: the puzzle changes at midnight where you are. Not at a server's midnight, not at a fixed hour broadcast from headquarters — at midnight on the device in your hand. That design choice shapes everything from when you can take your dive to how your streak survives a holiday, so this page spells it out completely.",
      },
      { type: "h2", text: "Your local midnight is the finish line" },
      {
        type: "p",
        text: "Open the daily at 11:58 in the evening and you get today's puzzle; take your dive at 00:01 and you get tomorrow's. There is no grace period and no overlap — the date on the result screen is the date your device believes it is. The countdown you see after finishing ticks down to the next local midnight, and when it hits zero the new prompts are already waiting. If you have ever wondered why a friend in another country is excited about 'a completely different puzzle', this is why: for a few hours each day, you are literally playing different questions.",
      },
      { type: "h2", text: "Why the game uses your own clock" },
      {
        type: "p",
        text: "A daily puzzle is a shared experience, and the cleanest way to share it fairly across the whole planet is to let everyone's own day contain exactly one copy of it. A single global reset time would hand midnight-adjacent time zones a fresh puzzle in the middle of their afternoon and a stale one at breakfast. Local resets keep the ritual where it belongs: one dive per day, ending when your day does. The site stores nothing about you on a server — your streak, your scores and the day you last played live in your browser's own storage, which is also why the game keeps working with no account and no sign-in.",
      },
      { type: "h2", text: "Examples around the world" },
      {
        type: "ul",
        items: [
          "In New York, the dive ends at 12:00 a.m. Eastern — results lock and November's puzzle becomes October's history.",
          "In London, the same roll-over happens at 12:00 a.m. GMT, five hours after New York's.",
          "In Tokyo the puzzle turns at 12:00 a.m. JST, fourteen hours ahead of London — Tokyo players meet each new day first.",
          "In Sydney, midnight lands in the middle of a European afternoon, which is why Australian friends always seem to be talking about tomorrow's puzzle.",
        ],
      },
      {
        type: "p",
        text: "Notice the pattern: nowhere in that list does the site pick a special time for anyone. Whatever your device's date and time settings say, the game obeys them. If you fly from London to Los Angeles, your unfinished day simply becomes longer — the reset follows you.",
      },
      { type: "h2", text: "Streaks and the midnight race" },
      {
        type: "p",
        text: "A streak counts consecutive calendar days with a completed daily. Finish today and tomorrow's dive extends it; skip a full local day and it resets to zero the next time you play. Because the calendar is local, a late-night dive followed by an early-morning dive can both count on consecutive days even if only six hours of sleep separate them — the streak cares about dates, not hours. Travelling across time zones works the same way: follow the local calendar and the streak follows you.",
      },
      { type: "h2", text: "What resets — and what stays yours" },
      {
        type: "table",
        headers: ["Resets at your midnight", "Stays with you in this browser"],
        rows: [
          ["The seven daily prompts and their attempt", "Your streak count and its history"],
          ["The one-attempt-per-day lock", "Personal bests for every game"],
          ["Today's Word Hunt grid and estimation questions", "Sound and settings preferences"],
          ["The result screen for the finished puzzle", "Unlimited mode progress — it never resets"],
        ],
      },
      { type: "h2", text: "Playing the last minutes right" },
      {
        type: "p",
        text: "Two practical habits fall out of all this. If you have not taken today's dive and midnight is close, take it now: an unfinished puzzle cannot be saved for the morning, and a rushed Plankton still protects a streak. If you have already played, the countdown on the result screen is the honest clock — when it reaches zero, reload and tomorrow is live. Daily games are at their best when the reset feels like a tide coming in: quiet, punctual, and slightly different every single day.",
      },
    ],
  },
  {
    slug: "ten-tips-rarer-answers",
    title: "10 Tips to Find Rarer Answers and Score Higher",
    description:
      "Ten practical habits for hunting One in a Krillion answers: go specific, distrust your first thought, shop in other cuisines and know when to settle for Plankton.",
    date: "2026-10-16",
    readMinutes: 6,
    tag: "Strategy",
    relatedGame: "krillion-unblocked",
    excerpt:
      "Rarity is a skill, not luck. These ten habits — from going hyper-specific to borrowing from other cuisines — push your daily dive deeper.",
    blocks: [
      {
        type: "p",
        text: "Scoring deep in Krillion Unblocked is not about knowing obscure trivia; it is about knowing how ordinary brains behave — including your own. The answer bank mirrors what a huge crowd says first, so every step below the obvious is a step away from the crowd's instincts. These ten tips are the habits that separate a 1,400-metre diver from a 5,000-metre one, and every one of them can be practised for free in Unlimited mode before you risk a streak.",
      },
      { type: "h2", text: "Ten tips worth drilling" },
      {
        type: "ol",
        items: [
          "Distrust your first thought — it is everyone's first thought. The whole game is built on the fact that 'banana' arrives in under a second. When a prompt lands, let the obvious answer appear, name it silently, and then deliberately go one level stranger. You are not looking for the answer to the question; you are looking for the answer to 'what would almost nobody say here?'",
          "Trade species for varieties. The crowd names categories; deep divers name members. 'Apple' is Plankton territory, 'Granny Smith' would be mid-table if it landed, and heritage varieties are the real hunt. This one mental move — from category to specific example — is the single most reliable depth-gainer in the game.",
          "Shop in other cuisines. The biggest free source of rare answers is a food culture that is not yours. Fruit prompts yield loquat, rambutan and feijoa; bread prompts yield lavash and injera. If your pantry has one aisle you never visit, that aisle is a Deep Cut farm.",
          "Borrow a scientist's vocabulary. The crowd says 'big cat'; the diver says 'ocelot'. The crowd says 'spider'; the diver says 'harvestman'. Field-guide nouns are rarely anyone's first answer, and prompts about animals, plants and weather are where a few technical words pay for themselves across dozens of puzzles.",
          "Mine specific places and brands-free objects. 'Name something you take to the beach' invites generic beach gear, but a specific region's picnic — a stelze in Austria, a hamper with scotch eggs — reads as rare because it is anchored somewhere real. Concrete nouns beat abstract ones almost every time.",
          "Respect the Too Clever trap. The tier between Rare and Plankton exists because half of all mistakes are answers that feel obscure but are secretly beloved — 'pomegranate' feels exotic and still sits mid-table. When you are proud of an answer, run the crowd check: picture a hundred people, count who says it. If more than half raise a hand, go stranger.",
          "Know when Plankton is a win. Ten points beat zero, always. If the timer is draining and all you have is a No Catch-risk hunch, submit the safe on-board answer instead of an invented one. Champions are not built on glory answers; they are built on never donating a prompt to the void.",
          "Use the 5-second scan on multi-part prompts. 'Name something with wings' has whole families of answers: birds, aircraft, insects, mythology, objects. Before committing, sweep the families once — most players tunnel into the first family they touch, which is exactly why the third family you think of is usually a tier deeper.",
          "Watch your own patterns and break them. After a week of dailies you will notice your default flavour of weird — maybe you always go botanical, or always obscure-cuisine. The answer bank averages everyone's instincts, not yours, so your personal rut is a personal ceiling. Rotate your starting families deliberately: day one lead with geography, day two with tools, day three with old words.",
          "Practise in Unlimited, then go dive. Unlimited exists so the daily can stay precious. Twenty prompts in Unlimited, keeping a mental tally of your tier colours, will do more for tomorrow's dive than any list of tips — including this one. The goal is not to memorise answers; it is to calibrate your rarity sense until the badge on the reveal screen stops surprising you.",
        ],
      },
      {
        type: "p",
        text: "None of these require genius — they require letting go of the answer that wants to be typed. That answer has already been typed by a million people, which is exactly why it is worth ten points. Let it go, reach one branch lower, and the depth meter will tell you what the crowd didn't. When you are ready, the daily dive is waiting, and its reversed twin is too: Noillirk flips the whole game so the crowd's first thought becomes the winning one — playing both back to back is the best rarity training there is.",
      },
    ],
  },
];
