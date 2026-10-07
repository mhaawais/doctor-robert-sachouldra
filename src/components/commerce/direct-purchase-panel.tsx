"use client";

import Link from "next/link";
import { useState } from "react";

type Format = "PAPERBACK" | "HARDCOVER" | "EBOOK";

export function DirectPurchasePanel({ catalog }: { catalog: { format: Format; label: string; priceCents: number | null }[] }) {
  const [format, setFormat] = useState<Format>("PAPERBACK");
  return <div className="mt-10 border-t border-nightline pt-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.24em] text-gold-soft">Choose your edition</p><p className="mt-2 text-sm text-ivory/60">Secure checkout with a live shipping quote for print editions or instant digital delivery.</p></div><span className="rounded-full border border-gold/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-gold-soft">Direct from author</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3" role="group" aria-label="Book format">{catalog.map((edition) => <button key={edition.format} type="button" onClick={() => setFormat(edition.format)} className={`rounded-sm border p-4 text-left transition-all ${format === edition.format ? "border-gold bg-gold text-ink shadow-[0_14px_30px_-20px_rgba(217,198,154,.9)]" : "border-ivory/20 bg-white/5 text-ivory hover:-translate-y-0.5 hover:border-gold/70 hover:bg-white/10"}`}><span className="block text-sm font-semibold">{edition.label}</span><span className={`mt-1 block text-xs ${format === edition.format ? "text-ink/70" : "text-ivory/55"}`}>{edition.format === "PAPERBACK" ? "A classic, portable edition" : edition.format === "HARDCOVER" ? "A lasting library edition" : "Secure digital delivery"}{edition.priceCents !== null ? ` · $${(edition.priceCents / 100).toFixed(2)}` : ""}</span></button>)}</div><Link href={`/checkout?format=${format.toLowerCase()}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-sm bg-gold px-7 text-sm font-semibold uppercase tracking-[.12em] text-ink shadow-[0_15px_28px_-16px_rgba(217,198,154,.8)] transition-all hover:-translate-y-0.5 hover:bg-gold-soft">Buy the book</Link></div>;
}
