import "server-only";

type BrowserWriteRejection = { status: number; error: string };

function configuredSiteOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  try { return new URL(siteUrl).origin; }
  catch { return null; }
}

/**
 * Guards JSON endpoints intended for same-origin browser form submissions.
 * Webhooks and token-authenticated server endpoints intentionally do not use it.
 */
export function browserWriteRejection(request: Request): BrowserWriteRejection | null {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return { status: 415, error: "Unsupported request format." };

  if (request.headers.get("sec-fetch-site")?.toLowerCase() === "cross-site") {
    return { status: 403, error: "This request could not be verified." };
  }

  // Some privacy-focused browsers and non-browser clients omit Origin. A
  // present Origin, however, must always exactly match the configured site.
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const expectedOrigin = configuredSiteOrigin();
  if (!expectedOrigin || origin !== expectedOrigin) {
    return { status: 403, error: "This request could not be verified." };
  }
  return null;
}
