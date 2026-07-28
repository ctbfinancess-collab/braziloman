"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const PHOTOS = [
  "/news/lancamento/ccb-7.jpeg",
  "/news/lancamento/ccb-1.jpg",
  "/news/lancamento/ccb-5.jpeg",
  "/news/lancamento/ccb-6.jpeg",
  "/news/lancamento/ccb-3.jpeg",
  "/news/lancamento/ccb-4.jpeg",
  "/news/lancamento/ccb-8.jpeg",
  "/news/lancamento/ccb-2.jpeg",
];

const VIDEOS = [
  { src: "/news/lancamento/video-3.mp4", poster: "/news/lancamento/video-3-poster.jpg" },
  { src: "/news/lancamento/video-2.mp4", poster: "/news/lancamento/video-2-poster.jpg" },
  { src: "/news/lancamento/video-5.mp4", poster: "/news/lancamento/video-5-poster.jpg" },
  { src: "/news/lancamento/video-6.mp4", poster: "/news/lancamento/video-6-poster.jpg" },
  { src: "/news/lancamento/video-4.mp4", poster: "/news/lancamento/video-4-poster.jpg" },
  { src: "/news/lancamento/video-1.mp4", poster: "/news/lancamento/video-1-poster.jpg" },
];

const PRESS = [
  { slug: "gazetadebrasilia", name: "Gazeta de Brasília", url: "https://gazetadebrasilia.com/2026/05/11/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "protagonistasdobrasil", name: "Protagonistas do Brasil", url: "https://protagonistasdobrasil.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "istoefloripa", name: "IstoÉ Floripa", url: "https://istoefloripa.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "istoebahia", name: "IstoÉ Bahia", url: "https://istoebahia.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "istoesc", name: "IstoÉ SC", url: "https://istoesc.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "istoetech", name: "IstoÉ Tech", url: "https://istoe.tech/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "justicanews", name: "Justiça News", url: "https://justica.news/2026/05/11/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "poderenegocios", name: "Poder e Negócios", url: "https://poderenegocios.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "businessweek", name: "BusinessWeek Brasil", url: "https://businessweek.com.br/2026/05/11/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "juridiconews", name: "Jurídico News", url: "https://juridico.news/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "usnews", name: "US News Brasil", url: "https://usnews.com.br/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "handelsblatt", name: "Handelsblatt Brasil", url: "https://handelsblatt.com.br/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "istoenegocios", name: "IstoÉ Negócios", url: "https://istoenegocios.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "successmagazine", name: "Success Magazine", url: "https://successmagazine.com.br/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "jornaldorecife", name: "Jornal do Recife", url: "https://jornaldorecife.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "correiodopara", name: "Correio do Pará", url: "https://correiodopara.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "correiodoceara", name: "Correio do Ceará", url: "https://correiodoceara.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "correiodealagoas", name: "Correio de Alagoas", url: "https://correiodealagoas.com/camara-de-comercio-brasil-oma-congresso-nacional/" },
  { slug: "valoreconomico", name: "Valor Econômico", url: "https://valor.globo.com/patrocinado/dino/noticia/2026/05/13/congresso-nacional-recebe-tributo-a-jk-em-cerimonia-1.ghtml" },
  { slug: "oglobo", name: "O Globo", url: "https://oglobo.globo.com/google/amp/patrocinado/dino/noticia/2026/05/13/congresso-nacional-recebe-tributo-a-jk-em-cerimonia-1.ghtml" },
  { slug: "terra", name: "Terra", url: "https://www.terra.com.br/noticias/congresso-nacional-recebe-tributo-a-jk-em-cerimonia,b6b78aed2abaac2985da5562cc48506codmxfb9w.html" },
];

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

        <h2 className="mp-subtitle mp-subtitle-tight">{a.videoTitle}</h2>
        <div className="launch-videos">
          {VIDEOS.map((v) => (
            <video key={v.src} className="launch-video" controls preload="none" poster={v.poster}>
              <source src={v.src} type="video/mp4" />
            </video>
          ))}
        </div>

        <h2 className="mp-subtitle mp-subtitle-tight">{a.galleryTitle}</h2>
        <div className="launch-gallery">
          {PHOTOS.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p} src={p} alt="" loading="lazy" />
          ))}
        </div>

        <h2 className="mp-subtitle mp-subtitle-tight">{a.pressTitle}</h2>
        <div className="launch-press">
          {PRESS.map((p) => (
            <a className="launch-press-item" key={p.slug} href={p.url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/news/lancamento/press/${p.slug}.png`} alt={p.name} loading="lazy" />
              <span className="launch-press-caption">{p.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
