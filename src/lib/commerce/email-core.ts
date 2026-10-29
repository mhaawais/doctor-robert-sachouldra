export type ResendPayload = { from: string; recipient: string; replyTo?: string; subject: string; text: string; html: string };
type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export async function sendResendEmail(fetcher: FetchLike, eventKey: string, apiKey: string, payload: ResendPayload) {
  const response = await fetcher("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": eventKey },
    body: JSON.stringify({ from: payload.from, to: [payload.recipient], ...(payload.replyTo ? { reply_to: payload.replyTo } : {}), subject: payload.subject, text: payload.text, html: payload.html }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null) as { id?: string } | null;
  return { ok: response.ok, status: response.status, providerMessageId: body?.id ?? null };
}
