import { cookies } from "next/headers";
import { verifyAdminSession, ADMIN_COOKIE, type AdminSessionPayload } from "./session";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const session = await verifyAdminSession(token);
  return Boolean(session);
}

/** Sessão admin completa (com `sub` = id do AdminUser, se for login individual). */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSession(token);
}
