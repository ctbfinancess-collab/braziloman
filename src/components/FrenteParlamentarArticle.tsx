"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function FrenteParlamentarArticle() {
  const { d } = useI18n();
  const a = d.frenteParlamentarArticle;
  return (
    <section className="section launch-article">
      <div className="container reveal">
        <Link href="/noticias" className="launch-back">← {a.backLabel}</Link>
        <span className="news-tag">{a.tag}</span>
        <time className="launch-date">{a.date}</time>
        <h1 className="section-title">{a.title}</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="launch-featured-image" src={a.image} alt={a.title} />
        <div className="launch-body">
          <p>{a.p1}</p>
        </div>
      </div>
    </section>
  );
}
