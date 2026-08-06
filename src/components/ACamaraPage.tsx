"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { HeroBanner } from "./HeroBanner";

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2 || w === w.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

type GovPerson = { name: string; role: string; flag: string; photo?: string; bio?: string };

function GovCard({ person }: { person: GovPerson }) {
  return (
    <div className="gov-exec-card">
      {person.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.photo} alt={person.name} className="gov-avatar-photo" />
      ) : (
        <span className="gov-avatar" aria-hidden="true">{initials(person.name)}</span>
      )}
      <div className="gov-exec-card-body">
        <h3>{person.name}</h3>
        <p className="gov-role">{person.role} <span aria-hidden="true">{person.flag}</span></p>
        {person.bio && <p className="gov-bio">{person.bio}</p>}
      </div>
    </div>
  );
}

const COMMITTEE_ICONS = ["swap", "trending", "leaf", "shieldcheck", "globetech", "scale"];

function OrgNode({
  icon,
  label,
  variant,
}: {
  icon: string;
  label: string;
  variant?: "top" | "main" | "support";
}) {
  const cls = ["gov-org-node", variant ? `gov-org-${variant}` : ""].filter(Boolean).join(" ");
  return (
    <div className={cls}>
      <span className="gov-org-node-icon" aria-hidden="true"><Icon name={icon} /></span>
      <span>{label}</span>
    </div>
  );
}

export function ACamaraTabs({ active }: { active: string }) {
  const { d } = useI18n();
  const t = d.acamaraPage.tabs;
  const links = [
    { href: "/a-camara", key: "home", label: t.home },
    { href: "/a-camara/governanca", key: "governance", label: t.governance },
    { href: "/a-camara/estatuto", key: "statute", label: t.statute },
    { href: "/a-camara/compliance", key: "compliance", label: t.compliance },
    { href: "/a-camara/transparencia", key: "transparency", label: t.transparency },
  ];
  return (
    <nav className="mp-tabs" aria-label="Navegação de A Câmara">
      <div className="container mp-tabs-inner">
        {links.map((l) => (
          <Link key={l.key} href={l.href} className={`mp-tab${active === l.key ? " active" : ""}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function GovernancePage() {
  const { d } = useI18n();
  const g = d.acamaraPage.governance;
  return (
    <section className="section">
      <div className="container reveal">
        <p className="section-eyebrow center">{g.eyebrow}</p>
        <h1 className="section-title center">{g.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{g.lead}</p>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.execTitle}</h2>
        <div className="gov-exec-grid">
          {g.executives.map((e) => (
            <GovCard person={e} key={e.name} />
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.fiscalTitle}</h2>
        <div className="gov-exec-grid">
          {g.fiscalCouncil.map((c) => (
            <GovCard person={c} key={c.name} />
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.councilTitle}</h2>
        <div className="gov-exec-grid">
          {g.council.map((c) => (
            <GovCard person={c} key={c.name} />
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.legalTitle}</h2>
        <div className="gov-exec-grid">
          {g.legalAdvisory.map((c) => (
            <GovCard person={c} key={c.name} />
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.committeesTitle}</h2>
        <p className="partnership-block-lead">{g.committeesLead}</p>
        <div className="gov-committee-grid">
          {g.committees.map((c, i) => (
            <div className="gov-committee-card" key={c}>
              <span className="gov-committee-icon" aria-hidden="true">
                <Icon name={COMMITTEE_ICONS[i % COMMITTEE_ICONS.length]} />
              </span>
              <span>{c}</span>
            </div>
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.structureTitle}</h2>
        <div className="gov-orgchart">
          <OrgNode icon="people" label="Assembleia Geral" variant="top" />
          <div className="gov-org-line" />
          <OrgNode icon="seal" label="Presidente" variant="main" />
          <div className="gov-org-line" />
          <div className="gov-org-tier">
            <OrgNode icon="handshake" label="Vice-Presidente" />
            <OrgNode icon="globe" label="VP de Relações Institucionais" />
            <OrgNode icon="swap" label="VP de Comércio Exterior" />
            <OrgNode icon="bank" label="Diretoria Financeira" />
            <OrgNode icon="briefcase" label="Secretário Executivo" />
          </div>
          <div className="gov-org-line" />
          <div className="gov-org-tier">
            <OrgNode icon="scale" label="Conselho Fiscal" variant="support" />
            <OrgNode icon="network" label="Conselho Consultivo Internacional" variant="support" />
            <OrgNode icon="shieldcheck" label="Assessoria Jurídica" variant="support" />
          </div>
        </div>

        <p className="mp-closing-quote" style={{ marginTop: 48 }}>{g.footer}</p>
      </div>
    </section>
  );
}

export function StatutePage() {
  const { d } = useI18n();
  const s = d.acamaraPage.statute;
  return (
    <section className="section">
      <div className="container reveal">
        <HeroBanner
          photo={s.photo}
          alt="Estatuto Social da Câmara com bandeiras do Brasil e de Omã sobre uma mesa"
          eyebrow={s.eyebrow}
          title={s.title}
          lead={s.lead}
          aspect={1600 / 877}
        />

        <h2 className="mp-subtitle center" style={{ marginTop: 56 }}>{s.recordsTitle}</h2>
        <p className="section-lead mp-lead-center">{s.recordsLead}</p>
        <div className="statute-records">
          {s.records.map((r) => (
            <div className="statute-record-card" key={r.title}>
              <span className="statute-record-date">{r.date}</span>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <ul className="statute-record-signatories">
                {r.signatories.map((sig) => (
                  <li key={sig}>{sig}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompliancePage() {
  const { d } = useI18n();
  const c = d.acamaraPage.compliance;
  return (
    <section className="section">
      <div className="container reveal">
        <HeroBanner
          photo={c.photo}
          alt="Profissional trabalhando em processos de compliance e integridade"
          eyebrow={c.eyebrow}
          title={c.title}
          lead={c.lead}
          aspect={960 / 451}
        />

        <div className="compliance-highlight">
          <span className="compliance-highlight-icon" aria-hidden="true"><Icon name="shieldcheck" /></span>
          <div className="compliance-highlight-body">
            <h3>{c.highlightTitle}</h3>
            <p>{c.highlightText}</p>
          </div>
          <a href="#processo" className="btn btn-ghost compliance-highlight-cta">{c.highlightCta}</a>
        </div>

        <h2 className="mp-subtitle center" style={{ marginTop: 56 }}>{c.principlesTitle}</h2>
        <div className="compliance-grid">
          {c.principles.map((item) => (
            <div className="compliance-card" key={item.h}>
              <span className="compliance-card-icon" aria-hidden="true"><Icon name={item.icon} /></span>
              <h3>{item.h}</h3>
              <p>{item.p}</p>
            </div>
          ))}
        </div>

        <div id="processo" className="compliance-process-block">
          <h2 className="mp-subtitle center">{c.processTitle}</h2>
          <div className="compliance-timeline">
            {c.process.map((step) => (
              <div className="compliance-timeline-step" key={step.n}>
                <span className="compliance-timeline-num">{step.n}</span>
                <h3>{step.h}</h3>
                <p>{step.p}</p>
              </div>
            ))}
          </div>
          <p className="compliance-process-note">{c.processNote}</p>
        </div>

        <h2 className="mp-subtitle center" style={{ marginTop: 56 }}>{c.dueDiligenceTitle}</h2>
        <p className="section-lead mp-lead-center">{c.dueDiligenceLead}</p>
        <div className="compliance-grid">
          {c.dueDiligence.map((item) => (
            <div className="compliance-card" key={item.h}>
              <span className="compliance-card-icon" aria-hidden="true"><Icon name={item.icon} /></span>
              <h3>{item.h}</h3>
              <p>{item.p}</p>
            </div>
          ))}
        </div>

        <h2 className="mp-subtitle center" style={{ marginTop: 56 }}>{c.documentsTitle}</h2>
        <p className="section-lead mp-lead-center">{c.documentsLead}</p>
        <div className="compliance-docs-grid">
          {c.documents.map((doc) => (
            <div className="compliance-doc-card" key={doc.h}>
              <span className="compliance-doc-icon" aria-hidden="true"><Icon name="certificate" /></span>
              <h3>{doc.h}</h3>
              <p>{doc.p}</p>
              {doc.url ? (
                doc.url.endsWith(".pdf") ? (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="compliance-doc-link">Baixar PDF →</a>
                ) : doc.url.startsWith("/") ? (
                  <Link href={doc.url} className="compliance-doc-link">Ler documento →</Link>
                ) : (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="compliance-doc-link">Ler documento →</a>
                )
              ) : (
                <span className="compliance-doc-link compliance-doc-link-disabled">Disponível em breve</span>
              )}
            </div>
          ))}
        </div>

        <div className="compliance-integrity-banner">
          <span className="compliance-highlight-icon" aria-hidden="true"><Icon name="megaphone" /></span>
          <div className="compliance-highlight-body">
            <h3>{c.integrityChannelTitle}</h3>
            <p>{c.integrityChannelText}</p>
          </div>
          <Link href="/contato" className="btn btn-primary compliance-highlight-cta">{c.integrityChannelCta}</Link>
        </div>

        <p className="mp-closing-quote compliance-closing-quote" style={{ marginTop: 48 }}>{c.closingQuote}</p>
      </div>
    </section>
  );
}

export function TransparencyPage() {
  const { d } = useI18n();
  const t = d.acamaraPage.transparency;
  return (
    <section className="section">
      <div className="container reveal">
        <HeroBanner
          photo={t.photo}
          alt="Documentos institucionais e bandeiras do Brasil e de Omã sobre uma mesa"
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
          aspect={960 / 509}
        />

        <div className="compliance-highlight">
          <span className="compliance-highlight-icon" aria-hidden="true"><Icon name="certificate" /></span>
          <div className="compliance-highlight-body">
            <h3>{t.commitmentTitle}</h3>
            <p>{t.commitmentText}</p>
          </div>
        </div>

        <h2 className="mp-subtitle center" style={{ marginTop: 56 }}>{t.documentsTitle}</h2>
        <div className="compliance-grid">
          {t.documents.map((item) => (
            <div className="compliance-card transparency-doc-card" key={item.h}>
              <span className="compliance-card-icon" aria-hidden="true"><Icon name={item.icon} /></span>
              <h3>{item.h}</h3>
              <p>{item.p}</p>
              {item.url ? (
                item.url.startsWith("/") ? (
                  <Link href={item.url} className="compliance-doc-link">Acessar →</Link>
                ) : (
                  <a href={item.url} target="_blank" rel="noreferrer" className="compliance-doc-link">Acessar →</a>
                )
              ) : null}
            </div>
          ))}
        </div>

        <h2 className="mp-subtitle center" style={{ marginTop: 56 }}>{t.publicationsTitle}</h2>
        <div className="compliance-docs-grid">
          {t.publications.map((item) => (
            <div className="compliance-doc-card transparency-pub-card" key={item.h}>
              <span className="compliance-doc-icon transparency-pub-icon" aria-hidden="true"><Icon name={item.icon} /></span>
              <h3>{item.h}</h3>
              <p>{item.p}</p>
              {item.url ? (
                item.url.startsWith("/") ? (
                  <Link href={item.url} className="compliance-doc-link">Acessar →</Link>
                ) : (
                  <a href={item.url} target="_blank" rel="noreferrer" className="compliance-doc-link">Acessar →</a>
                )
              ) : null}
            </div>
          ))}
        </div>

        <div className="compliance-integrity-banner">
          <span className="compliance-highlight-icon" aria-hidden="true"><Icon name="mail" /></span>
          <div className="compliance-highlight-body">
            <h3>{t.requestTitle}</h3>
            <p>{t.requestText}</p>
          </div>
          <Link href="/contato" className="btn btn-primary compliance-highlight-cta">{t.requestCta} →</Link>
        </div>
      </div>
    </section>
  );
}

