import "server-only";
import { directFormat, type DirectFormat } from "./config";
import type { QuoteInput } from "./validation";

const apiBase = () => process.env.LULU_API_ENVIRONMENT === "production" ? "https://api.lulu.com" : "https://api.sandbox.lulu.com";

export class LuluRequestError extends Error {
  constructor(readonly diagnostic: { operation: string; status: number; detail?: string }) {
    super(`Lulu request failed (HTTP ${diagnostic.status})${diagnostic.detail ? `: ${diagnostic.detail}` : ""}`);
  }
}

type CachedToken = { value: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

async function token(forceRefresh = false) {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
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
    throw new LuluRequestError({ operation: "POST OAuth token", status: response.status, detail });
  }
  const expiresInSeconds = typeof body.expires_in === "number" && body.expires_in > 0 ? body.expires_in : 60;
  cachedToken = { value: body.access_token as string, expiresAt: Date.now() + Math.max(1, expiresInSeconds - 30) * 1000 };
  return cachedToken.value;
}

function luluAddress(input: QuoteInput) {
  return { name: `${input.firstName} ${input.lastName}`, email: input.email, phone_number: input.phone || undefined, street1: input.address1, street2: input.address2 || undefined, city: input.city, state_code: input.state, postcode: input.postalCode, country_code: input.country };
}

function lineItem(format: DirectFormat, quantity: number) {
  const config = directFormat(format);
  return { external_id: `behind-the-mask-${format.toLowerCase()}`, pod_package_id: config.podPackageId, quantity, page_count: config.pageCount, interior: { source_url: config.interiorUrl }, cover: { source_url: config.coverUrl } };
}

const sensitiveLuluField = /token|secret|authorization|client.?key|source.?url|pdf|email|phone|address|name/i;

function safeLuluErrorValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (typeof value === "string") return value.replace(/https?:\/\/\S+/gi, "[redacted-url]").slice(0, 500);
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => safeLuluErrorValue(item, depth + 1));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([field, item]) => [field, sensitiveLuluField.test(field) ? "[redacted]" : safeLuluErrorValue(item, depth + 1)]));
}

function luluErrorDetail(body: unknown) {
  const safeBody = safeLuluErrorValue(body);
  if (safeBody === null || safeBody === undefined) return undefined;
  const detail = typeof safeBody === "string" ? safeBody : JSON.stringify(safeBody);
  return detail && detail !== "{}" ? detail.slice(0, 1000) : undefined;
}

async function authorizedFetch(url: string, init: RequestInit) {
  const send = async (forceRefresh = false) => fetch(url, { ...init, headers: { Authorization: `Bearer ${await token(forceRefresh)}`, ...(init.headers ?? {}) }, cache: "no-store" });
  let response = await send();
  if (response.status === 401) { cachedToken = null; response = await send(true); }
  return response;
}

async function luluFetch(path: string, init: RequestInit) {
  const response = await authorizedFetch(`${apiBase()}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof body?.detail === "string" ? safeLuluErrorValue(body.detail) as string : typeof body?.message === "string" ? safeLuluErrorValue(body.message) as string : luluErrorDetail(body);
    throw new LuluRequestError({ operation: `${init.method ?? "GET"} ${path}`, status: response.status, detail });
  }
  return body;
}

export async function shippingOptions(input: QuoteInput) {
  const config = directFormat(input.format);
  return luluFetch("/shipping-options/", {
    method: "POST",
    body: JSON.stringify({
      currency: "USD",
      line_items: [{ pod_package_id: config.podPackageId, page_count: config.pageCount, quantity: input.quantity }],
      shipping_address: {
        name: `${input.firstName} ${input.lastName}`,
        street1: input.address1,
        street2: input.address2 || "",
        city: input.city,
        state: input.state,
        postcode: input.postalCode,
        country: input.country,
      },
    }),
  });
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
    const response = await authorizedFetch(url, {});
    if (response.status === 404) return null;
    const body = await response.json();
    if (!response.ok) return "unknown";
    const item = Array.isArray(body) ? body[0] : body.print_job ?? body;
    return item?.id ? { id: String(item.id), status: typeof item.status === "string" ? item.status : item.status?.name } : null;
  } catch { return "unknown"; }
}
