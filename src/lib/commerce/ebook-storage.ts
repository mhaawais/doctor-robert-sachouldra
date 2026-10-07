import "server-only";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("Digital delivery is not configured.");
  return value;
}

function signedUrlLifetime() {
  const value = Number(process.env.EBOOK_DOWNLOAD_URL_TTL_SECONDS ?? "300");
  if (!Number.isInteger(value) || value < 60 || value > 900) throw new Error("Digital delivery is not configured.");
  return value;
}

export async function createEbookDownloadUrl() {
  const baseUrl = new URL(required("SUPABASE_URL"));
  if (baseUrl.protocol !== "https:") throw new Error("Digital delivery is not configured.");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = required("EBOOK_STORAGE_BUCKET");
  const objectPath = required("EBOOK_STORAGE_OBJECT_PATH");
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(new URL(`/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodedPath}`, baseUrl), {
    method: "POST",
    headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: signedUrlLifetime() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Digital delivery is unavailable.");
  const body = await response.json() as { signedURL?: string };
  if (!body.signedURL) throw new Error("Digital delivery is unavailable.");
  const storageApiBase = new URL("/storage/v1/", baseUrl);
  const signedUrl = new URL(body.signedURL.replace(/^\//, ""), storageApiBase);
  if (signedUrl.protocol !== "https:" || signedUrl.origin !== baseUrl.origin || !signedUrl.pathname.startsWith("/storage/v1/object/sign/")) throw new Error("Digital delivery is unavailable.");
  return signedUrl;
}
