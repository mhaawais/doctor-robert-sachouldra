import { NextResponse } from "next/server";
import { constantTimeEquals } from "@/lib/commerce/security";
import { processTransactionalEmails } from "@/lib/commerce/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!expected || !constantTimeEquals(authorization, expected)) return new NextResponse("Unauthorized", { status: 401 });
  const result = await processTransactionalEmails(10);
  return NextResponse.json({ ok: true, ...result });
}
