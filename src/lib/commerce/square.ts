import "server-only";

const squareBaseUrl = () => process.env.SQUARE_ENVIRONMENT === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";

export async function createSquarePayment(input: { sourceId: string; amountCents: number; idempotencyKey: string; orderNumber: string; email: string }) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) throw new Error("Square is not configured.");
  const response = await fetch(`${squareBaseUrl()}/v2/payments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Square-Version": process.env.SQUARE_API_VERSION ?? "2025-01-23" },
    body: JSON.stringify({ source_id: input.sourceId, idempotency_key: input.idempotencyKey, location_id: locationId, amount_money: { amount: input.amountCents, currency: "USD" }, reference_id: input.orderNumber, buyer_email_address: input.email, autocomplete: true }),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.errors?.[0]?.detail ?? "Square could not process the payment.");
  return body.payment as { id: string; order_id?: string; status: string };
}

export async function refundSquarePayment(paymentId: string, amountCents: number, idempotencyKey: string) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Square is not configured.");
  const response = await fetch(`${squareBaseUrl()}/v2/refunds`, { method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Square-Version": process.env.SQUARE_API_VERSION ?? "2025-01-23" }, body: JSON.stringify({ payment_id: paymentId, amount_money: { amount: amountCents, currency: "USD" }, idempotency_key: idempotencyKey }), cache: "no-store" });
  if (!response.ok) throw new Error("Square refund request failed.");
  return response.json();
}
