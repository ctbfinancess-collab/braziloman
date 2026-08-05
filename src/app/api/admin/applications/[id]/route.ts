import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { getDocumentSignedUrl } from "@/lib/media";
import type { DocumentEntry, ComplianceAnswer } from "@/lib/candidateSchemas";
import {
  sendWelcomeEmail,
  sendInfoRequestedEmail,
  sendApprovedPendingPaymentEmail,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_VALUES = [
  "PENDING",
  "APPROVED",
  "INCOMPLETE",
  "AWAITING_DOCUMENTS",
  "UNDER_REVIEW",
  "INFO_REQUESTED",
  "CONDITIONALLY_APPROVED",
  "APPROVED_PENDING_PAYMENT",
  "ACTIVE",
  "REJECTED",
  "SUSPENDED",
] as const;

const patchSchema = z.object({
  status: z.enum(STATUS_VALUES).optional(),
  riskLevel: z.string().max(40).optional().nullable(),
  complianceNotes: z.string().max(4000).optional().nullable(),
  membershipCategory: z.string().max(120).optional().nullable(),
  annualContribution: z.number().int().min(1000).max(1_000_000).optional().nullable(),
});

/** Detalhe completo de uma candidatura para o painel de compliance do admin. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;
  const application = await prisma.membershipApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const documents = ((application.documents as DocumentEntry[] | null) ?? []) as DocumentEntry[];
  const documentsWithUrls = await Promise.all(
    documents.map(async (doc) => ({ ...doc, url: doc.storageKey ? await getDocumentSignedUrl(doc.storageKey).catch(() => "") : "" }))
  );

  const complianceAnswers = ((application.complianceAnswers as ComplianceAnswer[] | null) ?? []) as ComplianceAnswer[];
  const complianceWithUrls = await Promise.all(
    complianceAnswers.map(async (a) => ({
      ...a,
      documentSignedUrl: a.documentKey ? await getDocumentSignedUrl(a.documentKey).catch(() => "") : "",
    }))
  );

  const { passwordHash: _passwordHash, ...safeApplication } = application;

  return NextResponse.json({
    application: { ...safeApplication, documents: documentsWithUrls, complianceAnswers: complianceWithUrls },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  try {
    const before = await prisma.membershipApplication.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!before) return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });

    const updated = await prisma.membershipApplication.update({
      where: { id },
      data: parsed.data,
      select: { id: true, status: true, name: true, email: true, membershipCategory: true },
    });

    const statusChanged = parsed.data.status && parsed.data.status !== before.status;
    if (statusChanged) {
      try {
        if (updated.status === "INFO_REQUESTED") {
          await sendInfoRequestedEmail(updated.email, updated.name, parsed.data.complianceNotes || "Consulte seu painel para mais detalhes.");
        } else if (updated.status === "APPROVED_PENDING_PAYMENT") {
          await sendApprovedPendingPaymentEmail(updated.email, updated.name, updated.membershipCategory || "a definir");
        } else if (updated.status === "ACTIVE" || (updated.status === "APPROVED" && before.status !== "APPROVED")) {
          await sendWelcomeEmail(updated.email, updated.name);
        }
      } catch (err) {
        console.error("[admin/applications] erro ao enviar e-mail:", err);
      }
    }

    return NextResponse.json({ ok: true, application: updated });
  } catch {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  }
}
