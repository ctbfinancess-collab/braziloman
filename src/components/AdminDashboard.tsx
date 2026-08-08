"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminLayout } from "./AdminLayout";
import { Icon } from "./Icons";

type Stats = {
  novos: number;
  emAnalise: number;
  aprovados: number;
  recusados: number;
  totalAssociados: number;
};

const QUICK_LINKS = [
  { href: "/admin/associados", label: "Pedidos de Associação", icon: "userplus", desc: "Analisar e aprovar candidaturas" },
  { href: "/admin/eventos", label: "Eventos e Missões", icon: "calendar", desc: "Cadastrar eventos e ver inscritos" },
  { href: "/admin/avisos", label: "Comunicados", icon: "megaphone", desc: "Publicar avisos institucionais" },
  { href: "/admin/parceiros", label: "Parceiros", icon: "briefcase", desc: "Gerenciar página pública de parceiros" },
  { href: "/admin/mensagens", label: "Mensagens", icon: "mail", desc: "Ver mensagens do formulário de contato" },
  { href: "/admin/conteudo", label: "Conteúdo do site", icon: "folder", desc: "Editar textos e imagens do site" },
];

/** "Painel Geral" — visão consolidada do admin, com os mesmos cards de
 *  estatística de "Pedidos de Associação" + atalhos pras outras seções. */
export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/applications");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao carregar.");
      return;
    }
    type Row = { status: string; createdAt: string };
    const apps: Row[] = json.applications;
    const thisYear = (iso: string) => new Date(iso).getFullYear() === new Date().getFullYear();
    const NEW = ["INCOMPLETE", "PENDING"];
    const REVIEW = ["AWAITING_DOCUMENTS", "UNDER_REVIEW", "INFO_REQUESTED", "CONDITIONALLY_APPROVED", "APPROVED_PENDING_PAYMENT"];
    const ACTIVE = ["ACTIVE", "APPROVED"];
    setStats({
      novos: apps.filter((a) => NEW.includes(a.status)).length,
      emAnalise: apps.filter((a) => REVIEW.includes(a.status)).length,
      aprovados: apps.filter((a) => ACTIVE.includes(a.status) && thisYear(a.createdAt)).length,
      recusados: apps.filter((a) => a.status === "REJECTED" && thisYear(a.createdAt)).length,
      totalAssociados: apps.filter((a) => ACTIVE.includes(a.status)).length,
    });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout active="painel" title="Painel Geral" lead="Visão consolidada da Câmara de Comércio Brasil–Omã.">
      {error && <p className="form-note err">{error}</p>}

      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-neutral"><Icon name="userplus" /></span>
            <div>
              <p className="admin-stat-value">{stats.novos}</p>
              <p className="admin-stat-label">Novos Pedidos</p>
              <p className="admin-stat-sub"><span className="dot" style={{ background: "#a9750f" }} />Aguardando análise</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-warning"><Icon name="clipboard" /></span>
            <div>
              <p className="admin-stat-value">{stats.emAnalise}</p>
              <p className="admin-stat-label">Em Análise</p>
              <p className="admin-stat-sub"><span className="dot" style={{ background: "#3c6eb4" }} />Em avaliação</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-positive"><Icon name="check" /></span>
            <div>
              <p className="admin-stat-value">{stats.aprovados}</p>
              <p className="admin-stat-label">Aprovados</p>
              <p className="admin-stat-sub"><span className="dot" style={{ background: "#3f8f5c" }} />Neste ano</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-negative"><Icon name="xcircle" /></span>
            <div>
              <p className="admin-stat-value">{stats.recusados}</p>
              <p className="admin-stat-label">Recusados</p>
              <p className="admin-stat-sub"><span className="dot" style={{ background: "#b0473a" }} />Neste ano</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-icon tone-info"><Icon name="people" /></span>
            <div>
              <p className="admin-stat-value">{stats.totalAssociados}</p>
              <p className="admin-stat-label">Total de Associados</p>
              <p className="admin-stat-sub"><span className="dot" style={{ background: "#3c6eb4" }} />Ativos</p>
            </div>
          </div>
        </div>
      )}

      <p className="admin-sidebar-eyebrow" style={{ color: "var(--gold)", borderTop: "none", padding: 0, margin: "8px 0 14px" }}>Acesso rápido</p>
      <div className="admin-quicklinks">
        {QUICK_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="admin-quicklink-card">
            <span className="admin-quicklink-icon"><Icon name={l.icon} /></span>
            <span>
              <strong>{l.label}</strong>
              <small>{l.desc}</small>
            </span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
