"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

/**
 * Share options — honest, dependency-free: native share when available,
 * copy-to-clipboard fallback with visible feedback.
 */
export function ShareArticle({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard unavailable — ignore silently, button remains as indicator
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled — fall back to copy
      }
    }
    handleCopy();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
        Share
      </span>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Share this article"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link to this article"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink/70 transition-colors hover:border-gold hover:text-gold-deep"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-700" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <span aria-live="polite" className="text-xs text-ink/50">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
