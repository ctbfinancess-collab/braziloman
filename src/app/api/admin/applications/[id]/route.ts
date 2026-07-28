import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/email";

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
    const before = await prisma.membershipApplication.findUnique({
      where: { id },
      select: { status: true },
    });

    const updated = await prisma.membershipApplication.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true, name: true, email: true },
    });

    if (parsed.data.status === "APPROVED" && before?.status !== "APPROVED") {
      try {
        await sendWelcomeEmail(updated.email, updated.name);
      } catch (err) {
        console.error("[admin/applications] erro ao enviar e-mail de boas-vindas:", err);
      }
    }

    return NextResponse.json({ ok: true, application: { id: updated.id, status: updated.status } });
  } catch {
    return NextResponse.json({ error: "Associado não encontrado" }, { status: 404 });
  }
}
