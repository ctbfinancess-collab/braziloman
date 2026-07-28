import { cookies } from "next/headers";
import { verifyMemberSession, MEMBER_COOKIE } from "./session";

/** Retorna o id da MembershipApplication da sessão de membro atual, ou null. */
export async function getMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyMemberSession(token);
  return session?.sub ?? null;
}
