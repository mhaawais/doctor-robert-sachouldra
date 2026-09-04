"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/**
 * Article body renderer — lightweight markdown with editorial typography.
 */
export function ArticleBody({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("space-y-6 text-[17px] leading-[1.85] text-slate-body", className)}>
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="pt-6 font-serif text-[1.65rem] leading-snug text-ink sm:text-[1.85rem]">
              {children}
            </h2>
          ),
          p: ({ children }) => <p className="text-pretty">{children}</p>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gold bg-ivory-deep/50 py-4 pl-6 pr-4 font-serif text-xl italic leading-relaxed text-ink">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="space-y-3 pl-1 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.72em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-gold">
              {children}
            </ul>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-gold-deep underline decoration-gold/40 underline-offset-4 hover:text-ink">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
