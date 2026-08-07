import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Últimos avisos institucionais da Câmara, pro sino de notificações do painel. */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  const session = token ? await verifyMemberSession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const notices = await prisma.chamberNotice.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, title: true, message: true, important: true, createdAt: true },
  });
  return NextResponse.json({ notices });
}
