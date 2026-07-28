import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyMemberSession, MEMBER_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const session = await verifyMemberSession(token);
  if (!session) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });

  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const application = await prisma.membershipApplication.findUnique({
    where: { id: session.sub },
    select: {
      name: true,
      email: true,
      company: true,
      role: true,
      sector: true,
      country: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  });

  if (!application) return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });

  return NextResponse.json({ member: application });
}
