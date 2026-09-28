import "server-only";

type Confirmation = { email: string; customerName: string; orderNumber: string; format: string; quantity: number; totalAmount: number; shippingMethod: string; statusUrl: string };

/** Provider-ready Resend delivery. It is deliberately a no-op until credentials exist. */
export async function sendOrderConfirmation(order: Confirmation) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) return { delivered: false, reason: "Email provider is not configured." };
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [order.email], subject: `Order confirmation ${order.orderNumber}`, text: `Hello ${order.customerName},\n\nThank you for ordering Behind the Mask (${order.format}, quantity ${order.quantity}). Total: $${(order.totalAmount / 100).toFixed(2)} USD. Shipping: ${order.shippingMethod}.\n\nTrack your order: ${order.statusUrl}` }) });
  return { delivered: response.ok, reason: response.ok ? undefined : "Email provider rejected the request." };
}
