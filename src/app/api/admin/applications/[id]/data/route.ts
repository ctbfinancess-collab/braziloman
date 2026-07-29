import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";
import { personalDataSchema, companyDataSchema, businessProfileSchema } from "@/lib/candidateSchemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELD_SCHEMAS = {
  personalData: personalDataSchema,
  companyData: companyDataSchema,
  businessProfile: businessProfileSchema,
} as const;

type EditableField = keyof typeof FIELD_SCHEMAS;

/** Permite ao admin corrigir diretamente dados já enviados pelo candidato. */
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

  const { field, data } = (body ?? {}) as { field?: string; data?: unknown };
  if (!field || !(field in FIELD_SCHEMAS)) {
    return NextResponse.json({ error: "Campo inválido" }, { status: 400 });
  }

  const schema = FIELD_SCHEMAS[field as EditableField];
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 422 });
  }

  try {
    await prisma.membershipApplication.update({
      where: { id },
      data: { [field as EditableField]: parsed.data },
    });
  } catch {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
