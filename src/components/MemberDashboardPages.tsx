"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { PointsRing } from "./PointsRing";
import { MemberDigitalCard } from "./MemberDigitalCard";
import { MemberCertificate } from "./MemberCertificate";
import { MemberDashboardShell } from "./MemberDashboardShell";
import { LogoUploader } from "./LogoUploader";
import { TIER_NAMES, getTier, type LoyaltyTier, type TierBenefit } from "@/lib/loyalty";

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

const QUICK_ACCESS: { href: string; icon: string; key: "eventos" | "missoes" | "documentos" | "certificado" | "beneficios" }[] = [
  { href: "/membro/painel/beneficios", icon: "briefcase", key: "beneficios" },
  { href: "/membro/painel/eventos", icon: "calendar", key: "eventos" },
  { href: "/membro/painel/missoes", icon: "plane", key: "missoes" },
  { href: "/membro/painel/documentos", icon: "folder", key: "documentos" },
  { href: "/membro/painel/certificado", icon: "certificate", key: "certificado" },
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

export type UpcomingCommitment = {
  registrationId: string;
  eventId: string;
  kind: "EVENTO" | "MISSAO";
  title: string;
  date: string;
  location: string | null;
};

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
  upcoming?: UpcomingCommitment[];
  networkCount?: number;
};

/** Widget "Próximos Compromissos" — eventos/missões em que o associado se inscreveu. */
function UpcomingCommitmentsWidget({ upcoming }: { upcoming: UpcomingCommitment[] }) {
  const { t, lang } = useDashboardText();
  return (
    <div className="dash-card">
      <h2 className="dash-card-title">{t.upcomingCommitmentsTitle}</h2>
      {upcoming.length === 0 ? (
        <div className="dash-commitments-empty">
          <p className="section-lead" style={{ margin: "0 0 14px" }}>{t.noCommitments}</p>
          <Link href="/membro/painel/eventos" className="btn btn-ghost">{t.exploreEvents}</Link>
        </div>
      ) : (
        <div className="dash-event-list">
          {upcoming.map((c) => (
            <div className="dash-event-card" key={c.registrationId}>
              <div className="dash-event-date">
                <strong>{new Date(c.date).getUTCDate()}</strong>
                <span>{new Date(c.date).toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { month: "short", timeZone: "UTC" }).replace(".", "")}</span>
              </div>
              <div className="dash-event-body">
                <p className="dash-event-title">{c.title}</p>
                {c.location && <p className="dash-event-location"><Icon name="pin" />{c.location}</p>}
                <span className="dash-commitment-status"><Icon name="check" /> {t.registered}</span>
              </div>
              <Link href={c.kind === "EVENTO" ? "/membro/painel/eventos" : "/membro/painel/missoes"} className="btn btn-ghost dash-doc-btn">
                {t.viewDetails}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Banner de anúncio do módulo "Parceiros & Benefícios" — bem no topo do
 *  painel, pra quem ainda não viu a novidade não passar direto sem notar. */
function BenefitsPromoBanner() {
  const { t } = useDashboardText();
  return (
    <Link href="/membro/painel/beneficios" className="dash-promo-banner">
      <span className="dash-promo-tag">{t.benefitsPromoTag}</span>
      <span className="dash-promo-icon"><Icon name="briefcase" /></span>
      <span className="dash-promo-body">
        <strong>{t.benefitsPromoTitle}</strong>
        <span>{t.benefitsPromoText}</span>
      </span>
      <span className="btn btn-primary dash-promo-btn">{t.benefitsPromoCta} <Icon name="arrowright" /></span>
    </Link>
  );
}

/** Widget de destaque da Rede de Associados. */
function NetworkHighlightWidget({ networkCount }: { networkCount: number }) {
  const { t } = useDashboardText();
  return (
    <div className="dash-card dash-network-highlight">
      <span className="dash-benefit-icon"><Icon name="people" /></span>
      <div>
        <h2 className="dash-card-title" style={{ marginBottom: 6 }}>{t.networkHighlightTitle}</h2>
        <p className="section-lead" style={{ margin: 0 }}>{t.networkHighlightText.replace("{n}", String(networkCount))}</p>
      </div>
      <Link href="/membro/painel/rede" className="btn btn-ghost dash-network-highlight-btn">
        {t.viewDetails} <Icon name="arrowright" />
      </Link>
    </div>
  );
}

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
      <BenefitsPromoBanner />

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

      <div className="dash-grid dash-grid-status">
        <UpcomingCommitmentsWidget upcoming={props.upcoming ?? []} />
        <NetworkHighlightWidget networkCount={props.networkCount ?? 0} />
      </div>

      <div className="dash-grid dash-grid-activity">
        <ActivityList activity={props.activity} />
        <QuickAccess />
      </div>
    </MemberDashboardShell>
  );
}

/** Página "Meu Perfil" — dados cadastrais em tela cheia. */
export function DashboardProfile({ member, tier, logoUrl }: { member: ProfileFields; tier: LoyaltyTier; logoUrl: string | null }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.profileTitle} subtitle={t.profileLead}>
      <div className="dash-grid-single">
        <div className="dash-card">
          <LogoUploader initialUrl={logoUrl} />
        </div>
      </div>
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
          <div style={{ width: "100%", maxWidth: 820 }}>
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

/* ---------- Eventos / Missões / Rede / Documentos / Configurações ---------- */

export type EventListItem = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  imageUrl: string | null;
  priceCents: number | null;
  currency: "BRL" | "USD";
  registered: boolean;
};

function formatEventPrice(cents: number | null, currency: "BRL" | "USD", freeLabel: string) {
  if (!cents) return freeLabel;
  return (cents / 100).toLocaleString(currency === "USD" ? "en-US" : "pt-BR", { style: "currency", currency });
}

function EventCard({ ev }: { ev: EventListItem }) {
  const { t, lang } = useDashboardText();
  const [registered, setRegistered] = useState(ev.registered);
  const [loading, setLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Datas de evento são "dia de calendário" puro (input type=date, sem hora) — usar
  // sempre métodos UTC para exibir, senão o fuso horário do navegador pode mostrar
  // o dia anterior (ex.: 15/09 salvo como meia-noite UTC vira 14/09 em UTC-3).
  const d = new Date(ev.date);
  const monthLabel = d.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { month: "short", timeZone: "UTC" }).replace(".", "");
  // Date.now() é impuro pra chamar direto no corpo do render — calcula uma vez, na
  // montagem (a data do evento não muda durante a vida do componente).
  const [isPast] = useState(() => d.getTime() < Date.now());

  async function onToggle() {
    setLoading(true);
    try {
      // Evento pago: gera o link do Stripe e sai da página — a inscrição em
      // si só nasce depois que o pagamento é confirmado (webhook).
      if (!registered && ev.priceCents) {
        const res = await fetch(`/api/member/events/${ev.id}/checkout`, { method: "POST" });
        const json = await res.json();
        if (res.ok && json.url) {
          window.location.href = json.url;
          return;
        }
        alert(json.error || t.paymentError);
        return;
      }
      const res = await fetch(`/api/member/events/${ev.id}/register`, { method: registered ? "DELETE" : "POST" });
      if (res.ok) setRegistered((v) => !v);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dash-event-card">
      {ev.imageUrl ? (
        <button type="button" className="dash-event-photo-btn" onClick={() => setLightboxOpen(true)} aria-label={ev.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dash-event-photo" src={ev.imageUrl} alt="" />
        </button>
      ) : (
        <div className="dash-event-date">
          <strong>{d.getUTCDate()}</strong>
          <span>{monthLabel}</span>
        </div>
      )}
      <div className="dash-event-body">
        {ev.imageUrl && (
          <p className="dash-event-date-inline">
            {d.getUTCDate()} {monthLabel.toUpperCase()}
          </p>
        )}
        <p className="dash-event-title">{ev.title}</p>
        {ev.location && <p className="dash-event-location"><Icon name="pin" />{ev.location}</p>}
        <p className={`dash-event-price${ev.priceCents ? "" : " dash-event-price-free"}`}>
          {formatEventPrice(ev.priceCents, ev.currency, t.eventFree)}
        </p>
        {ev.description && <p className="dash-event-desc">{ev.description}</p>}
      </div>
      {!isPast && (
        <button
          type="button"
          className={`btn ${registered ? "btn-ghost" : "btn-primary"} dash-doc-btn`}
          onClick={onToggle}
          disabled={loading}
        >
          {loading
            ? (registered ? t.cancellingRegistration : t.registering)
            : (registered ? t.cancelRegistration : t.register)}
        </button>
      )}
      {isPast && registered && <span className="dash-commitment-status"><Icon name="check" /> {t.registered}</span>}
      {lightboxOpen && ev.imageUrl && (
        <div className="dash-lightbox" onClick={() => setLightboxOpen(false)}>
          <button type="button" className="dash-lightbox-close" onClick={() => setLightboxOpen(false)} aria-label={t.close}>
            <Icon name="close" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dash-lightbox-img" src={ev.imageUrl} alt={ev.title} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

/** Página "Eventos". */
export function DashboardEvents({ member, tier, events }: { member: ProfileFields; tier: LoyaltyTier; events: EventListItem[] }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.eventsTitle} subtitle={t.eventsLead}>
      <div className="dash-grid-single">
        <div className="dash-card">
          {events.length === 0 ? (
            <p className="section-lead" style={{ margin: 0 }}>{t.noEvents}</p>
          ) : (
            <div className="dash-event-list">
              {events.map((ev) => <EventCard ev={ev} key={ev.id} />)}
            </div>
          )}
        </div>
      </div>
    </MemberDashboardShell>
  );
}

/** Página "Missões". */
export function DashboardMissions({ member, tier, missions }: { member: ProfileFields; tier: LoyaltyTier; missions: EventListItem[] }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.missionsTitle} subtitle={t.missionsLead}>
      <div className="dash-grid-single">
        <div className="dash-card">
          {missions.length === 0 ? (
            <p className="section-lead" style={{ margin: 0 }}>{t.noMissions}</p>
          ) : (
            <div className="dash-event-list">
              {missions.map((ev) => <EventCard ev={ev} key={ev.id} />)}
            </div>
          )}
        </div>
      </div>
    </MemberDashboardShell>
  );
}

export type NetworkMember = { company: string; sector: string | null; pointsTotal: number; logoUrl: string | null };

/** Página "Rede de Associados" — só empresa, setor e nível (nunca dados pessoais). */
export function DashboardNetwork({ member, tier, members }: { member: ProfileFields; tier: LoyaltyTier; members: NetworkMember[] }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.networkTitle} subtitle={t.networkLead}>
      <div className="dash-grid-single">
        {members.length === 0 ? (
          <div className="dash-card">
            <p className="section-lead" style={{ margin: 0 }}>{t.noNetworkMembers}</p>
          </div>
        ) : (
          <div className="dash-network-grid">
            {members.map((m) => {
              const mTier = getTier(m.pointsTotal);
              return (
                <div className="dash-card dash-network-card" key={m.company + m.sector}>
                  {m.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="dash-network-logo" src={m.logoUrl} alt="" />
                  ) : (
                    <span className="dash-benefit-icon"><Icon name="briefcase" /></span>
                  )}
                  <p className="dash-network-company">{m.company}</p>
                  {m.sector && <p className="dash-network-sector">{m.sector}</p>}
                  <span className={`loyalty-tier-badge tier-${mTier.toLowerCase()}`}>{TIER_NAMES[mTier]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberDashboardShell>
  );
}

export type DocumentListItem = { key: string; label: string; fileName?: string; url: string };

/** Página "Documentos" — documentos enviados na candidatura, com download. */
export function DashboardDocuments({ member, tier, documents }: { member: ProfileFields; tier: LoyaltyTier; documents: DocumentListItem[] }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.documentsTitle} subtitle={t.documentsLead}>
      <div className="dash-grid-single">
        <div className="dash-card">
          {documents.length === 0 ? (
            <p className="section-lead" style={{ margin: 0 }}>{t.noDocuments}</p>
          ) : (
            <div className="dash-activity-list">
              {documents.map((doc) => (
                <div className="dash-activity-item" key={doc.key}>
                  <span className="dash-activity-icon"><Icon name="folder" /></span>
                  <span className="dash-activity-body">
                    <strong>{doc.label}</strong>
                    {doc.fileName && <small>{doc.fileName}</small>}
                  </span>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost dash-doc-btn">{t.download}</a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MemberDashboardShell>
  );
}

function ChangePasswordForm() {
  const { t } = useDashboardText();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data.newPassword !== data.confirmNewPassword) {
      setError(t.passwordMismatch);
      setStatus("err");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/member/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error || t.passwordChangeError);
        setStatus("err");
        return;
      }
      setStatus("ok");
      form.reset();
    } catch {
      setError(t.passwordChangeError);
      setStatus("err");
    }
  }

  return (
    <form className="contact-form mp-form" onSubmit={onSubmit} noValidate>
      <h3 className="mp-form-title">{t.passwordTitle}</h3>
      <label>
        {t.currentPassword}
        <input type="password" name="currentPassword" required autoComplete="current-password" maxLength={72} />
      </label>
      <label>
        {t.newPassword}
        <input type="password" name="newPassword" required minLength={8} autoComplete="new-password" maxLength={72} />
      </label>
      <label>
        {t.confirmNewPassword}
        <input type="password" name="confirmNewPassword" required minLength={8} autoComplete="new-password" maxLength={72} />
      </label>
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? t.changingPassword : t.changePassword}
      </button>
      {status === "ok" && <p className="form-note ok" role="status" aria-live="polite">{t.passwordChanged}</p>}
      {status === "err" && <p className="form-note err" role="status" aria-live="polite">{error}</p>}
    </form>
  );
}

/** Página "Configurações" — dados da conta + troca de senha. */
export function DashboardSettings({ member, tier }: { member: ProfileFields; tier: LoyaltyTier }) {
  const { t } = useDashboardText();
  return (
    <MemberDashboardShell member={member} tier={tier} title={t.settingsTitle} subtitle={t.settingsLead}>
      <div className="dash-grid dash-grid-status">
        <div className="dash-card">
          <h2 className="dash-card-title">{t.accountInfoTitle}</h2>
          <div className="dash-fields-grid">
            <div className="dash-field">
              <span className="dash-field-icon"><Icon name="user" /></span>
              <span><b>{t.fields.name}</b><span>{member.name}</span></span>
            </div>
            <div className="dash-field">
              <span className="dash-field-icon"><Icon name="mail" /></span>
              <span><b>{t.fields.email}</b><span>{member.email}</span></span>
            </div>
            <div className="dash-field">
              <span className="dash-field-icon"><Icon name="briefcase" /></span>
              <span><b>{t.fields.company}</b><span>{member.company}</span></span>
            </div>
          </div>
        </div>
        <div className="dash-card">
          <ChangePasswordForm />
        </div>
      </div>
    </MemberDashboardShell>
  );
}
