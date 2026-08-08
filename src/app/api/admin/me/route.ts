import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Identidade do admin logado — usado no cartão de perfil da sidebar. Sessões
 *  do login "mestre" (sem conta individual) voltam com `name: null`. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (session.sub && prisma) {
    const user = await prisma.adminUser.findUnique({ where: { id: session.sub }, select: { name: true, email: true } });
    if (user) return NextResponse.json({ name: user.name, email: user.email });
  }

  return NextResponse.json({ name: null, email: null });
}
