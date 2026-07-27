"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

type BenefitItem = { icon: string; h: string; p: string };

export function MembershipTabs({ active }: { active: string }) {
  const { d } = useI18n();
  const t = d.membershipPage.tabs;
  const links = [
    { href: "/associe-se", key: "home", label: t.home },
    { href: "/associe-se/beneficios", key: "overview", label: t.overview },
    { href: "/associe-se/entenda", key: "understand", label: t.understand },
    { href: "/associe-se/reputacao", key: "reputation", label: t.reputation },
    { href: "/associe-se/apoio", key: "support", label: t.support },
    { href: "/associe-se/conexao", key: "connection", label: t.connection },
    { href: "/associe-se/expansao", key: "expansion", label: t.expansion },
    { href: "/associe-se/servicos", key: "extra", label: t.extra },
    { href: "/associe-se/consultoria", key: "consulting", label: t.consulting },
  ];
  return (
    <nav className="mp-tabs" aria-label="Navegação da associação">
      <div className="container mp-tabs-inner">
        {links.map((l) => (
          <Link key={l.key} href={l.href} className={`mp-tab${active === l.key ? " active" : ""}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function BenefitGrid({ items, columns = 2 }: { items: BenefitItem[]; columns?: 2 | 4 }) {
  return (
    <div className={`mp-grid mp-grid-${columns}`}>
      {items.map((it) => (
        <div className="mp-benefit" key={it.h}>
          <span className="mp-benefit-icon"><Icon name={it.icon} /></span>
          <div>
            <h3>{it.h}</h3>
            <p>{it.p}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type Status = "idle" | "sending" | "ok" | "err";

function MembershipForm() {
  const { d, lang } = useI18n();
  const f = d.membershipPage.hero.form;
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale: lang }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <form className="contact-form mp-form" onSubmit={onSubmit} noValidate>
      <h3 className="mp-form-title">{d.membershipPage.hero.formTitle}</h3>
      <label>
        {f.name}
        <input type="text" name="name" required autoComplete="name" maxLength={120} />
      </label>
      <label>
        {f.phone}
        <input type="tel" name="phone" autoComplete="tel" maxLength={40} />
      </label>
      <label>
        {f.email}
        <input type="email" name="email" required autoComplete="email" maxLength={160} />
      </label>
      <label>
        {f.company}
        <input type="text" name="company" required autoComplete="organization" maxLength={160} />
      </label>
      <label>
        {f.role}
        <input type="text" name="role" maxLength={120} />
      </label>
      <label>
        {f.sector}
        <input type="text" name="sector" maxLength={120} />
      </label>
      <label>
        {f.country}
        <input type="text" name="country" maxLength={120} />
      </label>
      <label>
        {f.message}
        <textarea name="message" rows={4} maxLength={4000} />
      </label>
      {/* honeypot anti-spam (oculto) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      />
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? f.sending : f.submit}
      </button>
      <p
        className={`form-note ${status === "ok" ? "ok" : status === "err" ? "err" : ""}`}
        role="status"
        aria-live="polite"
      >
        {status === "ok" ? f.ok : status === "err" ? f.err : ""}
      </p>
    </form>
  );
}

export function MembershipHero() {
  const { d } = useI18n();
  const h = d.membershipPage.hero;
  return (
    <section className="section mp-hero" id="solicitar">
      <div className="container mp-hero-grid reveal">
        <div>
          <p className="section-eyebrow">{h.eyebrow}</p>
          <h1 className="section-title">{h.title}</h1>
          <p className="section-lead">{h.p1}</p>
          <p className="section-lead">{h.p2}</p>
          <a href="#mp-form" className="btn btn-primary">{h.cta}</a>
        </div>
        <div id="mp-form">
          <MembershipForm />
        </div>
      </div>
      <span className="diamond-flourish" aria-hidden="true">
        <span className="df-line" /><span className="df-dot" /><span className="df-line" />
      </span>
    </section>
  );
}

export function MembershipOverview() {
  const { d } = useI18n();
  const o = d.membershipPage.overview;
  return (
    <section className="section section-alt" id="beneficios">
      <div className="container reveal">
        <p className="section-eyebrow center">{o.eyebrow}</p>
        <h2 className="section-title center">{o.title}</h2>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead mp-lead-center">{o.lead}</p>
        <h3 className="mp-subtitle">{o.subtitle}</h3>
        <BenefitGrid items={o.items} columns={2} />
      </div>
    </section>
  );
}

export function MembershipUnderstand() {
  const { d } = useI18n();
  const u = d.membershipPage.understand;
  return (
    <section className="section">
      <div className="container reveal">
        <p className="section-eyebrow">{u.eyebrow}</p>
        <h2 className="section-title">{u.title}</h2>
        <hr className="gold-rule" />
        <div className="mp-understand-grid">
          <div className="mp-understand-text">
            <p>{u.p1}</p>
            <p>{u.p2}</p>
          </div>
          <div>
            <h3 className="mp-subtitle mp-subtitle-tight">{u.subtitle}</h3>
            <p className="section-lead">{u.lead}</p>
            <BenefitGrid items={u.items} columns={2} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function MembershipNumberedSection({ index }: { index: number }) {
  const { d } = useI18n();
  const s = d.membershipPage.sections[index];
  return (
    <section className="section mp-numbered">
      <div className="container reveal">
        <p className="section-eyebrow center">{s.eyebrow}</p>
        <h2 className="section-title center mp-numbered-title">
          <span className="mp-number">{s.number}.</span> {s.title}
        </h2>
        <p className="section-lead mp-lead-center">{s.lead}</p>
        <BenefitGrid items={s.items} columns={s.items.length > 4 ? 2 : 4} />
      </div>
    </section>
  );
}

export function MembershipExtra() {
  const { d } = useI18n();
  const e = d.membershipPage.extra;
  return (
    <section className="section section-alt">
      <div className="container reveal">
        <p className="section-eyebrow center">{e.eyebrow}</p>
        <h2 className="section-title center">{e.title}</h2>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <BenefitGrid items={e.items} columns={2} />
      </div>
    </section>
  );
}

export function MembershipClosing() {
  const { d } = useI18n();
  const c = d.membershipPage.closing;
  return (
    <section className="section mp-closing">
      <div className="container reveal">
        <p className="section-eyebrow center">{c.eyebrow}</p>
        <h2 className="section-title center">{c.title}</h2>
        <p className="section-lead mp-lead-center">{c.lead}</p>
        <div className="mp-closing-ctas">
          <Link href="/associe-se#mp-form" className="btn btn-primary">{c.ctaPrimary}</Link>
          <Link href="/contato" className="btn btn-ghost">{c.ctaSecondary}</Link>
        </div>
        <p className="mp-closing-quote">{c.quote}</p>
      </div>
    </section>
  );
}
