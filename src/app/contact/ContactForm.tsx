"use client";

import { useState } from "react";

/**
 * Demo contact form — no backend. On submit it shows a confirmation note
 * and offers a prefilled mailto: link so the message still reaches us.
 */
export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("Feedback");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const mailtoHref = () => {
    const subject = encodeURIComponent(`[Krillion] ${topic} — ${name || "visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name || "A visitor"}`);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please write a short message first.");
      return;
    }
    setError("");
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="font-serif text-xl font-bold text-foreground">Thanks — almost there</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This site has no server behind the form (it is a static, privacy-first site), so
          your message was <strong className="text-foreground">not sent automatically</strong>.
          Two options:
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <a
              className="font-semibold text-steel hover:underline"
              href={mailtoHref()}
            >
              Open the prefilled email
            </a>{" "}
            — everything you typed is already in it.
          </li>
          <li>
            Or copy your text and email <strong className="text-foreground">{email}</strong>{" "}
            manually.
          </li>
        </ol>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMessage("");
          }}
          className="mt-4 rounded-lg border border-border bg-card px-4 py-2 text-sm font-bold text-foreground hover:border-steel/40"
        >
          Write another message
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-input bg-card px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-steel focus:outline-none focus:ring-2 focus:ring-steel/25";

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="text-sm font-bold text-foreground">
            Your name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="cf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className={`mt-1.5 ${inputCls}`}
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="cf-topic" className="text-sm font-bold text-foreground">
            Topic
          </label>
          <select
            id="cf-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`mt-1.5 ${inputCls}`}
          >
            <option>Feedback</option>
            <option>New prompt idea</option>
            <option>New estimation question</option>
            <option>Bug report</option>
            <option>Business / advertising</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="cf-message" className="text-sm font-bold text-foreground">
          Message
        </label>
        <textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="Tell us what's on your mind — prompts, questions, bugs, ideas…"
          className={`mt-1.5 ${inputCls}`}
        />
      </div>
      {error && <p className="mt-2 text-sm font-bold text-destructive">{error}</p>}
      <button
        type="submit"
        className="mt-4 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Prepare my message
      </button>
      <p className="mt-3 text-xs text-muted-foreground">
        Demo form: nothing is transmitted from this page — no data leaves your browser
        until you choose to send the email yourself.
      </p>
    </form>
  );
}
