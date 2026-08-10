import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";
import { generateComplianceSummary, isAiSummaryEnabled } from "@/lib/aiCompliance";
import type { PersonalData, CompanyData, BusinessProfile, ComplianceAnswer } from "@/lib/candidateSchemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Gera (ou regenera) o resumo de compliance por IA de uma candidatura. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  if (!isAiSummaryEnabled()) {
    return NextResponse.json({ error: "Resumo por IA não configurado (ANTHROPIC_API_KEY)" }, { status: 503 });
  }

  const { id } = await params;
  const application = await prisma.membershipApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  try {
    const summary = await generateComplianceSummary({
      name: application.name,
      company: application.company,
      personalData: application.personalData as PersonalData | null,
      companyData: application.companyData as CompanyData | null,
      businessProfile: application.businessProfile as (BusinessProfile & Record<string, unknown>) | null,
      complianceAnswers: application.complianceAnswers as ComplianceAnswer[] | null,
    });
    const updated = await prisma.membershipApplication.update({
      where: { id },
      data: { aiSummary: summary, aiSummaryGeneratedAt: new Date() },
      select: { aiSummary: true, aiSummaryGeneratedAt: true },
    });
    return NextResponse.json({ ok: true, ...updated });
  } catch (err) {
    console.error("[admin/ai-summary] erro:", err);
    const message = err instanceof Error ? err.message : "Erro ao gerar resumo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
