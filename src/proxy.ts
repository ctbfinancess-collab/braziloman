import { NextResponse, type NextRequest } from "next/server";
import { verifyMemberSession, verifyAdminSession, MEMBER_COOKIE, ADMIN_COOKIE } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/membro/painel")) {
    const token = req.cookies.get(MEMBER_COOKIE)?.value;
    const session = token ? await verifyMemberSession(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/membro/login";
      return NextResponse.redirect(url);
    }
  }

  if (
    pathname.startsWith("/admin/associados") ||
    pathname.startsWith("/admin/conteudo") ||
    pathname.startsWith("/admin/mensagens")
  ) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const session = token ? await verifyAdminSession(token) : null;
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/membro/painel/:path*",
    "/admin/associados/:path*",
    "/admin/conteudo/:path*",
    "/admin/mensagens/:path*",
  ],
};
