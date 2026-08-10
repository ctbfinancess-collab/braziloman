import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isFullAdmin())) {
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
