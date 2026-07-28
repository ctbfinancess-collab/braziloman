import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const session = await verifyAdminSession(token);
  return Boolean(session);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido" }, { status: 422 });
  }

  try {
    const updated = await prisma.membershipApplication.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, application: updated });
  } catch {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  }
}
