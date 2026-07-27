"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

export function Hero() {
  const { d } = useI18n();
  const h = d.heroBridge;
  return (
    <section className="hero-split" id="top">
      <div className="hero-left">
        <p className="eyebrow">{h.eyebrow}</p>
        <h1>
          {h.titleA}
          <span className="accent">{h.titleAccent}</span>
          {h.titleB}
        </h1>
        <p className="hero-lead">{h.lead}</p>
        <div className="hero-actions">
          <Link href="/associe-se" className="btn btn-primary">{h.ctaJoin}</Link>
          <Link href="/a-camara" className="btn btn-ghost">{h.ctaLearn}</Link>
        </div>
        <div className="hero-motto2">
          <span className="motto-laurel"><Icon name="laurel" /></span>
          <div>
            <strong>{h.mottoMain}</strong>
            <small>{h.mottoSub}</small>
          </div>
        </div>
      </div>
      <div className="hero-right" aria-hidden="true">
        <Image
          className="hero-emblem"
          src="/hero-seal.png"
          alt="Selo da Câmara de Comércio Brasil–Omã"
          width={700}
          height={700}
          priority
        />
      </div>
      <div className="hero-goldline" aria-hidden="true" />
    </section>
  );
}

export function Purpose() {
  const { d } = useI18n();
  return (
    <section className="section purpose" id="proposito">
      <div className="container reveal">
        <p className="section-eyebrow center">{d.purpose.eyebrow}</p>
        <h2 className="purpose-title">
          <span className="purpose-title-line">{d.purpose.titleLine1}</span>
          <span className="purpose-title-line">{d.purpose.titleLine2}</span>
          <span className="purpose-title-line accent">{d.purpose.titleAccent}</span>
        </h2>
        <p className="purpose-lead">{d.purpose.lead}</p>
        <p className="section-eyebrow center purpose-pillars-eyebrow">{d.purpose.pillarsEyebrow}</p>
        <div className="purpose-grid">
          {d.purpose.items.map((it) => (
            <div className="purpose-item" key={it.h}>
              <span className="purpose-icon"><Icon name={it.icon} /></span>
              <h3>{it.h}</h3>
              <p>{it.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsStrip() {
  const { d } = useI18n();
  return (
    <section className="stats-strip">
      <div className="container stats-strip-inner">
        {d.strip.map((s) => (
          <div className="strip-item" key={s.h}>
            <span className="strip-icon"><Icon name={s.icon} /></span>
            <div>
              <strong>{s.h}</strong>
              <small>{s.p}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function About() {
  const { d } = useI18n();
  const a = d.about;
  return (
    <section className="section about-section" id="sobre">
      <img className="about-watermark" src="/hero-seal.png" alt="" aria-hidden="true" />
      <div className="container reveal">
        <p className="section-eyebrow">{a.eyebrow}</p>
        <h2 className="about-title">
          <span className="about-title-line">{a.titleLine1}</span>
          <span className="about-title-line accent">{a.titleAccent}</span>
        </h2>
        <p className="section-lead">{a.tagline}</p>
        <span className="about-flourish" aria-hidden="true" />

        <img className="partnership-photo" src={a.photo} alt="Brasil e Omã, uma parceria institucional" />

        <div className="partnership-lead">
          {a.intro.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>

        <div className="mp-grid mp-grid-2 about-mv-grid">
          <div className="about-mv-card">
            <span className="corridor-icon"><Icon name="globe" /></span>
            <h3 className="mp-subtitle mp-subtitle-tight">{a.mission.title}</h3>
            <p>{a.mission.p1}</p>
            <p>{a.mission.p2}</p>
          </div>
          <div className="about-mv-card">
            <span className="corridor-icon"><Icon name="laurel" /></span>
            <h3 className="mp-subtitle mp-subtitle-tight">{a.vision.title}</h3>
            <p>{a.vision.p1}</p>
            <p>{a.vision.p2}</p>
          </div>
        </div>

        <div className="about-section-card">
          <span className="corridor-icon"><Icon name="scale" /></span>
          <h3 className="mp-subtitle mp-subtitle-tight">{a.principles.title}</h3>
          <p className="partnership-block-lead">{a.principles.p1}</p>
          <p className="partnership-block-lead">{a.principles.p2}</p>
          <p className="cp-chips-label">{a.principles.listTitle}</p>
          <ul className="why-list about-why-list">
            {a.principles.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>

        <div className="about-section-card">
          <span className="corridor-icon"><Icon name="bank" /></span>
          <h3 className="mp-subtitle mp-subtitle-tight">{a.governance.title}</h3>
          <p>{a.governance.p1}</p>
          <p>{a.governance.p2}</p>
          <p>{a.governance.p3}</p>
        </div>

        <div className="about-section-card">
          <span className="corridor-icon"><Icon name="network" /></span>
          <h3 className="mp-subtitle mp-subtitle-tight">{a.role.title}</h3>
          <p className="partnership-block-lead">{a.role.p1}</p>
          <p className="partnership-block-lead">{a.role.p2}</p>
          <ul className="flow-items about-role-list">
            {a.role.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>

        <div className="mp-closing about-commitment">
          <h3 className="section-title center">{a.commitment.title}</h3>
          <p className="section-lead mp-lead-center">{a.commitment.p1}</p>
          <p className="section-lead mp-lead-center">{a.commitment.p2}</p>
          <p className="mp-closing-quote">{a.commitment.quote}</p>
        </div>
      </div>
    </section>
  );
}

export function Moment() {
  const { d } = useI18n();
  return (
    <section className="section section-alt" id="momento">
      <div className="container reveal">
        <p className="section-eyebrow">{d.moment.eyebrow}</p>
        <h2 className="section-title">{d.moment.title}</h2>
        <p className="section-lead">{d.moment.lead}</p>
        <div className="grid grid-3">
          {d.moment.cards.map((c) => (
            <article className="card" key={c.h}>
              <div className="card-icon">{c.icon}</div>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Countries() {
  const { d } = useI18n();
  const { brazil, oman } = d.countries;
  return (
    <section className="section" id="paises">
      <div className="container reveal">
        <p className="section-eyebrow center">{d.countries.eyebrow}</p>
        <h2 className="section-title countries-title">{d.countries.title}</h2>
        <span className="about-flourish countries-flourish" aria-hidden="true" />
        <p className="countries-lead">{d.countries.lead}</p>
        <div className="countries-grid-wrap">
          <div className="grid grid-2">
            {[brazil, oman].map((c) => (
              <div className="country" key={c.name}>
                <div className="country-flag">{c.flag}</div>
                <h3>{c.name}</h3>
                <p className="sub">{c.sub}</p>
                <ul>
                  {c.items.map((it) => (
                    <li key={it.b}>
                      <b>{it.b}</b> {it.t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="countries-connector" aria-hidden="true">
            <span className="connector-badge"><Icon name="globe" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Partnership() {
  const { d } = useI18n();
  const p = d.partnership;
  return (
    <section className="section section-alt partnership-section" id="parceria">
      <img className="partnership-map" src="/hero-map-dots.png" alt="" aria-hidden="true" />
      <div className="container reveal">
        <p className="section-eyebrow">{p.eyebrow}</p>
        <span className="mini-rule" aria-hidden="true" />
        <h2 className="section-title">
          <span className="section-title-line">{p.titleLine1}</span>
          <span className="section-title-line accent">{p.titleAccent}</span>
        </h2>
        <span className="about-flourish" aria-hidden="true" />

        <img className="partnership-photo" src={p.photo} alt="Brasil e Omã, uma parceria de mãos dadas" />

        <div className="partnership-lead">
          {p.leadParagraphs.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>

        <h3 className="mp-subtitle mp-subtitle-tight">{p.flowTitle}</h3>
        <div className="flow-wrap">
          <span className="flow-end-dot dot-left" />
          <span className="flow-end-dot dot-right" />
          <div className="flow flow-detailed">
            <div className="flow-box flow-box-detailed">
              <div className="flow-box-head">
                <span className="flow-flag">{p.flowFrom.flag}</span>
                <div>
                  <h4>{p.flowFrom.h}</h4>
                  <span className="flow-subtitle">{p.flowFrom.subtitle}</span>
                </div>
              </div>
              <ul className="flow-items">
                {p.flowFrom.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <p className="flow-note">{p.flowFrom.note}</p>
            </div>
            <span className="flow-badge"><Icon name="swap" /></span>
            <div className="flow-box flow-box-detailed">
              <div className="flow-box-head">
                <span className="flow-flag">{p.flowTo.flag}</span>
                <div>
                  <h4>{p.flowTo.h}</h4>
                  <span className="flow-subtitle">{p.flowTo.subtitle}</span>
                </div>
              </div>
              <ul className="flow-items">
                {p.flowTo.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <p className="flow-note">{p.flowTo.note}</p>
            </div>
          </div>
        </div>

        <div className="corridor-block">
          <span className="corridor-icon"><Icon name="ship" /></span>
          <div>
            <h3 className="mp-subtitle mp-subtitle-tight">{p.corridor.title}</h3>
            <p>{p.corridor.p1}</p>
            <p>{p.corridor.p2}</p>
            <p>{p.corridor.p3}</p>
          </div>
        </div>

        <h3 className="mp-subtitle mp-subtitle-tight">{p.investments.title}</h3>
        <p className="partnership-block-lead">{p.investments.lead}</p>
        <div className="cp-chips">
          {p.investments.items.map((it) => (
            <span className="cp-chip" key={it}>{it}</span>
          ))}
        </div>

        <div className="spotlight-card">
          <p className="section-eyebrow">{p.spotlight.eyebrow}</p>
          <h3 className="mp-subtitle mp-subtitle-tight">{p.spotlight.title}</h3>
          <p>{p.spotlight.p1}</p>
          <p>{p.spotlight.p2}</p>
        </div>

        <h3 className="mp-subtitle mp-subtitle-tight">{p.whyOman.title}</h3>
        <ul className="why-list">
          {p.whyOman.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <h3 className="mp-subtitle mp-subtitle-tight">{p.stats.title}</h3>
        <div className="stats-table">
          {p.stats.rows.map((r) => (
            <div className="stats-row" key={r.label}>
              <span className="stats-label">{r.label}</span>
              <span className="stats-value">🇧🇷 {r.brazil}</span>
              <span className="stats-value">🇴🇲 {r.oman}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstitutionalVideo() {
  const { d } = useI18n();
  const v = d.video;
  const src = process.env.NEXT_PUBLIC_INSTITUTIONAL_VIDEO || "/institucional.mp4";
  return (
    <section className="section video-section" id="video">
      <div className="container reveal">
        <p className="section-eyebrow center">{v.eyebrow}</p>
        <h2 className="section-title center">{v.title}</h2>
        <span className="about-flourish video-flourish" aria-hidden="true" />
        <p className="section-lead center">{v.lead}</p>
        <div className="video-frame">
          <video controls preload="none" playsInline poster="/hero-seal.png">
            <source src={src} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const { d } = useI18n();
  return (
    <section className="section services-section" id="servicos">
      <img className="services-map" src="/hero-map-dots.png" alt="" aria-hidden="true" />
      <div className="container reveal">
        <p className="section-eyebrow eyebrow-arrow">{d.services.eyebrow}</p>
        <h2 className="section-title">
          <span className="section-title-line">{d.services.titleLine1}</span>
          <span className="section-title-line accent">{d.services.titleAccent}</span>
        </h2>
        <p className="section-lead">{d.services.lead}</p>
        <img className="partnership-photo" src={d.services.photo} alt="Reunião institucional da Câmara de Comércio Brasil–Omã" />
        <div className="grid grid-3">
          {d.services.cards.map((c) => (
            <article className={`card${c.featured ? " card-featured" : ""}`} key={c.h}>
              <div className="card-icon"><Icon name={c.icon} /></div>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Ecosystem() {
  const { d } = useI18n();
  return (
    <section className="section section-alt ecosystem-section" id="ecossistema">
      <img className="ecosystem-map" src="/hero-map-dots.png" alt="" aria-hidden="true" />
      <div className="container reveal">
        <p className="section-eyebrow">{d.ecosystem.eyebrow}</p>
        <span className="mini-rule" aria-hidden="true" />
        <h2 className="section-title">
          {d.ecosystem.titleLine1}{" "}
          <span className="accent">{d.ecosystem.titleAccent}</span>
        </h2>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
        <p className="section-lead eco-lead">{d.ecosystem.lead}</p>
        <div className="eco-grid">
          {d.ecosystem.cards.map((c) => (
            <article className="eco-card" key={c.h}>
              {c.logo ? (
                <img className="eco-logo" src={c.logo} alt="" />
              ) : (
                <span className="eco-logo eco-logo-placeholder"><Icon name="network" /></span>
              )}
              <div className="eco-card-body">
                <span className="tag">{c.tag}</span>
                <h3>{c.h}</h3>
                <p>{c.p}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Membership() {
  const { d } = useI18n();
  const mid = Math.ceil(d.membership.benefits.length / 2);
  const col1 = d.membership.benefits.slice(0, mid);
  const col2 = d.membership.benefits.slice(mid);
  return (
    <section className="section" id="associacao">
      <div className="container reveal">
        <div className="membership-top">
          <div>
            <p className="section-eyebrow">{d.membership.eyebrow}</p>
            <h2 className="section-title">
              <span className="section-title-line">{d.membership.titleLine1}</span>
              <span className="section-title-line accent">{d.membership.titleAccentLine1}</span>
              <span className="section-title-line accent">{d.membership.titleAccentLine2}</span>
            </h2>
            <span className="about-flourish" aria-hidden="true" />
            <p className="section-lead">{d.membership.lead}</p>
          </div>
          <div className="membership-map" aria-hidden="true">
            <img src="/membership-map.png" alt="" />
            <svg viewBox="0 0 500 300" className="membership-arcs">
              <path d="M140,225 Q225,75 310,135" />
              <path d="M140,225 Q235,95 320,150" />
              <circle cx="140" cy="225" r="4.5" className="arc-dot" />
              <circle cx="310" cy="135" r="4.5" className="arc-dot" />
            </svg>
          </div>
        </div>
        <div className="benefits">
          <ul>
            {col1.map((b) => (
              <li key={b.text}>
                <span className="benefit-icon"><Icon name={b.icon} /></span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
          <ul>
            {col2.map((b) => (
              <li key={b.text}>
                <span className="benefit-icon"><Icon name={b.icon} /></span>
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <a href="#solicitar" className="btn btn-primary">{d.membership.cta}</a>
      </div>
    </section>
  );
}

export function News() {
  const { d } = useI18n();
  return (
    <section className="section section-alt news-section" id="noticias">
      <img className="news-seal" src="/hero-seal.png" alt="" aria-hidden="true" />
      <div className="container reveal">
        <p className="section-eyebrow">{d.news.eyebrow}</p>
        <h2 className="section-title">{d.news.title}</h2>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
        <p className="section-lead">{d.news.lead}</p>
        <div className="grid grid-3">
          {d.news.items.map((n) => {
            const body = (
              <>
                <div className="news-card-top">
                  <span className="news-icon"><Icon name={n.icon} /></span>
                  <span className="news-tag">{n.tag}</span>
                </div>
                <time>{n.date}</time>
                <h3>{n.h}</h3>
                <p>{n.p}</p>
                <span className="news-arrow" aria-hidden="true">→</span>
              </>
            );
            return n.link ? (
              <Link href={n.link} className="news-card" key={n.h}>
                {body}
              </Link>
            ) : (
              <article className="news-card" key={n.h}>
                {body}
              </article>
            );
          })}
        </div>
        <span className="diamond-flourish news-bottom-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
      </div>
    </section>
  );
}
