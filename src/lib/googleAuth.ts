import { env } from "./env";
import { SITE_URL } from "./email";

/**
 * Login com Google (Área do Membro) — fluxo OAuth 2.0 "Authorization Code"
 * feito na mão (sem lib), só com fetch. Documentação:
 * https://developers.google.com/identity/protocols/oauth2/web-server
 */

const REDIRECT_URI = `${SITE_URL}/api/member/google/callback`;

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(code: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Falha ao trocar código por token (${res.status})`);
  const json = await res.json();
  if (!json.access_token) throw new Error("Resposta do Google sem access_token");
  return json.access_token as string;
}

export type GoogleUserInfo = { email: string; emailVerified: boolean; name: string | null };

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Falha ao buscar perfil do Google (${res.status})`);
  const json = await res.json();
  return {
    email: String(json.email || "").toLowerCase(),
    emailVerified: Boolean(json.email_verified),
    name: json.name || null,
  };
}
