import { createHash } from "crypto";

export function requesterIdentity(request: Request) {
  // Vercel supplies both headers and overwrites the public client IP header.
  // Outside Vercel, do not trust caller-provided forwarding headers.
  const vercelRequest = request.headers.get("x-vercel-id");
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.trim();
  return vercelRequest && vercelIp ? vercelIp : "anonymous";
}

export function rateLimitKey(scope: string, request: Request, windowMs: number, now: Date) {
  const identityHash = createHash("sha256").update(requesterIdentity(request)).digest("hex").slice(0, 24);
  const slot = Math.floor(now.getTime() / windowMs);
  return { key: `${scope}:${identityHash}:${slot}`, slot };
}
