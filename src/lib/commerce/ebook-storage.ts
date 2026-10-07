import "server-only";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error("Digital delivery is not configured.");
  return value;
}

export async function retrieveEbookPdf() {
  const baseUrl = new URL(required("SUPABASE_URL"));
  if (baseUrl.protocol !== "https:") throw new Error("Digital delivery is not configured.");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = required("EBOOK_STORAGE_BUCKET");
  const objectPath = required("EBOOK_STORAGE_OBJECT_PATH");
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(new URL(`/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${encodedPath}`, baseUrl), {
    headers: { Authorization: `Bearer ${serviceRoleKey}`, apikey: serviceRoleKey },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Digital delivery is unavailable.");
  const pdf = await response.arrayBuffer();
  if (pdf.byteLength === 0) throw new Error("Digital delivery is unavailable.");
  return pdf;
}
