"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

export default function MissaoArticle() {
  const { d } = useI18n();
  const a = d.missaoArticle;
  return (
    <section className="section launch-article">
      <div className="container reveal">
        <Link href="/noticias" className="launch-back">← {a.backLabel}</Link>
        <span className="news-tag">{a.tag}</span>
        <h1 className="section-title">{a.title}</h1>
        <time className="launch-date">{a.subtitle}</time>

        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="launch-featured-image" src={a.image} alt={a.title} />
        )}

        <div className="launch-body">
          <p>{a.intro}</p>
        </div>

        <h2 className="mp-subtitle mp-subtitle-tight">{a.agendaTitle}</h2>
        <div className="launch-body">
          <p>{a.agendaIntro}</p>
        </div>
        <div className="missao-agenda-grid">
          {a.agendaItems.map((item) => (
            <div className="missao-agenda-card" key={item.h}>
              <span className="benefit-icon"><Icon name={item.icon} /></span>
              <h3>{item.h}</h3>
              <p>{item.p}</p>
            </div>
          ))}
        </div>

        <h2 className="mp-subtitle mp-subtitle-tight">{a.cultureTitle}</h2>
        <div className="launch-body">
          <p>{a.culture1}</p>
          <p>{a.culture2}</p>
          <p>{a.culture3}</p>
        </div>

        <div className="missao-cta-box">
          <h3>{a.ctaTitle}</h3>
          <p>{a.ctaText}</p>
          <p className="missao-cta-meta">
            <strong>{a.ctaDateRange}</strong>
            <span>{a.ctaLocation}</span>
          </p>
          <p className="missao-cta-availability">{a.ctaAvailability}</p>
          <p className="missao-cta-contact">{a.ctaContactLabel}</p>
          <a href={a.ctaWhatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary missao-cta-btn">
            <Icon name="whatsapp" /> {a.ctaWhatsappLabel}
          </a>
          <p className="missao-cta-motto">{a.ctaMotto}</p>
        </div>
      </div>
    </section>
  );
}
