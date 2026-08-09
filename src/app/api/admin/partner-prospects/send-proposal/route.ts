import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { sendPartnerProposalBatch } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    prospectIds: z.array(z.string().min(1)).min(1).max(500),
    subject: z.string().min(1).max(200),
    // No modelo oficial isso é só uma observação extra opcional; na mensagem
    // personalizada é o corpo inteiro do e-mail (aí sim, obrigatório).
    message: z.string().max(8000).optional().default(""),
    imageUrl: z.string().max(500).optional().nullable(),
    template: z.enum(["custom", "official"]).optional().default("custom"),
    language: z.enum(["pt", "en"]).optional().default("pt"),
    attachmentUrl: z.string().max(500).optional().nullable(),
    attachmentFilename: z.string().max(200).optional().nullable(),
  })
  .refine((data) => data.template === "official" || data.message.trim().length > 0, {
    message: "Escreva a mensagem ou use o modelo oficial.",
    path: ["message"],
  });

/** Disparo em massa de e-mail de proposta ("tipo e-mail marketing") pro
 *  funil de Captação — usado pela secretária pra abordar várias empresas de
 *  uma vez. Só considera prospects com e-mail de contato cadastrado; os sem
 *  e-mail voltam na lista de "pulados" pra quem chamou decidir o que fazer. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const prospects = await prisma.partnerProspect.findMany({
    where: { id: { in: parsed.data.prospectIds } },
    select: { id: true, companyName: true, contactEmail: true },
  });

  const skippedNoEmail = prospects.filter((p) => !p.contactEmail).map((p) => p.companyName);
  const recipients = prospects
    .filter((p): p is typeof p & { contactEmail: string } => !!p.contactEmail)
    .map((p) => ({ prospectId: p.id, to: p.contactEmail, companyName: p.companyName }));

  const { sentProspectIds, failed } = await sendPartnerProposalBatch(recipients, {
    subject: parsed.data.subject,
    message: parsed.data.message,
    imageUrl: parsed.data.imageUrl || null,
    template: parsed.data.template,
    language: parsed.data.language,
    attachmentUrl: parsed.data.attachmentUrl || null,
    attachmentFilename: parsed.data.attachmentFilename || null,
  });

  if (sentProspectIds.length > 0) {
    await prisma.partnerProspect.updateMany({
      where: { id: { in: sentProspectIds } },
      data: { lastProposalSentAt: new Date(), proposalsSentCount: { increment: 1 } },
    });
  }

  const failedNames = failed.map((f) => prospects.find((p) => p.id === f.prospectId)?.companyName ?? f.prospectId);

  return NextResponse.json({
    ok: true,
    sentCount: sentProspectIds.length,
    skippedNoEmail,
    failedNames,
  });
}
