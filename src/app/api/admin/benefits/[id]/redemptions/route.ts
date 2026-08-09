import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Histórico de "Usar benefício" de um benefício específico — associado,
 *  empresa, data e hora. Usado no painel administrativo (item 8 do roteiro
 *  de frequência de uso: "histórico com associado, data e hora"). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  const redemptions = await prisma.benefitRedemption.findMany({
    where: { benefitId: id, action: "use" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      application: { select: { name: true, company: true } },
    },
  });

  return NextResponse.json({
    redemptions: redemptions.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      memberName: r.application.name,
      memberCompany: r.application.company,
    })),
  });
}
