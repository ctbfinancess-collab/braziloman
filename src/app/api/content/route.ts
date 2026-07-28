import { NextResponse } from "next/server";
import { getEffectiveContent } from "@/lib/contentOverrides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Conteúdo efetivo do site (padrões + substituições do admin). Público, sem autenticação. */
export async function GET() {
  const effective = await getEffectiveContent();
  return NextResponse.json(effective, {
    headers: { "Cache-Control": "no-store" },
  });
}
