"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

export type PartnerItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  sector: string | null;
  website: string | null;
};

/** Página pública "Parceiros e Associados" (/parceiros). Lista curada manualmente
 *  pelo admin em /admin/parceiros — nunca gerada automaticamente a partir da base
 *  de associados, pra nunca sugerir uma parceria que não existe de fato. */
export function PartnersPage({ partners }: { partners: PartnerItem[] }) {
  const { d } = useI18n();
  const p = d.partners;

  return (
    <section className="section partners-section">
      <div className="container reveal">
        <p className="section-eyebrow">{p.eyebrow}</p>
        <h1 className="section-title">
          <span className="section-title-line">{p.title}</span>
          <span className="section-title-line accent">{p.titleAccent}</span>
        </h1>
        <p className="section-lead">{p.lead}</p>

        <p className="section-eyebrow center eco-section-label">{p.gridEyebrow}</p>
        <span className="diamond-flourish" aria-hidden="true">
          <span className="df-line" /><span className="df-dot" /><span className="df-line" />
        </span>

        {partners.length === 0 ? (
          <div className="partners-empty">
            <Icon name="handshake" />
            <h3>{p.emptyTitle}</h3>
            <p>{p.emptyText}</p>
          </div>
        ) : (
          <div className="partners-grid">
            {partners.map((item) => {
              const card = (
                <>
                  <span className="partner-card-logo">
                    {item.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.logoUrl} alt="" />
                    ) : (
                      <Icon name="briefcase" />
                    )}
                  </span>
                  <span className="partner-card-name">{item.name}</span>
                  {item.sector && <span className="partner-card-sector">{item.sector}</span>}
                </>
              );
              return item.website ? (
                <a key={item.id} className="partner-card" href={item.website} target="_blank" rel="noopener noreferrer" title={p.visitWebsite}>
                  {card}
                </a>
              ) : (
                <div key={item.id} className="partner-card">
                  {card}
                </div>
              );
            })}
          </div>
        )}

        <div className="partners-cta-strip">
          <div className="partners-cta-card">
            <span className="partners-cta-icon"><Icon name="handshake" /></span>
            <h3>{p.becomePartnerTitle}</h3>
            <p>{p.becomePartnerText}</p>
            <Link href="/contato" className="eco-cta">{p.becomePartnerCta} <Icon name="swap" /></Link>
          </div>
          <div className="partners-cta-card">
            <span className="partners-cta-icon"><Icon name="people" /></span>
            <h3>{p.becomeMemberTitle}</h3>
            <p>{p.becomeMemberText}</p>
            <Link href="/associe-se" className="eco-cta">{p.becomeMemberCta} <Icon name="swap" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
