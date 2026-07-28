"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function MissaoArticle() {
  const { d } = useI18n();
  const a = d.missaoArticle;
  return (
    <section className="section launch-article">
      <div className="container reveal">
        <Link href="/noticias" className="launch-back">← {a.backLabel}</Link>
        <span className="news-tag">{a.tag}</span>
        <time className="launch-date">{a.date}</time>
        <h1 className="section-title">{a.title}</h1>
        <div className="launch-body">
          <p>{a.p1}</p>
          <p>{a.p2}</p>
          <p className="launch-quote">{a.cta}</p>
        </div>
      </div>
    </section>
  );
}
