import "server-only";

export const BOOK_SLUG = "behind-the-mask";
export const CURRENCY = "USD";

export type DirectFormat = "PAPERBACK" | "HARDCOVER";

type PrintConfiguration = {
  format: DirectFormat;
  label: string;
  priceCents: number;
  podPackageId: string;
  pageCount: number;
  interiorUrl: string;
  coverUrl: string;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be configured before direct checkout is enabled.`);
  return value;
}

function positiveInteger(name: string) {
  const value = Number(required(name));
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer.`);
  return value;
}

function buildFormat(format: DirectFormat, label: string): PrintConfiguration {
  const prefix = `BOOK_${format}`;
  return {
    format,
    label,
    priceCents: positiveInteger(`${prefix}_PRICE_CENTS`),
    podPackageId: required(`${prefix}_LULU_POD_PACKAGE_ID`),
    pageCount: positiveInteger(`${prefix}_PAGE_COUNT`),
    interiorUrl: required(`${prefix}_INTERIOR_PDF_URL`),
    coverUrl: required(`${prefix}_COVER_PDF_URL`),
  };
}

export function directFormat(format: DirectFormat) {
  return format === "PAPERBACK" ? buildFormat("PAPERBACK", "Paperback") : buildFormat("HARDCOVER", "Hardcover");
}

/** Prices may be rendered publicly, but always originate in server configuration. */
export function directCatalog() {
  return (["PAPERBACK", "HARDCOVER"] as const).map((format) => {
    try { const value = directFormat(format); return { format, label: value.label, priceCents: value.priceCents }; }
    catch { return { format, label: format === "PAPERBACK" ? "Paperback" : "Hardcover", priceCents: null }; }
  });
}

export function checkoutEnabled() {
  try {
    directFormat("PAPERBACK");
    directFormat("HARDCOVER");
    const clientEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox";
    const serverEnvironment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
    if (!(["sandbox", "production"] as const).includes(clientEnvironment as "sandbox" | "production") || clientEnvironment !== serverEnvironment) return false;
    return Boolean(process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID && process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID && process.env.SQUARE_LOCATION_ID && process.env.SQUARE_ACCESS_TOKEN && process.env.LULU_CLIENT_KEY && process.env.LULU_CLIENT_SECRET);
  } catch {
    return false;
  }
}
