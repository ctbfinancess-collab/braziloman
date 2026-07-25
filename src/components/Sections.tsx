"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

// URL do vídeo institucional de fundo do hero. Só é exibido quando
// NEXT_PUBLIC_HERO_VIDEO estiver definido (CDN/S3 em produção, ou o
// caminho local /institucional.mp4 em desenvolvimento). Vazio = sem vídeo.
const HERO_VIDEO = process.env.NEXT_PUBLIC_HERO_VIDEO || "";

export function Hero() {
  const { d } = useI18n();
  return (
    <section className="hero" id="top">
      {HERO_VIDEO ? (
        <>
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="hero-overlay" aria-hidden="true" />
        </>
      ) : null}
      <Image
        className="hero-seal"
        src="/logo-ctb-transparent.png"
        alt=""
        aria-hidden="true"
        width={620}
        height={625}
        priority
      />
      <div className="container hero-inner">
        <p className="eyebrow">{d.hero.eyebrow}</p>
        <h1>
          {d.hero.titleA}
          <span className="accent">{d.hero.titleAccent}</span>
          {d.hero.titleB}
        </h1>
        <p className="hero-lead">{d.hero.lead}</p>
        <div className="hero-actions">
          <a href="#associacao" className="btn btn-primary">{d.hero.ctaJoin}</a>
          <a href="#contato" className="btn btn-ghost">{d.hero.ctaContact}</a>
        </div>
        <p className="hero-motto">{d.hero.motto}</p>
        <dl className="hero-stats">
          {d.hero.stats.map((s) => (
            <div key={s.l}>
              <dt>{s.n}</dt>
              <dd>{s.l}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function About() {
  const { d } = useI18n();
  return (
    <section className="section" id="sobre">
      <div className="container reveal">
        <p className="section-eyebrow">{d.about.eyebrow}</p>
        <h2 className="section-title">{d.about.title}</h2>
        <hr className="gold-rule" />
        <div className="about-grid">
          <div className="about-text">
            <p>{d.about.p1}</p>
            <p>{d.about.p2}</p>
          </div>
          <div className="pillars">
            {d.about.pillars.map((p) => (
              <div className="pillar" key={p.h}>
                <h3>{p.h}</h3>
                <p>{p.p}</p>
              </div>
            ))}
          </div>
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
        <p className="section-eyebrow">{d.countries.eyebrow}</p>
        <h2 className="section-title">{d.countries.title}</h2>
        <hr className="gold-rule" />
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
      </div>
    </section>
  );
}

export function Partnership() {
  const { d } = useI18n();
  const p = d.partnership;
  return (
    <section className="section section-alt" id="parceria">
      <div className="container reveal">
        <p className="section-eyebrow">{p.eyebrow}</p>
        <h2 className="section-title">{p.title}</h2>
        <p className="section-lead">{p.lead}</p>
        <div className="flow">
          <div className="flow-box">
            <h4>{p.flowFrom.h}</h4>
            <p>{p.flowFrom.p}</p>
          </div>
          <div className="flow-arrow">⇄</div>
          <div className="flow-box">
            <h4>{p.flowTo.h}</h4>
            <p>{p.flowTo.p}</p>
          </div>
        </div>
        <p className="section-lead" style={{ marginTop: 32 }}>{p.example}</p>
      </div>
    </section>
  );
}

export function Services() {
  const { d } = useI18n();
  return (
    <section className="section" id="servicos">
      <div className="container reveal">
        <p className="section-eyebrow">{d.services.eyebrow}</p>
        <h2 className="section-title">{d.services.title}</h2>
        <p className="section-lead">{d.services.lead}</p>
        <div className="grid grid-3">
          {d.services.cards.map((c) => (
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

export function Ecosystem() {
  const { d } = useI18n();
  return (
    <section className="section section-alt" id="ecossistema">
      <div className="container reveal">
        <p className="section-eyebrow">{d.ecosystem.eyebrow}</p>
        <h2 className="section-title">{d.ecosystem.title}</h2>
        <p className="section-lead eco-lead">{d.ecosystem.lead}</p>
        <div className="eco-grid">
          {d.ecosystem.cards.map((c) => (
            <article className="eco-card" key={c.h}>
              <span className="tag">{c.tag}</span>
              <h3>{c.h}</h3>
              <p>{c.p}</p>
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
        <p className="section-eyebrow">{d.membership.eyebrow}</p>
        <h2 className="section-title">{d.membership.title}</h2>
        <p className="section-lead">{d.membership.lead}</p>
        <div className="benefits">
          <ul>{col1.map((b) => <li key={b}>{b}</li>)}</ul>
          <ul>{col2.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
        <a href="#contato" className="btn btn-primary">{d.membership.cta}</a>
      </div>
    </section>
  );
}

export function News() {
  const { d } = useI18n();
  return (
    <section className="section section-alt" id="noticias">
      <div className="container reveal">
        <p className="section-eyebrow">{d.news.eyebrow}</p>
        <h2 className="section-title">{d.news.title}</h2>
        <hr className="gold-rule" />
        <div className="grid grid-3">
          {d.news.items.map((n) => (
            <article className="news-card" key={n.h}>
              <span className="news-tag">{n.tag}</span>
              <time>{n.date}</time>
              <h3>{n.h}</h3>
              <p>{n.p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
