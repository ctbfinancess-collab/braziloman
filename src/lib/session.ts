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
export type AdminSessionPayload = { type: "admin" };

export async function signMemberSession(applicationId: string): Promise<string> {
  return new SignJWT({ type: "member" } satisfies Omit<MemberSessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(applicationId)
    .setIssuedAt()
    .setExpirationTime(`${MEMBER_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function signAdminSession(): Promise<string> {
  return new SignJWT({ type: "admin" } satisfies AdminSessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE}s`)
    .sign(getSecretKey());
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
    return { type: "admin" };
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
