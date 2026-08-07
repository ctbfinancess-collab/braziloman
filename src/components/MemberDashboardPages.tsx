"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { PointsRing } from "./PointsRing";
import { MemberDigitalCard } from "./MemberDigitalCard";
import { MemberCertificate } from "./MemberCertificate";
import { MemberDashboardShell } from "./MemberDashboardShell";
import { TIER_NAMES, type LoyaltyTier, type TierBenefit } from "@/lib/loyalty";

type ProfileFields = {
  name: string;
  email: string;
  company: string;
  role: string | null;
  sector: string | null;
  country: string | null;
  phone: string | null;
  createdAt: string;
};

type Progress = {
  tier: LoyaltyTier;
  isMaxTier: boolean;
  nextTier: LoyaltyTier | null;
  pointsToNext: number | null;
  progressPct: number;
};

type ActivityItem = {
  id: string;
  icon: string;
  labelPt: string;
  labelEn: string;
  points: number;
  createdAt: string;
};

function useDashboardText() {
  const { d, lang } = useI18n();
  return { t: d.memberArea.dashboard, lt: d.memberArea.loyalty, lang };
}

function fmtDate(iso: string | null, lang: "pt" | "en"): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US");
}

function fmtDateTime(iso: string, lang: "pt" | "en"): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US");
  const time = d.toLocaleTimeString(lang === "pt" ? "pt-BR" : "en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

/** Card "Status da Associação" — dados cadastrais do associado com ícones. */
function StatusCard({ member }: { member: ProfileFields }) {
  const { t, lang } = useDashboardText();
  const rows: [string, string, string | null][] = [
    ["user", t.fields.name, member.name],
    ["mail", t.fields.email, member.email],
    ["briefcase", t.fields.company, member.company],
    ["tie", t.fields.role, member.role],
    ["building", t.fields.sector, member.sector],
    ["globe", t.fields.country, member.country],
    ["phone", t.fields.phone, member.phone],
    ["calendar", t.fields.since, fmtDate(member.createdAt, lang)],
  ];

  return (
    <div className="dash-card">
      <h2 className="dash-card-title">{t.statusTitle}</h2>
      <p className="dash-status-chip">
        <Icon name="check" /> {t.statusApproved.toUpperCase()}
      </p>
      <div className="dash-fields-grid">
        {rows.map(([icon, label, value]) => (
          <div className="dash-field" key={label}>
            <span className="dash-field-icon"><Icon name={icon} /></span>
            <span>
              <b>{label}</b>
              <span>{value || "—"}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Widget escuro com a "mini carteirinha" — prévia da Carteirinha Digital completa. */
function CardWidget({
  tier,
  tierName,
  memberNumber,
  sinceYear,
  validUntil,
  qrDataUrl,
}: {
  tier: LoyaltyTier;
  tierName: string;
  memberNumber: string;
  sinceYear: number | null;
  validUntil: string | null;
  qrDataUrl: string | null;
}) {
  const { t, lang } = useDashboardText();
  return (
    <div className={`dash-card-widget tier-${tier.toLowerCase()}`}>
      <div className="dash-card-widget-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-ctb-transparent.png" alt="" aria-hidden="true" />
        <span>Câmara de Comércio Brasil–Omã</span>
      </div>
      <div className="dash-card-widget-body">
        <div>
          <p className="dash-card-widget-tier">{tierName.toUpperCase()} {t.member.toUpperCase()}</p>
          <p className="dash-card-widget-line">Nº {memberNumber}</p>
          {sinceYear && <p className="dash-card-widget-line dim">{t.fields.since} {sinceYear}</p>}
          {validUntil && <p className="dash-card-widget-line dim">{t.cardValidUntil} {fmtDate(validUntil, lang)}</p>}
        </div>
        {qrDataUrl && (
          <div className="dash-card-widget-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="" />
            <span>{t.cardVerify.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Widget "Brazil–Oman Chamber Rewards" com anel de pontos + barra de progresso. */
function RewardsWidget({ tier, pointsTotal, progress, linkToDetails = true }: { tier: LoyaltyTier; pointsTotal: number; progress: Progress; linkToDetails?: boolean }) {
  const { t, lt } = useDashboardText();
  return (
    <div className="dash-card">
      <h2 className="dash-card-title">{t.rewardsTitle}</h2>
      <div className="dash-rewards-row">
        <PointsRing points={pointsTotal} progressPct={progress.progressPct} pointsLabel={t.pointsAccumulated.toUpperCase()} />
        <div className="dash-rewards-info">
          <span className={`loyalty-tier-badge tier-${tier.toLowerCase()}`}>{TIER_NAMES[tier]}</span>
          {progress.isMaxTier ? (
            <p className="cp-chips-label" style={{ marginTop: 10 }}>{lt.maxTierReached}</p>
          ) : (
            <>
              <p className="cp-chips-label" style={{ marginTop: 10 }}>
                {lt.progressToNext
                  .replace("{n}", String(progress.pointsToNext))
                  .replace("{tier}", progress.nextTier ? TIER_NAMES[progress.nextTier] : "")}
              </p>
              <div className="loyalty-progress-track">
                <div className="loyalty-progress-fill" style={{ width: `${progress.progressPct}%` }} />
              </div>
            </>
          )}
          {linkToDetails && (
            <Link href="/membro/painel/rewards" className="dash-link-arrow">
              {t.viewProgramDetails} <Icon name="arrowright" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** Grid "Benefícios do seu nível". */
function BenefitsGrid({ benefits }: { benefits: TierBenefit[] }) {
  const { lt, lang } = useDashboardText();
  return (
    <div className="dash-card">
      <h2 className="dash-card-title">{lt.benefitsTitle}</h2>
      <div className="dash-benefits-grid">
        {benefits.map((b) => (
          <div className="dash-benefit" key={b.pt}>
            <span className="dash-benefit-icon"><Icon name={b.icon} /></span>
            <span>{lang === "pt" ? b.pt : b.en}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Lista "Atividade Recente" — últimos lançamentos do extrato de pontos. */
function ActivityList({ activity }: { activity: ActivityItem[] }) {
  const { lt, lang } = useDashboardText();
  return (
    <div className="dash-card">
      <h2 className="dash-card-title">{lt.activityTitle}</h2>
      {activity.length === 0 ? (
        <p className="section-lead" style={{ margin: 0 }}>{lt.noActivity}</p>
      ) : (
        <div className="dash-activity-list">
          {activity.map((a) => (
            <div className="dash-activity-item" key={a.id}>
              <span className="dash-activity-icon"><Icon name={a.icon} /></span>
              <span className="dash-activity-body">
                <strong>{lang === "pt" ? a.labelPt : a.labelEn}</strong>
                <small>{fmtDateTime(a.createdAt, lang)}</small>
              </span>
              <span className="dash-activity-points">+{a.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const QUICK_ACCESS: { href: string; icon: string; key: "certificado" | "carteirinha" | "rewards" | "perfil" }[] = [
  { href: "/membro/painel/certificado", icon: "certificate", key: "certificado" },
  { href: "/membro/painel/carteirinha", icon: "idcard", key: "carteirinha" },
  { href: "/membro/painel/rewards", icon: "ticket", key: "rewards" },
  { href: "/membro/painel/perfil", icon: "user", key: "perfil" },
];

/** Grid "Acessos Rápidos" — atalhos para as demais seções do painel. */
function QuickAccess() {
  const { t } = useDashboardText();
  return (
    <div className="dash-card">
      <h2 className="dash-card-title">{t.quickAccess}</h2>
      <div className="dash-quick-grid">
        {QUICK_ACCESS.map((q) => (
          <Link href={q.href} className="dash-quick-item" key={q.key}>
            <Icon name={q.icon} />
            <span>{t.nav[q.key]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export type DashboardMemberInfo = {
  member: ProfileFields;
  tier: LoyaltyTier;
  tierName: string;
  memberNumber: string;
  sinceYear: number | null;
  validUntil: string | null;
  qrDataUrl: string | null;
  pointsTotal: number;
  progress: Progress;
  benefits: TierBenefit[];
  activity: ActivityItem[];
};

/** Página "Painel" — visão geral do associado, igual ao mockup enviado. */
export function DashboardHome(props: DashboardMemberInfo) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell
      member={props.member}
      tier={props.tier}
      title={t.homeTitle}
      subtitle={t.welcome.replace("{name}", props.member.name)}
    >
      <div className="dash-grid dash-grid-status">
        <StatusCard member={props.member} />
        <CardWidget
          tier={props.tier}
          tierName={props.tierName}
          memberNumber={props.memberNumber}
          sinceYear={props.sinceYear}
          validUntil={props.validUntil}
          qrDataUrl={props.qrDataUrl}
        />
      </div>

      <div className="dash-grid dash-grid-rewards">
        <RewardsWidget tier={props.tier} pointsTotal={props.pointsTotal} progress={props.progress} />
        <BenefitsGrid benefits={props.benefits} />
      </div>

      <div className="dash-grid dash-grid-activity">
        <ActivityList activity={props.activity} />
        <QuickAccess />
      </div>
    </MemberDashboardShell>
  );
}

/** Página "Meu Perfil" — dados cadastrais em tela cheia. */
export function DashboardProfile({ member, tier }: { member: ProfileFields; tier: LoyaltyTier }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.profileTitle} subtitle={t.profileLead}>
      <div className="dash-grid-single">
        <StatusCard member={member} />
      </div>
    </MemberDashboardShell>
  );
}

/** Página "Meu Certificado" — download do certificado em PDF. */
export function DashboardCertificate({
  member,
  tier,
  memberNumber,
  memberSince,
  qrDataUrl,
}: {
  member: ProfileFields;
  tier: LoyaltyTier;
  memberNumber: string;
  memberSince: string | null;
  qrDataUrl: string | null;
}) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.certificateTitle} subtitle={t.certificateLead}>
      <div className="dash-grid-single">
        <div className="dash-card dash-card-center">
          <MemberCertificate
            name={member.name}
            company={member.company}
            tier={tier}
            memberNumber={memberNumber}
            memberSince={memberSince}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>
    </MemberDashboardShell>
  );
}

/** Página "Carteirinha Digital" — cartão real (frente/verso), com arte oficial. */
export function DashboardCard({
  member,
  tier,
  memberNumber,
  sinceYear,
  qrDataUrl,
}: {
  member: ProfileFields;
  tier: LoyaltyTier;
  memberNumber: string;
  sinceYear: number | null;
  qrDataUrl: string | null;
}) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.cardTitle} subtitle={t.cardLead}>
      <div className="dash-grid-single">
        <div className="dash-card dash-card-center">
          <div style={{ width: "100%", maxWidth: 420 }}>
            <MemberDigitalCard tier={tier} company={member.company} memberNumber={memberNumber} sinceYear={sinceYear} qrDataUrl={qrDataUrl} />
          </div>
        </div>
      </div>
    </MemberDashboardShell>
  );
}

/** Página "Rewards" — programa de fidelidade completo (pontos, benefícios, extrato). */
export function DashboardRewards(props: DashboardMemberInfo) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={props.member} tier={props.tier} title={t.rewardsTitle} subtitle={t.rewardsLead}>
      <div className="dash-grid dash-grid-rewards">
        <RewardsWidget tier={props.tier} pointsTotal={props.pointsTotal} progress={props.progress} linkToDetails={false} />
        <BenefitsGrid benefits={props.benefits} />
      </div>
      <div className="dash-grid-single">
        <ActivityList activity={props.activity} />
      </div>
    </MemberDashboardShell>
  );
}
