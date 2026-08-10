import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession, ADMIN_COOKIE, type AdminSessionPayload } from "./session";
import { prisma } from "./prisma";

export type AdminRole = "FULL" | "PARTNERS_BENEFITS";

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

/** Nível de acesso da sessão atual — null se não estiver logado. Login
 *  "mestre" (sem conta individual, `sub` ausente) é sempre FULL; conta
 *  individual usa o `role` cadastrado em Usuários (AdminUser.role). Se a
 *  conta foi apagada mas a sessão ainda existe, trata como deslogado (nunca
 *  cai pra FULL por padrão). */
export async function getAdminRole(): Promise<AdminRole | null> {
  const session = await getAdminSession();
  if (!session) return null;
  if (!session.sub) return "FULL";
  if (!prisma) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: session.sub }, select: { role: true } });
  return user?.role ?? null;
}

export async function isFullAdmin(): Promise<boolean> {
  return (await getAdminRole()) === "FULL";
}

/** Guarda de página pra qualquer sessão admin válida (as duas roles) — usar
 *  no topo de páginas que as duas roles podem acessar (hoje só
 *  /admin/beneficios). Sem sessão, manda pro login. */
export async function requireAnyAdmin(): Promise<void> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
}

/** Guarda de página só pra admin completo — usar no topo de todas as outras
 *  páginas de /admin/*. Sem sessão, manda pro login; com sessão mas role
 *  PARTNERS_BENEFITS, manda pra única página que essa conta pode ver (nunca
 *  deixa a secretária cair numa tela cheia de erro/vazia). */
export async function requireFullAdmin(): Promise<void> {
  const role = await getAdminRole();
  if (!role) redirect("/admin/login");
  if (role !== "FULL") redirect("/admin/beneficios");
}
