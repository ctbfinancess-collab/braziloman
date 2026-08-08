"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

export default function RodadaNegociosArticle() {
  const { d } = useI18n();
  const a = d.rodadaNegociosArticle;
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

        <h2 className="mp-subtitle mp-subtitle-tight">{a.highlightsTitle}</h2>
        <div className="article-highlight-grid cols-3">
          {a.highlights.map((item) => (
            <div className="article-highlight-card" key={item.h}>
              <span className="benefit-icon"><Icon name={item.icon} /></span>
              <h3>{item.h}</h3>
              <p>{item.p}</p>
            </div>
          ))}
        </div>

        <div className="article-cta-box">
          <h3>{a.ctaTitle}</h3>
          <p>{a.ctaText}</p>
          <p className="article-cta-meta">
            <strong>{a.ctaDateRange}</strong>
            <span>{a.ctaLocation}</span>
          </p>
          <p className="article-cta-availability">{a.ctaAvailability}</p>
          <p className="article-cta-contact">{a.ctaContactLabel}</p>
          <a href={a.ctaWhatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary article-cta-btn">
            <Icon name="whatsapp" /> {a.ctaWhatsappLabel}
          </a>
          <p className="article-cta-motto">{a.ctaMotto}</p>
        </div>
      </div>
    </section>
  );
}
