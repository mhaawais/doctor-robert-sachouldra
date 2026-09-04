"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Contact form — client-side validation mirrors server-side zod rules.
 * States: idle → loading → success / error. Accessible labels, aria-invalid,
 * error descriptions. Honest messaging only (no "email sent" claims).
 */
type FormState = "idle" | "loading" | "success" | "error";

const REASONS = [
  "General message",
  "About the books",
  "Speaking & interviews",
  "Media & press",
  "Something else",
] as const;

interface Fields {
  name: string;
  email: string;
  subject: string;
  reason: string;
  message: string;
  company: string; // honeypot
}

const initialFields: Fields = {
  name: "",
  email: "",
  subject: "",
  reason: REASONS[0],
  message: "",
  company: "",
};

function validate(fields: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!fields.name.trim()) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!fields.subject.trim()) errors.subject = "Please enter a subject.";
  if (fields.message.trim().length < 10)
    errors.message = "Your message should be at least 10 characters.";
  return errors;
}

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");

    const nextErrors = validate(fields);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };

      if (!res.ok || !data.ok) {
        setState("error");
        setFeedback(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setState("success");
      setFeedback(data.message ?? "Thank you — your message has been received.");
    } catch {
      setState("error");
      setFeedback("Network error. Please check your connection and try again.");
    }
  }

  const inputClass = (hasError?: string) =>
    cn(
      "w-full rounded-sm border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/40",
      hasError ? "border-[#a8433a] focus:border-[#a8433a]" : "border-hairline focus:border-gold"
    );

  if (state === "success") {
    return (
      <div
        role="status"
        className="rounded-md border border-gold/40 bg-card p-10 text-center shadow-[0_10px_36px_-22px_rgba(14,27,42,0.4)]"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold-deep" aria-hidden="true" />
        <h3 className="mt-5 font-serif text-2xl text-ink">Message received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-body">
          {feedback} Robert appreciates you reaching out and will review your
          note personally.
        </p>
        <button
          type="button"
          onClick={() => {
            setFields(initialFields);
            setState("idle");
          }}
          className="mt-7 rounded-sm border border-ink/25 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-ink">
            Name <span aria-hidden="true" className="text-gold-deep">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            placeholder="Your full name"
            className={inputClass(errors.name)}
          />
          {errors.name ? (
            <p id="cf-name-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a8433a]">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email <span aria-hidden="true" className="text-gold-deep">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "cf-email-error" : undefined}
            placeholder="you@example.com"
            className={inputClass(errors.email)}
          />
          {errors.email ? (
            <p id="cf-email-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a8433a]">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-subject" className="mb-1.5 block text-sm font-medium text-ink">
            Subject <span aria-hidden="true" className="text-gold-deep">*</span>
          </label>
          <input
            id="cf-subject"
            name="subject"
            type="text"
            required
            value={fields.subject}
            onChange={(e) => set("subject", e.target.value)}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "cf-subject-error" : undefined}
            placeholder="What is this about?"
            className={inputClass(errors.subject)}
          />
          {errors.subject ? (
            <p id="cf-subject-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a8433a]">
              <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {errors.subject}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="cf-reason" className="mb-1.5 block text-sm font-medium text-ink">
            Reason <span className="text-ink/40">(optional)</span>
          </label>
          <select
            id="cf-reason"
            name="reason"
            value={fields.reason}
            onChange={(e) => set("reason", e.target.value)}
            className={cn(inputClass(), "appearance-none")}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-medium text-ink">
          Message <span aria-hidden="true" className="text-gold-deep">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={6}
          value={fields.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "cf-message-error" : "cf-message-hint"}
          placeholder="Write your message…"
          className={cn(inputClass(errors.message), "resize-y")}
        />
        {errors.message ? (
          <p id="cf-message-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs text-[#a8433a]">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {errors.message}
          </p>
        ) : (
          <p id="cf-message-hint" className="mt-1.5 text-xs text-ink/45">
            {fields.message.trim().length < 10
              ? `${10 - fields.message.trim().length} more characters needed`
              : "Thank you — your message looks good."}
          </p>
        )}
      </div>

      {/* Honeypot — invisible to humans */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="cf-company">Company (leave empty)</label>
        <input
          id="cf-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      {state === "error" ? (
        <div role="alert" className="rounded-sm border border-[#a8433a]/40 bg-[#a8433a]/5 p-4 text-sm text-[#a8433a]">
          {feedback}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex h-[52px] w-full items-center justify-center rounded-sm bg-ink px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="mr-2.5 h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <Send className="ml-2.5 h-4 w-4" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
