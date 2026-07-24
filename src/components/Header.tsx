"use client";

import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const { d, lang, toggle } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { href: "#sobre", label: d.nav.about },
    { href: "#paises", label: d.nav.countries },
    { href: "#servicos", label: d.nav.services },
    { href: "#ecossistema", label: d.nav.ecosystem },
    { href: "#associacao", label: d.nav.membership },
    { href: "#noticias", label: d.nav.news },
    { href: "#contato", label: d.nav.contact },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="brand" onClick={close} aria-label="CTB">
          <Image
            className="brand-logo"
            src="/logo-ctb-transparent.png"
            alt="Selo da Câmara de Comércio Brasil–Omã"
            width={46}
            height={46}
            priority
          />
          <span className="brand-text">
            <strong>CTB</strong>
            <small>{d.brand.tagline}</small>
          </span>
        </a>

        <nav className={`nav ${open ? "open" : ""}`} aria-label="Menu principal">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <button
            className="lang-toggle"
            type="button"
            onClick={toggle}
            aria-label="Change language / Mudar idioma"
          >
            <span className={lang === "pt" ? "on" : "off"}>PT</span>
            {" · "}
            <span className={lang === "en" ? "on" : "off"}>EN</span>
          </button>
        </nav>

        <button
          className="menu-btn"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
