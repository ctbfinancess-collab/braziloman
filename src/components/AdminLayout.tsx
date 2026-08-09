"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "./Icons";

type NavItem = { key: string; label: string; href: string; icon: string };

const NAV_ITEMS: NavItem[] = [
  { key: "painel", label: "Painel Geral", href: "/admin", icon: "grid" },
  { key: "associados", label: "Pedidos de Associação", href: "/admin/associados", icon: "userplus" },
  { key: "ativos", label: "Associados Ativos", href: "/admin/associados/ativos", icon: "people" },
  { key: "inativos", label: "Associados Inativos", href: "/admin/associados/inativos", icon: "people" },
  { key: "categorias", label: "Categorias & Níveis", href: "/admin/categorias", icon: "star" },
  { key: "eventos", label: "Eventos e Missões", href: "/admin/eventos", icon: "calendar" },
  { key: "avisos", label: "Comunicados", href: "/admin/avisos", icon: "megaphone" },
  { key: "parceiros", label: "Parceiros", href: "/admin/parceiros", icon: "briefcase" },
  { key: "beneficios", label: "Parceiros & Benefícios", href: "/admin/beneficios", icon: "ticket" },
  { key: "mensagens", label: "Mensagens", href: "/admin/mensagens", icon: "mail" },
  { key: "conteudo", label: "Conteúdo do site", href: "/admin/conteudo", icon: "folder" },
  { key: "relatorios", label: "Relatórios", href: "/admin/relatorios", icon: "chart" },
  { key: "usuarios", label: "Usuários", href: "/admin/usuarios", icon: "user" },
];

/** Layout compartilhado do painel admin — sidebar escura + barra superior,
 *  usado em todas as páginas de /admin/*. Recebe `active` (a `key` do item de
 *  menu correspondente) pra destacar a página atual. */
export function AdminLayout({
  active,
  eyebrow = "Administração",
  title,
  lead,
  actions,
  children,
}: {
  active: string;
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [me, setMe] = useState<{ name: string | null; email: string | null } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setMe(j))
      .catch(() => {});
  }, []);

  const displayName = me?.name || "Administrador";
  const displayEmail = me?.email || "admin@brasilomanchamber.org";
  const avatarInitials = me?.name
    ? me.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "AD";

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <Link href="/admin" className="admin-sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <Image src="/logo-ctb-transparent.png" alt="" width={56} height={56} />
          <span>
            Câmara de Comércio
            <strong>Brasil–Omã</strong>
          </span>
        </Link>
        <p className="admin-sidebar-eyebrow">Administração</p>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`admin-sidebar-link${active === item.key ? " active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-profile">
          <span className="admin-sidebar-avatar">{avatarInitials}</span>
          <span>
            <strong>{displayName}</strong>
            <small>{displayEmail}</small>
          </span>
        </div>
        <button type="button" className="admin-sidebar-logout" onClick={logout}>
          <Icon name="logout" /> Sair
        </button>
      </aside>

      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-topbar-menu-btn" aria-label="Abrir menu" onClick={() => setSidebarOpen((v) => !v)}>
            <Icon name="menu" />
          </button>
          <Link href="/admin" className="admin-topbar-brand">
            <Image src="/logo-ctb-transparent.png" alt="" width={34} height={34} />
            <span>
              Câmara de Comércio
              <strong>Brasil–Omã</strong>
            </span>
          </Link>
          <div className="admin-topbar-spacer" />
          <span className="admin-topbar-lang" title="Painel administrativo em português">PT</span>
        </header>

        <main className="admin-content">
          <p className="section-eyebrow">{eyebrow}</p>
          <div className="admin-content-head">
            <div>
              <h1 className="section-title" style={{ marginBottom: lead ? 6 : 0 }}>{title}</h1>
              {lead && <p className="section-lead" style={{ margin: 0 }}>{lead}</p>}
            </div>
            {actions && <div className="admin-content-actions">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

/** Link "← Voltar" pra páginas aninhadas do admin (ex.: detalhe de uma
 *  candidatura), sempre no topo do conteúdo, antes do título. */
export function AdminBackLink({ href, label = "Voltar" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="admin-back-link">
      <Icon name="chevronleft" /> {label}
    </Link>
  );
}
