"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function LaunchArticle() {
  const { d } = useI18n();
  const a = d.launchArticle;
  return (
    <section className="section launch-article">
      <div className="container reveal">
        <Link href="/noticias" className="launch-back">← {a.backLabel}</Link>
        <span className="news-tag">{a.tag}</span>
        <time className="launch-date">{a.date}</time>
        <h1 className="section-title">{a.title}</h1>
        <p className="launch-quote">{a.quote}</p>
        <div className="launch-body">
          <p>{a.p1}</p>
          <p>{a.p2}</p>
          <p>{a.p3}</p>
        </div>

        {a.videos.length > 0 && (
          <>
            <h2 className="mp-subtitle mp-subtitle-tight">{a.videoTitle}</h2>
            <div className="launch-videos">
              {a.videos.map((v) => (
                <video key={v.src} className="launch-video" controls preload="none" poster={v.poster}>
                  <source src={v.src} type="video/mp4" />
                </video>
              ))}
            </div>
          </>
        )}

        {a.gallery.length > 0 && (
          <>
            <h2 className="mp-subtitle mp-subtitle-tight">{a.galleryTitle}</h2>
            <div className="launch-gallery">
              {a.gallery.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p} src={p} alt="" loading="lazy" />
              ))}
            </div>
          </>
        )}

        {a.press.length > 0 && (
          <>
            <h2 className="mp-subtitle mp-subtitle-tight">{a.pressTitle}</h2>
            <div className="launch-press">
              {a.press.map((p) => (
                <a className="launch-press-item" key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.logo} alt={p.name} loading="lazy" />
                  <span className="launch-press-caption">{p.name}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
