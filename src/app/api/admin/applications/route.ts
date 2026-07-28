import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const session = await verifyAdminSession(token);
  return Boolean(session);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  }

  const applications = await prisma.membershipApplication.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      role: true,
      sector: true,
      country: true,
      phone: true,
      message: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ applications });
}
