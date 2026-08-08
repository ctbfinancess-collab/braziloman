"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function GalleryArticle() {
  const { d } = useI18n();
  const a = d.galleryArticle;
  return (
    <section className="section launch-article">
      <div className="container reveal">
        <Link href="/noticias" className="launch-back">← {a.backLabel}</Link>
        <span className="news-tag">{a.tag}</span>
        <time className="launch-date">{a.date}</time>
        <h1 className="section-title">{a.title}</h1>
        <div className="launch-body">
          <p>{a.lead}</p>
        </div>

        <h2 className="mp-subtitle mp-subtitle-tight">{a.videoTitle}</h2>
        {a.videos.length > 0 ? (
          <div className="launch-videos">
            {a.videos.map((v) => (
              <video key={v.src} className="launch-video" controls preload="none" poster={v.poster}>
                <source src={v.src} type="video/mp4" />
              </video>
            ))}
          </div>
        ) : (
          <p className="launch-gallery-empty">{a.emptyVideos}</p>
        )}

        <h2 className="mp-subtitle mp-subtitle-tight">{a.galleryTitle}</h2>
        {a.gallery.length > 0 ? (
          <div className="launch-gallery">
            {a.gallery.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p} src={p} alt="" loading="lazy" />
            ))}
          </div>
        ) : (
          <p className="launch-gallery-empty">{a.emptyGallery}</p>
        )}
      </div>
    </section>
  );
}
