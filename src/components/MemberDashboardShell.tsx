"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import type { LoyaltyTier } from "@/lib/loyalty";
import { TIER_NAMES } from "@/lib/loyalty";

type Notice = { id: string; title: string; message: string; important: boolean; createdAt: string };

type NavKey =
  | "painel"
  | "perfil"
  | "certificado"
  | "carteirinha"
  | "rewards"
  | "eventos"
  | "missoes"
  | "rede"
  | "documentos"
  | "configuracoes";

const NAV_ITEMS: { key: NavKey; href: string; icon: string }[] = [
  { key: "painel", href: "/membro/painel/inicio", icon: "monitor" },
  { key: "perfil", href: "/membro/painel/perfil", icon: "user" },
  { key: "certificado", href: "/membro/painel/certificado", icon: "certificate" },
  { key: "carteirinha", href: "/membro/painel/carteirinha", icon: "idcard" },
  { key: "rewards", href: "/membro/painel/rewards", icon: "ticket" },
  { key: "eventos", href: "/membro/painel/eventos", icon: "calendar" },
  { key: "missoes", href: "/membro/painel/missoes", icon: "plane" },
  { key: "rede", href: "/membro/painel/rede", icon: "people" },
  { key: "documentos", href: "/membro/painel/documentos", icon: "folder" },
  { key: "configuracoes", href: "/membro/painel/configuracoes", icon: "settings" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function MemberDashboardShell({
  member,
  tier,
  title,
  subtitle,
  children,
}: {
  member: { name: string; company: string };
  tier: LoyaltyTier;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { d, lang, toggle } = useI18n();
  const t = d.memberArea.dashboard;
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [noticesOpen, setNoticesOpen] = useState(false);

  useEffect(() => {
    fetch("/api/member/notices")
      .then((r) => (r.ok ? r.json() : { notices: [] }))
      .then((json) => setNotices(json.notices || []))
      .catch(() => setNotices([]));
  }, []);

  async function onLogout() {
    setLoggingOut(true);
    await fetch("/api/member/logout", { method: "POST" });
    router.push("/membro/login");
    router.refresh();
  }

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ctb-transparent.png" alt="" aria-hidden="true" className="dash-brand-seal" />
          <strong>{t.brand}</strong>
          <span>{t.brand2}</span>
        </div>

        <nav className="dash-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`dash-nav-item${pathname === item.href ? " active" : ""}`}
            >
              <Icon name={item.icon} />
              {t.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="dash-help">
          <p className="dash-help-title">{t.needHelp}</p>
          <p className="dash-help-lead">{t.talkToTeam}</p>
          <Link href="/contato" className="btn btn-primary dash-help-btn">{t.contact}</Link>
        </div>
      </aside>

      <div className="dash-main-col">
        <header className="dash-topbar">
          <div>
            <h1 className="dash-topbar-title">{title}</h1>
            {subtitle && <p className="dash-topbar-subtitle">{subtitle}</p>}
          </div>
          <div className="dash-topbar-actions">
            <div className="dash-avatar-wrap">
              <button
                type="button"
                className="dash-icon-btn"
                aria-label={t.notificationsTitle}
                onClick={() => setNoticesOpen((v) => !v)}
              >
                <Icon name="bell" />
                {notices && notices.length > 0 && <span className="dash-notice-badge" aria-hidden="true" />}
              </button>
              {noticesOpen && (
                <div className="dash-avatar-menu dash-notice-menu">
                  <p className="dash-notice-menu-title">{t.notificationsTitle}</p>
                  {!notices || notices.length === 0 ? (
                    <p className="dash-notice-empty">{t.noNotifications}</p>
                  ) : (
                    <div className="dash-notice-list">
                      {notices.map((n) => (
                        <div className={`dash-notice-item${n.important ? " important" : ""}`} key={n.id}>
                          <p className="dash-notice-item-title">{n.title}</p>
                          <p className="dash-notice-item-message">{n.message}</p>
                          <p className="dash-notice-item-date">{new Date(n.createdAt).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button type="button" className="dash-icon-btn dash-lang-btn" onClick={toggle} aria-label="Idioma">
              <Icon name="globe" />
              <span>{lang.toUpperCase()}</span>
            </button>
            <div className="dash-avatar-wrap">
              <button type="button" className="dash-avatar-btn" onClick={() => setMenuOpen((v) => !v)}>
                <span className="dash-avatar">{initials(member.name)}</span>
                <span className="dash-avatar-text">
                  <strong>{member.name}</strong>
                  <small>{TIER_NAMES[tier].toUpperCase()} {t.member.toUpperCase()}</small>
                </span>
                <Icon name="chevrondown" />
              </button>
              {menuOpen && (
                <div className="dash-avatar-menu">
                  <button type="button" onClick={onLogout} disabled={loggingOut}>
                    <Icon name="logout" />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dash-content">{children}</main>

        <footer className="dash-motto">
          <span className="dash-motto-line" aria-hidden="true" />
          <span>{t.motto.toUpperCase()} | الوحدة والازدهار ✦</span>
          <span className="dash-motto-line" aria-hidden="true" />
        </footer>
      </div>
    </div>
  );
}
