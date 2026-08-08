import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession, ADMIN_COOKIE } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminLayout } from "@/components/AdminLayout";
import { Icon } from "@/components/Icons";
import { TIER_NAMES, TIER_BANDS, TIER_BENEFITS, LOYALTY_ACTIONS, type LoyaltyTier } from "@/lib/loyalty";

export const metadata: Metadata = {
  title: "Administração — Categorias & Níveis",
  robots: { index: false, follow: false },
};

const TIER_ORDER: LoyaltyTier[] = ["GOLD", "BLACK", "PLATINUM"];
const TIER_TONE: Record<LoyaltyTier, string> = { GOLD: "tone-neutral", BLACK: "tone-info", PLATINUM: "tone-positive" };

function formatRange(tier: LoyaltyTier): string {
  const band = TIER_BANDS[tier];
  if (band.max === null) return `A partir de ${band.min.toLocaleString("pt-BR")} pontos`;
  return `${band.min.toLocaleString("pt-BR")} – ${band.max.toLocaleString("pt-BR")} pontos`;
}

export default async function AdminCategoriasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;
  if (!session) redirect("/admin/login");

  const rows = prisma
    ? await prisma.membershipApplication.findMany({
        where: { status: { in: ["ACTIVE", "APPROVED"] } },
        select: { pointsTotal: true },
      })
    : [];
  const counts: Record<LoyaltyTier, number> = { GOLD: 0, BLACK: 0, PLATINUM: 0 };
  for (const r of rows) {
    if (r.pointsTotal > TIER_BANDS.BLACK.max) counts.PLATINUM++;
    else if (r.pointsTotal > TIER_BANDS.GOLD.max) counts.BLACK++;
    else counts.GOLD++;
  }

  return (
    <AdminLayout
      active="categorias"
      title="Categorias & Níveis"
      lead="Faixas de pontos, benefícios progressivos e catálogo de ações do Brazil–Oman Chamber Rewards."
    >
      <p className="admin-sidebar-eyebrow" style={{ color: "var(--gold)", borderTop: "none", padding: 0, margin: "0 0 14px" }}>Níveis de fidelidade</p>
      <div className="admin-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="admin-stat-card" style={{ flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
              <span className={`admin-stat-icon ${TIER_TONE[tier]}`}><Icon name="star" /></span>
              <div>
                <p className="admin-stat-value">{TIER_NAMES[tier]}</p>
                <p className="admin-stat-label">{formatRange(tier)}</p>
              </div>
            </div>
            <p className="admin-stat-sub"><span className="dot" style={{ background: "var(--gold)" }} />{counts[tier]} associado{counts[tier] === 1 ? "" : "s"} atualmente</p>
            <ul className="why-list" style={{ margin: "6px 0 0", width: "100%" }}>
              {TIER_BENEFITS[tier].map((b) => (
                <li key={b.pt} style={{ fontSize: "0.84rem" }}>{b.pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="admin-sidebar-eyebrow" style={{ color: "var(--gold)", borderTop: "none", padding: 0, margin: "30px 0 14px" }}>Catálogo de pontos</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ação</th>
              <th>Pontos</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {LOYALTY_ACTIONS.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="admin-table-person">
                    <span className="admin-table-avatar"><Icon name={a.icon} /></span>
                    <strong>{a.labelPt}</strong>
                  </div>
                </td>
                <td>{a.points.toLocaleString("pt-BR")}</td>
                <td>
                  <span className={`admin-badge ${a.automatic ? "tone-info" : "tone-neutral"}`}>
                    {a.automatic ? "Automático" : "Lançado pelo admin"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cp-chips-label" style={{ marginTop: 14 }}>
        Faixas e benefícios ainda são definidos no código (src/lib/loyalty.ts) — essa página é a
        referência de consulta para o time. Edição direta por aqui é um próximo passo possível.
      </p>
    </AdminLayout>
  );
}
