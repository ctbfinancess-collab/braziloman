"use client";

import { useState } from "react";
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
  const src = process.env.NEXT_PUBLIC_HERO_VIDEO || "/institucional.mp4";
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
  const e = d.ecosystem;
  return (
    <section className="ecosystem-section" id="ecossistema">
      <div className="eco-hero">
        <div className="eco-hero-content">
          <p className="section-eyebrow">{e.eyebrow}</p>
          <h1 className="section-title">
            {e.titleLines.map((l) => (
              <span className="section-title-line" key={l.text}>
                {l.text}
                <span className="accent">{l.accent}</span>
              </span>
            ))}
          </h1>
          <p className="section-lead">{e.lead}</p>
          <div className="eco-highlights">
            {e.highlights.map((h) => (
              <div className="eco-highlight" key={h.h}>
                <span className="eco-highlight-icon"><Icon name={h.icon} /></span>
                <h4>{h.h}</h4>
                <p>{h.p}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="eco-hero-photo">
          <img src={e.photo} alt="Escritório com globo, representando alcance global" />
        </div>
      </div>

      <div className="container reveal">
        <p className="section-eyebrow center eco-section-label">{e.companiesEyebrow}</p>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
        <div className="eco-grid">
          {e.companies.map((c) => (
            <article className="eco-card" key={c.h}>
              <span className={`eco-logo-wrap${c.logo.includes("logo-ctb-transparent") ? " eco-logo-wrap-dark" : ""}`}>
                <img className="eco-logo" src={c.logo} alt="" />
              </span>
              <div className="eco-card-body">
                <span className="tag">{c.tag}</span>
                <h3>{c.h}</h3>
                <p>{c.p}</p>
                {c.url ? (
                  c.url.startsWith("/") ? (
                    <Link href={c.url} className="eco-cta">{c.cta} <Icon name="swap" /></Link>
                  ) : (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="eco-cta">{c.cta} <Icon name="swap" /></a>
                  )
                ) : (
                  <span className="eco-cta eco-cta-disabled">{c.cta} <Icon name="swap" /></span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="container reveal">
        <p className="section-eyebrow center eco-section-label">{e.solutionsEyebrow}</p>
        <div className="eco-solutions-wrap">
          <div className="eco-solutions">
            {e.solutions.map((s) => (
              <div className="eco-solution" key={s.h}>
                <span className="eco-solution-icon"><Icon name={s.icon} /></span>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Membership() {
  const { d } = useI18n();
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
            <div className="membership-ctas">
              <a href="/associe-se#mp-form" className="btn btn-primary">
                {d.membership.cta} <Icon name="arrowright" />
              </a>
              <Link href="/contato" className="btn btn-ghost">
                {d.membership.ctaSecondary} <Icon name="mail" />
              </Link>
            </div>
            <div className="membership-quick-features">
              {d.membership.quickFeatures.map((f) => (
                <div className="membership-quick-feature" key={f.text}>
                  <span className="benefit-icon"><Icon name={f.icon} /></span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="membership-map">
              <img src="/associe-se/mapa.jpg" alt="Cartões de associado da Câmara nas categorias Gold, Black e Platinum" />
            </div>
            <blockquote className="membership-quote">
              <p>{d.membership.quote}</p>
            </blockquote>
          </div>
        </div>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
      </div>
    </section>
  );
}

export function MembershipLevels() {
  const { d } = useI18n();
  return (
    <section className="membership-levels">
      <div className="container reveal">
        <p className="section-eyebrow center light">{d.membership.levels.eyebrow}</p>
        <h2 className="section-title center light">{d.membership.levels.title}</h2>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
        <p className="section-lead mp-lead-center light">{d.membership.levels.lead}</p>
        <div className="membership-levels-grid">
          <img src="/loyalty/gold-front.jpg?v=3" alt="Cartão de associado Gold Member" />
          <img src="/loyalty/black-front.jpg?v=3" alt="Cartão de associado Black Member" />
          <img src="/loyalty/platinum-front.jpg?v=3" alt="Cartão de associado Platinum Member" />
        </div>
      </div>
    </section>
  );
}

export function MembershipPricing() {
  const { d } = useI18n();
  return (
    <section className="section membership-pricing">
      <div className="container reveal">
        <div className="pricing-grid">
          {d.membership.pricing.tiers.map((t) => (
            <div className={`pricing-card tier-${t.tier.toLowerCase()}`} key={t.tier}>
              <p className="pricing-name">{t.name}</p>
              <p className="pricing-desc">{t.description}</p>
              <p className="pricing-starting">{d.membership.pricing.startingAt}</p>
              <p className="pricing-price">
                {d.membership.pricing.currency} {t.price.toLocaleString("en-US")}
                <span>{d.membership.pricing.perYear}</span>
              </p>
              <ul className="pricing-features">
                {t.features.map((f) => (
                  <li key={f}>
                    <Icon name="check" /> {f}
                  </li>
                ))}
              </ul>
              <a href="/associe-se#mp-form" className="btn pricing-cta">
                {t.cta} <Icon name="arrowright" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MembershipNetworkBand() {
  const { d } = useI18n();
  return (
    <section className="section membership-network-band">
      <div className="container reveal">
        <div className="membership-network-grid">
          {d.membership.network.map((n) => (
            <div className="membership-network-item" key={n.h}>
              <span className="benefit-icon"><Icon name={n.icon} /></span>
              <div>
                <h3>{n.h}</h3>
                <p>{n.p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MembershipHowItWorks() {
  const { d } = useI18n();
  return (
    <section className="section">
      <div className="container reveal">
        <h2 className="section-title center">{d.membership.howItWorks.title}</h2>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>
        <div className="howitworks-row">
          {d.membership.howItWorks.steps.map((s, i) => (
            <div className="howitworks-step" key={s.h}>
              <span className="howitworks-icon"><Icon name={s.icon} /></span>
              <p className="howitworks-num">{i + 1}. {s.h}</p>
              <p className="howitworks-lead">{s.p}</p>
              {i < d.membership.howItWorks.steps.length - 1 && <span className="howitworks-dots" aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button type="button" className="faq-question" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{q}</span>
        <Icon name="chevrondown" />
      </button>
      {open && <p className="faq-answer">{a}</p>}
    </div>
  );
}

export function MembershipFAQ() {
  const { d } = useI18n();
  const f = d.membership.faq;
  return (
    <section className="section section-alt">
      <div className="container reveal membership-faq-grid">
        <div>
          <h2 className="section-title">{f.title}</h2>
          <span className="about-flourish" aria-hidden="true" />
          <div className="faq-list">
            {f.items.map((it) => (
              <FaqItem key={it.q} q={it.q} a={it.a} />
            ))}
          </div>
        </div>
        <div className="faq-help-box">
          <span className="benefit-icon"><Icon name="headset" /></span>
          <h3>{f.help.title}</h3>
          <p>{f.help.lead}</p>
          <Link href="/contato" className="btn btn-primary">
            {f.help.cta} <Icon name="arrowright" />
          </Link>
        </div>
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
        <div className="grid grid-4">
          {d.news.items.map((n) => {
            const body = (
              <>
                {n.image && <img className="news-card-photo" src={n.image} alt="" />}
                <div className="news-card-body">
                  <div className="news-card-top">
                    <span className="news-icon"><Icon name={n.icon} /></span>
                    <span className="news-tag">{n.tag}</span>
                  </div>
                  <time>{n.date}</time>
                  <h3>{n.h}</h3>
                  <p>{n.p}</p>
                  <span className="news-arrow" aria-hidden="true">→</span>
                </div>
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
