"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { d } = useI18n();
  const pathname = usePathname();
  const links = [
    { href: "/a-camara", label: d.nav.about },
    { href: "/brasil-oma", label: d.nav.countries },
    { href: "/atuacao", label: d.nav.services },
    { href: "/ecossistema", label: d.nav.ecosystem },
    { href: "/associe-se", label: d.nav.membership },
    { href: "/noticias", label: d.nav.news },
  ];

  // O Painel do Associado (associados ativos) tem seu próprio rodapé, sem o
  // rodapé institucional do site.
  if (pathname?.startsWith("/membro/painel/")) return null;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <Image
                src="/logo-ctb-transparent.png"
                alt="Selo da Câmara de Comércio Brasil–Omã"
                width={52}
                height={52}
              />
              <div>
                <strong>{d.footer.tagline}</strong>
              </div>
            </div>
            <p style={{ color: "var(--footer-muted)", fontSize: "0.88rem", marginTop: 18, maxWidth: 320 }}>
              {d.footer.about}
            </p>
          </div>

          <div className="footer-col">
            <h4>{d.footer.navTitle}</h4>
            {links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>

          <div className="footer-col">
            <h4>{d.footer.contactTitle}</h4>
            <a href="mailto:contact@brasilomanchamber.org">contact@brasilomanchamber.org</a>
            <p>Brasília, Brasil</p>
            <p>Mascate, Omã</p>
            <p>CNPJ: 68.398.637/0001-11</p>
            <p style={{ marginTop: 10 }}>
              <strong style={{ color: "var(--footer-gold-light)", display: "block", marginBottom: 2, fontSize: "0.82rem" }}>
                {d.footer.branchLabel}
              </strong>
              {d.footer.branchAddress}
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Câmara de Comércio Brasil–Omã. {d.footer.rights}</span>
          <span>“União e Prosperidade”</span>
        </div>
      </div>
    </footer>
  );
}
