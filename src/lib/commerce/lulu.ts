import "server-only";
import { directFormat, type DirectFormat } from "./config";
import type { QuoteInput } from "./validation";

const apiBase = () => process.env.LULU_API_ENVIRONMENT === "production" ? "https://api.lulu.com" : "https://api.sandbox.lulu.com";

async function token() {
  const tokenUrl = process.env.LULU_OAUTH_TOKEN_URL;
  const key = process.env.LULU_CLIENT_KEY;
  const secret = process.env.LULU_CLIENT_SECRET;
  if (!tokenUrl || !key || !secret) throw new Error("Lulu is not configured.");
  const basicCredentials = Buffer.from(`${key}:${secret}`, "utf8").toString("base64");
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.access_token) {
    const detail = typeof body?.error_description === "string" ? body.error_description : typeof body?.error === "string" ? body.error : undefined;
    throw new Error(`Lulu authentication failed (HTTP ${response.status})${detail ? `: ${detail}` : ""}`);
  }
  return body.access_token as string;
}

function luluAddress(input: QuoteInput) {
  return { name: `${input.firstName} ${input.lastName}`, email: input.email, phone_number: input.phone || undefined, street1: input.address1, street2: input.address2 || undefined, city: input.city, state_code: input.state, postcode: input.postalCode, country_code: input.country };
}

function lineItem(format: DirectFormat, quantity: number) {
  const config = directFormat(format);
  return { external_id: `behind-the-mask-${format.toLowerCase()}`, pod_package_id: config.podPackageId, quantity, page_count: config.pageCount, interior: { source_url: config.interiorUrl }, cover: { source_url: config.coverUrl } };
}

async function luluFetch(path: string, init: RequestInit) {
  const response = await fetch(`${apiBase()}${path}`, { ...init, headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json", ...(init.headers ?? {}) }, cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.detail ?? body.message ?? "Lulu request failed.");
  return body;
}

export async function shippingOptions(input: QuoteInput) {
  const config = directFormat(input.format);
  return luluFetch("/shipping-options/", { method: "POST", body: JSON.stringify({ pod_package_id: config.podPackageId, page_count: config.pageCount, quantity: input.quantity, country: input.country, currency: "USD" }) });
}

export async function costCalculation(input: QuoteInput, shippingMethod: string) {
  return luluFetch("/print-job-cost-calculations/", { method: "POST", body: JSON.stringify({ line_items: [lineItem(input.format, input.quantity)], shipping_address: luluAddress(input), shipping_option: shippingMethod }) });
}

export async function createPrintJob(input: QuoteInput & { orderNumber: string; shippingMethod: string }) {
  return luluFetch("/print-jobs/", { method: "POST", body: JSON.stringify({ external_id: input.orderNumber, contact_email: input.email, shipping_level: input.shippingMethod, line_items: [lineItem(input.format, input.quantity)], shipping_address: luluAddress(input) }) });
}

export async function getPrintJob(id: string) { return luluFetch(`/print-jobs/${id}/`, { method: "GET" }); }

/**
 * Lulu's external-id lookup semantics must be verified in sandbox. Until an
 * approved lookup URL template is configured, retries fail closed to manual review.
 */
export async function reconcilePrintJob(externalId: string): Promise<{ id: string; status?: string } | null | "unknown"> {
  const template = process.env.LULU_PRINT_JOB_LOOKUP_URL_TEMPLATE;
  if (!template || !template.includes("{externalId}")) return "unknown";
  try {
    const url = template.replace("{externalId}", encodeURIComponent(externalId));
    const response = await fetch(url, { headers: { Authorization: `Bearer ${await token()}` }, cache: "no-store" });
    if (response.status === 404) return null;
    const body = await response.json();
    if (!response.ok) return "unknown";
    const item = Array.isArray(body) ? body[0] : body.print_job ?? body;
    return item?.id ? { id: String(item.id), status: typeof item.status === "string" ? item.status : item.status?.name } : null;
  } catch { return "unknown"; }
}
