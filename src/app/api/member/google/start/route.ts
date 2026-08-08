import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getGoogleAuthUrl } from "@/lib/googleAuth";
import { hasGoogleLogin } from "@/lib/env";
import { SITE_URL } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "ctb_google_oauth_state";

/** Passo 1 do login com Google: gera um "state" anti-CSRF, guarda num cookie
 *  de curta duração e redireciona pra tela de consentimento do Google. */
export async function GET() {
  if (!hasGoogleLogin) {
    return NextResponse.redirect(`${SITE_URL}/membro/login?googleError=not_configured`);
  }

  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(getGoogleAuthUrl(state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });
  return res;
}
