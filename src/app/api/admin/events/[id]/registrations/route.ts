import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isFullAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lista os inscritos de um evento/missão (admin). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id: eventId } = await params;
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: { application: { select: { id: true, name: true, company: true, email: true } } },
  });

  return NextResponse.json({ registrations });
}

const updateSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

/** Admin confirma/cancela a inscrição de um associado. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isFullAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const { id: eventId } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  try {
    const registration = await prisma.eventRegistration.update({
      where: { id: parsed.data.registrationId, eventId },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true, registration });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
