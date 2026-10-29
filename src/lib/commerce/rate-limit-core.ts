import { createHash } from "crypto";

export type TrustedHeaderSource = { get(name: string): string | null };

export function requesterIdentity(request: Request | TrustedHeaderSource) {
  // Vercel supplies both headers and overwrites the public client IP header.
  // Outside Vercel, do not trust caller-provided forwarding headers.
  const requestHeaders = "headers" in request ? request.headers : request;
  const vercelRequest = requestHeaders.get("x-vercel-id");
  const vercelIp = requestHeaders.get("x-vercel-forwarded-for")?.trim();
  return vercelRequest && vercelIp ? vercelIp : "anonymous";
}

export function rateLimitKey(scope: string, request: Request | TrustedHeaderSource, windowMs: number, now: Date) {
  const identityHash = createHash("sha256").update(requesterIdentity(request)).digest("hex").slice(0, 24);
  const slot = Math.floor(now.getTime() / windowMs);
  return { key: `${scope}:${identityHash}:${slot}`, slot };
}
