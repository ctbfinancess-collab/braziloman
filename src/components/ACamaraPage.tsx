"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2 || w === w.toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
            <div className="gov-exec-card" key={e.name}>
              <span className="gov-avatar" aria-hidden="true">{initials(e.name)}</span>
              <h3>{e.name}</h3>
              <p className="gov-role">{e.role} <span aria-hidden="true">{e.flag}</span></p>
              <p className="gov-bio">{e.bio}</p>
            </div>
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.councilTitle}</h2>
        <div className="gov-council-grid">
          {g.council.map((c) => (
            <div className="gov-council-card" key={c.name}>
              <span className="gov-avatar gov-avatar-sm" aria-hidden="true">{initials(c.name)}</span>
              <div>
                <h3>{c.name}</h3>
                <p className="gov-role">{c.role} <span aria-hidden="true">{c.flag}</span></p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.committeesTitle}</h2>
        <p className="partnership-block-lead">{g.committeesLead}</p>
        <div className="cp-chips">
          {g.committees.map((c) => (
            <span className="cp-chip" key={c}>{c}</span>
          ))}
        </div>

        <h2 className="mp-subtitle" style={{ marginTop: 48 }}>{g.structureTitle}</h2>
        <div className="gov-orgchart">
          <div className="gov-org-node gov-org-top">Assembleia</div>
          <div className="gov-org-line" />
          <div className="gov-org-node gov-org-main">Presidente</div>
          <div className="gov-org-line" />
          <div className="gov-org-row">
            <div className="gov-org-node">Vice-Presidente</div>
            <div className="gov-org-node">Diretoria Financeira</div>
            <div className="gov-org-node">Conselho Consultivo</div>
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
        <p className="section-eyebrow center">{s.eyebrow}</p>
        <h1 className="section-title center">{s.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{s.lead}</p>
        <p className="partnership-block-lead" style={{ textAlign: "center" }}>{s.note}</p>
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
        <p className="section-eyebrow center">{c.eyebrow}</p>
        <h1 className="section-title center">{c.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{c.lead}</p>
        <p className="partnership-block-lead" style={{ textAlign: "center" }}>{c.note}</p>
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
        <p className="section-eyebrow center">{t.eyebrow}</p>
        <h1 className="section-title center">{t.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{t.lead}</p>
        <p className="partnership-block-lead" style={{ textAlign: "center" }}>{t.note}</p>
      </div>
    </section>
  );
}
