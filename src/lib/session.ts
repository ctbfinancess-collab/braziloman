import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

/**
 * Sessões da Área do Membro e do Admin — cookies httpOnly assinados (JWT/jose).
 * Requer SESSION_SECRET configurado (ver .env.example).
 */

export const MEMBER_COOKIE = "ctb_member_session";
export const ADMIN_COOKIE = "ctb_admin_session";

const MEMBER_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias
const ADMIN_MAX_AGE = 60 * 60 * 24; // 1 dia

function getSecretKey(): Uint8Array {
  if (!env.SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET não configurado. Defina essa variável de ambiente para habilitar login."
    );
  }
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export type MemberSessionPayload = { type: "member"; sub: string };
/** `sub` = id do AdminUser, quando o login foi feito com conta individual
 *  (aba "Usuários"). Ausente nas sessões do login "mestre" (ADMIN_PASSWORD
 *  compartilhada) — mantido por compatibilidade, nunca removido. */
export type AdminSessionPayload = { type: "admin"; sub?: string };
export type PasswordResetPayload = { type: "password-reset"; sub: string };
/** Token intermediário entre "senha confirmada" e "sessão liberada", só
 *  quando a conta individual tem 2FA ativo. Nunca autentica sozinho no
 *  admin — só serve pra provar, no passo 2 (código do Authenticator), que
 *  o passo 1 (senha) já foi conferido. */
export type AdminTwoFaPendingPayload = { type: "admin-2fa-pending"; sub: string };

const PASSWORD_RESET_MAX_AGE = 60 * 60; // 1 hora
const TWO_FA_PENDING_MAX_AGE = 5 * 60; // 5 minutos

export async function signMemberSession(applicationId: string): Promise<string> {
  return new SignJWT({ type: "member" } satisfies Omit<MemberSessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(applicationId)
    .setIssuedAt()
    .setExpirationTime(`${MEMBER_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function signAdminSession(userId?: string): Promise<string> {
  let jwt = new SignJWT({ type: "admin" } satisfies Omit<AdminSessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE}s`);
  if (userId) jwt = jwt.setSubject(userId);
  return jwt.sign(getSecretKey());
}

export async function signAdminTwoFaPending(userId: string): Promise<string> {
  return new SignJWT({ type: "admin-2fa-pending" } satisfies Omit<AdminTwoFaPendingPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${TWO_FA_PENDING_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifyAdminTwoFaPending(token: string): Promise<AdminTwoFaPendingPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.type !== "admin-2fa-pending" || typeof payload.sub !== "string") return null;
    return { type: "admin-2fa-pending", sub: payload.sub };
  } catch {
    return null;
  }
}

export async function signPasswordResetToken(applicationId: string): Promise<string> {
  return new SignJWT({ type: "password-reset" } satisfies Omit<PasswordResetPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(applicationId)
    .setIssuedAt()
    .setExpirationTime(`${PASSWORD_RESET_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifyPasswordResetToken(token: string): Promise<PasswordResetPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.type !== "password-reset" || typeof payload.sub !== "string") return null;
    return { type: "password-reset", sub: payload.sub };
  } catch {
    return null;
  }
}

export async function verifyMemberSession(token: string): Promise<MemberSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.type !== "member" || typeof payload.sub !== "string") return null;
    return { type: "member", sub: payload.sub };
  } catch {
    return null;
  }
}

export async function verifyAdminSession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.type !== "admin") return null;
    return { type: "admin", sub: typeof payload.sub === "string" ? payload.sub : undefined };
  } catch {
    return null;
  }
}

export const memberCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MEMBER_MAX_AGE,
};

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ADMIN_MAX_AGE,
};
