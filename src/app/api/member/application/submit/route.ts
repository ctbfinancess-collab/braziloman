import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMemberId } from "@/lib/memberAuth";
import {
  personalDataSchema,
  companyDataSchema,
  businessProfileSchema,
  complianceAnswersSchema,
  declarationsSchema,
  COMPLIANCE_QUESTIONS,
  DOCUMENT_SLOTS_BR,
  DOCUMENT_SLOTS_FOREIGN,
  type DocumentEntry,
  type CompanyData,
} from "@/lib/candidateSchemas";
import { sendApplicationSubmittedEmail, sendNewSubmissionAdminEmail } from "@/lib/email";
import { generateComplianceSummary, isAiSummaryEnabled } from "@/lib/aiCompliance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const memberId = await getMemberId();
  if (!memberId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const application = await prisma.membershipApplication.findUnique({ where: { id: memberId } });
  if (!application) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const errors: string[] = [];

  const personal = personalDataSchema.safeParse(application.personalData);
  if (!personal.success) errors.push("Dados pessoais incompletos");

  const companyParsed = companyDataSchema.safeParse(application.companyData);
  if (!companyParsed.success) errors.push("Dados da empresa incompletos");

  const profile = businessProfileSchema.safeParse(application.businessProfile);
  if (!profile.success) errors.push("Perfil comercial incompleto");

  const compliance = complianceAnswersSchema.safeParse(application.complianceAnswers ?? []);
  if (!compliance.success || compliance.data.length < COMPLIANCE_QUESTIONS.length) {
    errors.push("Respostas de compliance incompletas");
  }

  const documents = ((application.documents as DocumentEntry[] | null) ?? []) as DocumentEntry[];
  if (companyParsed.success) {
    const entityType = (companyParsed.data as CompanyData).entityType;
    const requiredSlots = entityType === "br" ? DOCUMENT_SLOTS_BR : DOCUMENT_SLOTS_FOREIGN;
    const uploadedKeys = new Set(documents.map((d) => d.key));
    const missing = requiredSlots.filter(
      (s) => s.key !== "powerOfAttorney" && !uploadedKeys.has(s.key)
    );
    if (missing.length > 0) errors.push("Documentos obrigatórios pendentes");
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // corpo vazio é aceitável; a assinatura já deve estar salva na etapa 6
  }
  const declBody = (body as { signatureName?: string; signatureRole?: string }) ?? {};
  const storedDeclarations = (application.declarations ?? {}) as Record<string, unknown>;
  const declParsed = declarationsSchema.safeParse({
    ...storedDeclarations,
    signatureName: declBody.signatureName || storedDeclarations.signatureName,
    signatureRole: declBody.signatureRole || storedDeclarations.signatureRole,
  });
  if (!declParsed.success) errors.push("Declarações e assinatura incompletas");

  if (errors.length > 0) {
    return NextResponse.json({ error: "Cadastro incompleto", details: errors }, { status: 422 });
  }

  const finalDeclarations = {
    ...declParsed.data,
    signatureDate: new Date().toISOString(),
    signatureIp: clientIp(req),
  };

  await prisma.membershipApplication.update({
    where: { id: memberId },
    data: {
      status: "UNDER_REVIEW",
      submittedAt: new Date(),
      wizardStep: 7,
      declarations: finalDeclarations,
    },
  });

  try {
    await Promise.all([
      sendApplicationSubmittedEmail(application.email, application.name),
      sendNewSubmissionAdminEmail({ name: application.name, email: application.email, company: application.company }),
    ]);
  } catch (err) {
    console.error("[application/submit] erro ao enviar e-mails:", err);
  }

  if (isAiSummaryEnabled()) {
    try {
      const summary = await generateComplianceSummary({
        name: application.name,
        company: application.company,
        personalData: personal.success ? personal.data : null,
        companyData: companyParsed.success ? companyParsed.data : null,
        businessProfile: profile.success ? profile.data : null,
        complianceAnswers: compliance.success ? compliance.data : null,
      });
      await prisma.membershipApplication.update({
        where: { id: memberId },
        data: { aiSummary: summary, aiSummaryGeneratedAt: new Date() },
      });
    } catch (err) {
      console.error("[application/submit] erro ao gerar resumo de IA:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
