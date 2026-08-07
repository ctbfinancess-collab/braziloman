import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  kind: z.enum(["EVENTO", "MISSAO"]),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  date: z.string().datetime().or(z.string().min(1)),
  location: z.string().max(200).optional().nullable(),
});

/** Lista todos os eventos/missões (admin) — mais recentes primeiro. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  const events = await prisma.chamberEvent.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });

  const event = await prisma.chamberEvent.create({
    data: {
      kind: parsed.data.kind,
      title: parsed.data.title,
      description: parsed.data.description || null,
      date: new Date(parsed.data.date),
      location: parsed.data.location || null,
    },
  });

  return NextResponse.json({ ok: true, event });
}
