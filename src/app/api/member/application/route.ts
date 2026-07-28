import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMemberId } from "@/lib/memberAuth";
import { getDocumentSignedUrl } from "@/lib/media";
import {
  personalDataSchema,
  companyDataSchema,
  businessProfileSchema,
  complianceAnswersSchema,
  documentsSchema,
  declarationsSchema,
  type DocumentEntry,
} from "@/lib/candidateSchemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STEP_SCHEMAS = {
  1: personalDataSchema,
  2: companyDataSchema,
  3: businessProfileSchema,
  4: complianceAnswersSchema,
  5: documentsSchema,
  6: declarationsSchema,
} as const;

const STEP_FIELDS = {
  1: "personalData",
  2: "companyData",
  3: "businessProfile",
  4: "complianceAnswers",
  5: "documents",
  6: "declarations",
} as const;

/** Retorna a candidatura completa do membro logado, com links assinados para os documentos. */
export async function GET() {
  const memberId = await getMemberId();
  if (!memberId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const application = await prisma.membershipApplication.findUnique({ where: { id: memberId } });
  if (!application) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const documents = ((application.documents as DocumentEntry[] | null) ?? []) as DocumentEntry[];
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => ({
      ...doc,
      url: doc.storageKey ? await getDocumentSignedUrl(doc.storageKey).catch(() => "") : "",
    }))
  );

  return NextResponse.json({
    application: {
      ...application,
      documents: documentsWithUrls,
    },
  });
}

/** Salva os dados de uma etapa do Portal do Candidato. */
export async function PATCH(req: Request) {
  const memberId = await getMemberId();
  if (!memberId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { step, data } = (body ?? {}) as { step?: number; data?: unknown };
  if (!step || !(step in STEP_SCHEMAS)) {
    return NextResponse.json({ error: "Etapa inválida" }, { status: 400 });
  }

  const schema = STEP_SCHEMAS[step as keyof typeof STEP_SCHEMAS];
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const field = STEP_FIELDS[step as keyof typeof STEP_FIELDS];
  const current = await prisma.membershipApplication.findUnique({
    where: { id: memberId },
    select: { wizardStep: true },
  });
  if (!current) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const nextWizardStep = Math.max(current.wizardStep, Math.min(step + 1, 7));

  const updated = await prisma.membershipApplication.update({
    where: { id: memberId },
    data: {
      [field]: parsed.data,
      wizardStep: nextWizardStep,
    },
  });

  return NextResponse.json({ ok: true, wizardStep: updated.wizardStep });
}
