"use client";

// Banner institucional reutilizável (A Câmara, Associe-se): a proporção do wrapper é
// fixada igual à da imagem (aspect-ratio inline por página), então cover nunca corta
// nada — nem brasão, nem bandeiras. Título/texto ficam sobrepostos com um scrim de
// legibilidade, como em sites de câmaras internacionais.
export function HeroBanner({
  photo, alt, eyebrow, title, lead, aspect,
}: { photo: string; alt: string; eyebrow: string; title: string; lead: string; aspect: number }) {
  return (
    <div className="acamara-hero-banner" style={{ aspectRatio: aspect }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="acamara-hero-banner-img" src={photo} alt={alt} />
      <div className="acamara-hero-banner-scrim" aria-hidden="true" />
      <div className="acamara-hero-banner-content">
        <p className="acamara-hero-banner-eyebrow">{eyebrow}</p>
        <h1 className="acamara-hero-banner-title">{title}</h1>
        <p className="acamara-hero-banner-lead">{lead}</p>
      </div>
    </div>
  );
}
