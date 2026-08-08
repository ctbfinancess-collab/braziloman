import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForAccessToken, fetchGoogleUserInfo } from "@/lib/googleAuth";
import { hasGoogleLogin } from "@/lib/env";
import { signMemberSession, MEMBER_COOKIE, memberCookieOptions } from "@/lib/session";
import { SITE_URL } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "ctb_google_oauth_state";
const LOGIN_URL = `${SITE_URL}/membro/login`;

function fail(reason: string) {
  return NextResponse.redirect(`${LOGIN_URL}?googleError=${reason}`);
}

/** Passo 2 do login com Google: recebe o "code", confirma o "state" (anti-CSRF),
 *  troca por um access token, busca o e-mail e casa com um associado existente
 *  (MembershipApplication) — mesma regra do login por senha (PENDING/REJECTED
 *  não entram, o resto vai pro painel e a própria página decide o que mostrar). */
export async function GET(req: Request) {
  if (!hasGoogleLogin) return fail("not_configured");
  if (!prisma) return fail("no_database");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${STATE_COOKIE}=`))
    ?.split("=")[1];

  if (!code) return fail("missing_code");
  if (!state || !cookieState || state !== cookieState) return fail("invalid_state");

  let email: string;
  try {
    const accessToken = await exchangeCodeForAccessToken(code);
    const info = await fetchGoogleUserInfo(accessToken);
    if (!info.emailVerified || !info.email) return fail("email_not_verified");
    email = info.email;
  } catch (err) {
    console.error("[member/google/callback] erro no OAuth:", err);
    return fail("oauth_failed");
  }

  const application = await prisma.membershipApplication.findUnique({ where: { email } });
  if (!application) return fail("not_a_member");
  if (application.status === "PENDING") return fail("pending");
  if (application.status === "REJECTED") return fail("rejected");

  const token = await signMemberSession(application.id);
  const res = NextResponse.redirect(`${SITE_URL}/membro/painel`);
  res.cookies.set(MEMBER_COOKIE, token, memberCookieOptions);
  res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
