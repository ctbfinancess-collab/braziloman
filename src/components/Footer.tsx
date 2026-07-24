"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { d } = useI18n();
  const links = [
    { href: "#sobre", label: d.nav.about },
    { href: "#paises", label: d.nav.countries },
    { href: "#servicos", label: d.nav.services },
    { href: "#ecossistema", label: d.nav.ecosystem },
    { href: "#associacao", label: d.nav.membership },
    { href: "#noticias", label: d.nav.news },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <Image
                src="/logo-ctb-transparent.png"
                alt="Selo CTB"
                width={52}
                height={52}
              />
              <div>
                <strong>CTB</strong>
                <p>{d.footer.tagline}</p>
              </div>
            </div>
            <p style={{ color: "var(--fg-dim)", fontSize: "0.88rem", marginTop: 18, maxWidth: 320 }}>
              {d.footer.about}
            </p>
          </div>

          <div className="footer-col">
            <h4>{d.footer.navTitle}</h4>
            {links.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </div>

          <div className="footer-col">
            <h4>{d.footer.contactTitle}</h4>
            <a href="mailto:contato@braziloman.org">contato@braziloman.org</a>
            <p>São Paulo, Brasil</p>
            <p>Mascate, Omã</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CTB — Câmara de Comércio Brasil–Omã. {d.footer.rights}</span>
          <span>“União e Prosperidade”</span>
        </div>
      </div>
    </footer>
  );
}
