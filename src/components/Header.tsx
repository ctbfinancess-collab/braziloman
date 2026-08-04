"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

export default function Header() {
  const { d, lang, toggle } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const links = [
    { href: "/a-camara", label: d.nav.about },
    { href: "/brasil-oma", label: d.nav.countries },
    { href: "/atuacao", label: d.nav.services },
    { href: "/ecossistema", label: d.nav.ecosystem },
    { href: "/noticias", label: d.nav.news },
    { href: "/contato", label: d.nav.contact },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" onClick={close} aria-label={d.brand.tagline}>
          <Image
            className="brand-logo"
            src="/logo-ctb-transparent.png"
            alt="Selo da Câmara de Comércio Brasil–Omã"
            width={69}
            height={69}
            priority
          />
          <span className="brand-text">
            <strong>{d.brand.tagline}</strong>
          </span>
        </Link>

        <nav className={`nav ${open ? "open" : ""}`} aria-label="Menu principal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}>
              {l.label}
            </Link>
          ))}
          <Link href="/membro/login" onClick={close} className="nav-login">
            <Icon name="idcard" className="nav-login-icon" />
            {d.nav.memberLogin}
          </Link>
          <Link href="/associe-se" onClick={close} className="btn btn-primary nav-cta">
            {d.nav.membership}
          </Link>
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
