"use client";

import { useState, useEffect } from "react";

/**
 * Newsletter signup — real backend (POST /api/newsletter stores the email).
 * States: idle → loading → success / error. Honest messaging, no fake claims.
 * Integration point: swap the fetch body handling for Mailchimp / ConvertKit
 * / Resend — see README ("Configuring the newsletter").
 */
export function NewsletterForm({
  tone = "light",
  compact = false,
  id = "newsletter",
}: {
  tone?: "light" | "dark";
  compact?: boolean;
  id?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 400);
    return () => clearTimeout(t);
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };

      if (!res.ok || !data.ok) {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setState("success");
      setMessage(data.message ?? "Thank you — you're on the list.");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  const inputTone =
    tone === "dark"
      ? "border-nightline bg-ink-soft text-ivory placeholder:text-ivory/40 focus:border-gold"
      : "border-hairline bg-white text-ink placeholder:text-ink/40 focus:border-gold";

  if (state === "success") {
    return (
      <p
        role="status"
        className={`text-sm leading-relaxed ${
          tone === "dark" ? "text-gold-soft" : "text-gold-deep"
        }`}
      >
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <label htmlFor={`${id}-email`} className="sr-only">
        Email address
      </label>
      <div className={`flex ${compact ? "flex-col gap-2.5" : "flex-col gap-2.5 sm:flex-row"}`}>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-12 flex-1 rounded-sm border px-4 text-sm outline-none transition-colors ${inputTone}`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex h-12 items-center justify-center rounded-sm bg-gold px-6 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? (
            <>
              <span
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
              />
              Subscribing…
            </>
          ) : (
            "Subscribe"
          )}
        </button>
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2.5 text-sm text-[#a8433a] dark:text-[#e0937f]"
        >
          {error}
        </p>
      ) : null}
      {state === "error" && !error ? (
        <p role="alert" className="mt-2.5 text-sm text-[#a8433a] dark:text-[#e0937f]">
          {message}
        </p>
      ) : null}
    </form>
  );
}
