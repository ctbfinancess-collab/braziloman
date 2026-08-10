import type { Metadata } from "next";
import { requireFullAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/AdminLayout";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Administração — Relatórios",
  robots: { index: false, follow: false },
};

const MONTH_LABEL = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0;
  return (
    <div className="admin-report-row">
      <span className="admin-report-row-label">{label}</span>
      <div className="admin-report-row-bar"><div style={{ width: `${pct}%` }} /></div>
      <span className="admin-report-row-value">{count}</span>
    </div>
  );
}

export default async function AdminRelatoriosPage() {
  await requireFullAdmin();

  const [applications, transactions, registrations, events] = prisma
    ? await Promise.all([
        prisma.membershipApplication.findMany({ select: { status: true, sector: true, country: true, createdAt: true } }),
        prisma.loyaltyTransaction.aggregate({ _sum: { points: true }, _count: true }),
        prisma.eventRegistration.count({ where: { status: "CONFIRMED" } }),
        prisma.chamberEvent.count(),
      ])
    : [[], { _sum: { points: 0 }, _count: 0 }, 0, 0];

  const total = applications.length;
  const decided = applications.filter((a) => ["ACTIVE", "APPROVED", "REJECTED"].includes(a.status)).length;
  const approved = applications.filter((a) => ["ACTIVE", "APPROVED"].includes(a.status)).length;
  const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;

  // Pedidos por mês, últimos 6 meses.
  const now = new Date();
  const months: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `${MONTH_LABEL[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, count: 0 });
  }
  for (const a of applications) {
    const d = new Date(a.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mo) => mo.key === key);
    if (m) m.count++;
  }
  const monthMax = Math.max(1, ...months.map((m) => m.count));

  // Distribuição por setor (top 6).
  const sectorCounts = new Map<string, number>();
  for (const a of applications) {
    if (!a.sector) continue;
    sectorCounts.set(a.sector, (sectorCounts.get(a.sector) ?? 0) + 1);
  }
  const topSectors = Array.from(sectorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const sectorMax = Math.max(1, ...topSectors.map(([, c]) => c));

  // Distribuição por país.
  const countryCounts = new Map<string, number>();
  for (const a of applications) {
    if (!a.country) continue;
    countryCounts.set(a.country, (countryCounts.get(a.country) ?? 0) + 1);
  }
  const topCountries = Array.from(countryCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const countryMax = Math.max(1, ...topCountries.map(([, c]) => c));

  return (
    <AdminLayout active="relatorios" title="Relatórios" lead="Números consolidados da Câmara — dados reais, calculados a cada visita.">
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-icon tone-neutral"><Icon name="userplus" /></span>
          <div>
            <p className="admin-stat-value">{total}</p>
            <p className="admin-stat-label">Pedidos recebidos</p>
            <p className="admin-stat-sub">Desde o início</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon tone-positive"><Icon name="check" /></span>
          <div>
            <p className="admin-stat-value">{approvalRate}%</p>
            <p className="admin-stat-label">Taxa de aprovação</p>
            <p className="admin-stat-sub">{approved} de {decided} decididos</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon tone-warning"><Icon name="star" /></span>
          <div>
            <p className="admin-stat-value">{(transactions._sum.points ?? 0).toLocaleString("pt-BR")}</p>
            <p className="admin-stat-label">Pontos concedidos</p>
            <p className="admin-stat-sub">{transactions._count} lançamentos</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon tone-info"><Icon name="calendar" /></span>
          <div>
            <p className="admin-stat-value">{registrations}</p>
            <p className="admin-stat-label">Inscrições em eventos</p>
            <p className="admin-stat-sub">{events} eventos cadastrados</p>
          </div>
        </div>
      </div>

      <div className="admin-report-grid">
        <div className="admin-report-card">
          <h3>Pedidos por mês</h3>
          {months.map((m) => <BarRow key={m.key} label={m.label} count={m.count} max={monthMax} />)}
        </div>
        <div className="admin-report-card">
          <h3>Principais setores</h3>
          {topSectors.length === 0 ? (
            <p className="cp-chips-label">Sem dados suficientes ainda.</p>
          ) : (
            topSectors.map(([s, c]) => <BarRow key={s} label={s} count={c} max={sectorMax} />)
          )}
        </div>
        <div className="admin-report-card">
          <h3>Principais países</h3>
          {topCountries.length === 0 ? (
            <p className="cp-chips-label">Sem dados suficientes ainda.</p>
          ) : (
            topCountries.map(([c, n]) => <BarRow key={c} label={c} count={n} max={countryMax} />)
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
