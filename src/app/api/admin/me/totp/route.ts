import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, generateTotpUri, verifyTotpCode } from "@/lib/totp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 2FA é por conta individual — sessões da senha mestra (sem `sub`) não têm
 *  o que ativar aqui; a pessoa precisa logar com a própria conta primeiro. */
async function requireIndividualSession() {
  const session = await getAdminSession();
  if (!session) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) } as const;
  if (!session.sub) {
    return {
      error: NextResponse.json(
        { error: "2FA só está disponível pra contas individuais (Usuários), não pela senha mestra." },
        { status: 400 }
      ),
    } as const;
  }
  if (!prisma) return { error: NextResponse.json({ error: "Banco de dados indisponível" }, { status: 503 }) } as const;
  return { userId: session.sub } as const;
}

/** Status atual do 2FA da conta logada. */
export async function GET() {
  const ctx = await requireIndividualSession();
  if ("error" in ctx) return ctx.error;

  const user = await prisma!.adminUser.findUnique({ where: { id: ctx.userId }, select: { totpEnabled: true } });
  if (!user) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  return NextResponse.json({ available: true, enabled: user.totpEnabled });
}

/** Gera um novo segredo (ainda não ativa — só depois do POST /confirm) e
 *  devolve o QR code pra escanear no Authenticator. */
export async function POST() {
  const ctx = await requireIndividualSession();
  if ("error" in ctx) return ctx.error;

  const user = await prisma!.adminUser.findUnique({ where: { id: ctx.userId }, select: { email: true } });
  if (!user) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });

  const secret = await generateTotpSecret();
  await prisma!.adminUser.update({ where: { id: ctx.userId }, data: { totpSecret: secret, totpEnabled: false } });

  const uri = await generateTotpUri(secret, user.email);
  const qrDataUrl = await QRCode.toDataURL(uri, { errorCorrectionLevel: "M", margin: 1, width: 240 });
  return NextResponse.json({ otpauthUri: uri, qrDataUrl, secret });
}

/** Confirma o setup (código digitado bate com o secret pendente) → ativa. */
export async function PATCH(req: Request) {
  const ctx = await requireIndividualSession();
  if ("error" in ctx) return ctx.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { code } = (body ?? {}) as { code?: string };
  if (!code) return NextResponse.json({ error: "Informe o código" }, { status: 422 });

  const user = await prisma!.adminUser.findUnique({ where: { id: ctx.userId }, select: { totpSecret: true } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: "Nenhum setup pendente. Gere o QR code de novo." }, { status: 400 });
  }

  const valid = await verifyTotpCode(user.totpSecret, code);
  if (!valid) return NextResponse.json({ error: "Código inválido." }, { status: 401 });

  await prisma!.adminUser.update({ where: { id: ctx.userId }, data: { totpEnabled: true } });
  return NextResponse.json({ ok: true });
}

/** Desativa — exige o código atual do Authenticator (não só a sessão), pra
 *  quem sequestrar a sessão sozinha não conseguir desligar o 2FA. */
export async function DELETE(req: Request) {
  const ctx = await requireIndividualSession();
  if ("error" in ctx) return ctx.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { code } = (body ?? {}) as { code?: string };

  const user = await prisma!.adminUser.findUnique({ where: { id: ctx.userId }, select: { totpSecret: true, totpEnabled: true } });
  if (!user?.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ ok: true }); // já estava desativado
  }

  if (!code || !(await verifyTotpCode(user.totpSecret, code))) {
    return NextResponse.json({ error: "Código inválido." }, { status: 401 });
  }

  await prisma!.adminUser.update({ where: { id: ctx.userId }, data: { totpEnabled: false, totpSecret: null } });
  return NextResponse.json({ ok: true });
}
