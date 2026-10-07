import "server-only";

export const BOOK_SLUG = "behind-the-mask";
export const CURRENCY = "USD";

export type DirectFormat = "PAPERBACK" | "HARDCOVER";
export type ProductFormat = DirectFormat | "EBOOK";

type PrintConfiguration = {
  format: DirectFormat;
  label: string;
  priceCents: number;
  podPackageId: string;
  pageCount: number;
  interiorUrl: string;
  coverUrl: string;
};

type EbookConfiguration = {
  format: "EBOOK";
  title: "Behind the Mask: A Doctor’s Battles with Purpose";
  label: "eBook";
  priceCents: 299;
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

export function ebookFormat(): EbookConfiguration {
  return { format: "EBOOK", title: "Behind the Mask: A Doctor’s Battles with Purpose", label: "eBook", priceCents: 299 };
}

export function productFormat(format: ProductFormat) {
  return format === "EBOOK" ? ebookFormat() : directFormat(format);
}

export function isPhysicalFormat(format: ProductFormat): format is DirectFormat {
  return format !== "EBOOK";
}

/** Prices may be rendered publicly, but always originate in server configuration. */
export function directCatalog() {
  const printFormats = (["PAPERBACK", "HARDCOVER"] as const).map((format) => {
    try { const value = directFormat(format); return { format, label: value.label, priceCents: value.priceCents }; }
    catch { return { format, label: format === "PAPERBACK" ? "Paperback" : "Hardcover", priceCents: null }; }
  });
  return [...printFormats, ebookFormat()];
}

function squareEnabled() {
  const clientEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "sandbox";
  const serverEnvironment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  if (!(["sandbox", "production"] as const).includes(clientEnvironment as "sandbox" | "production") || clientEnvironment !== serverEnvironment) return false;
  return Boolean(process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID && process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID && process.env.SQUARE_LOCATION_ID && process.env.SQUARE_ACCESS_TOKEN);
}

export function checkoutEnabled(format?: ProductFormat) {
  try {
    if (!squareEnabled()) return false;
    if (format === "EBOOK") return true;
    directFormat("PAPERBACK");
    directFormat("HARDCOVER");
    return Boolean(process.env.LULU_CLIENT_KEY && process.env.LULU_CLIENT_SECRET);
  } catch {
    return false;
  }
}
