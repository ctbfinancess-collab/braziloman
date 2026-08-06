"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";
import { HeroBanner } from "./HeroBanner";

type Card = { h: string; p: string };
type SubBlock = { h: string; p: string; chipsLabel?: string; chips?: string[] };
type Block = {
  number: string;
  icon: string;
  title: string;
  lead?: string;
  body: string;
  chipsLabel?: string;
  chips?: string[];
  cardsLabel?: string;
  cards?: Card[];
  subBlocks?: SubBlock[];
};

function ChipRow({ label, chips }: { label?: string; chips: string[] }) {
  return (
    <div className="cp-chips-wrap">
      {label && <span className="cp-chips-label">{label}</span>}
      <div className="cp-chips">
        {chips.map((c) => (
          <span className="cp-chip" key={c}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function CardRow({ label, cards }: { label?: string; cards: Card[] }) {
  return (
    <div>
      {label && <span className="cp-chips-label">{label}</span>}
      <div className="cp-cards">
        {cards.map((c) => (
          <div className="cp-card" key={c.h}>
            <h4>{c.h}</h4>
            <p>{c.p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConsultingHero() {
  const { d } = useI18n();
  const c = d.consultingPage;
  return (
    <section className="section" id="consultoria">
      <div className="container reveal">
        <HeroBanner
          photo={c.photo}
          alt="Reunião institucional da Câmara com bandeiras do Brasil e de Omã"
          eyebrow={c.eyebrow}
          title={c.title}
          lead={c.p1}
          aspect={1010 / 665}
        />
        <p className="section-lead mp-lead-center">{c.p2}</p>
        <div className="cp-why">
          <h3 className="mp-subtitle">{c.whyTitle}</h3>
          <ul className="cp-why-list">
            {c.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ConsultingSolutionsIntro() {
  const { d } = useI18n();
  return (
    <section className="section section-alt cp-solutions-intro">
      <div className="container reveal">
        <h2 className="section-title center">{d.consultingPage.solutionsTitle}</h2>
      </div>
    </section>
  );
}

export function ConsultingBlocks() {
  const { d } = useI18n();
  const blocks: Block[] = d.consultingPage.blocks;
  return (
    <>
      {blocks.map((b, i) => (
        <section className={`section cp-block ${i % 2 ? "section-alt" : ""}`} key={b.number}>
          <div className="container reveal">
            <div className="cp-block-head">
              <span className="cp-block-icon"><Icon name={b.icon} /></span>
              <div>
                <h3 className="cp-block-title">{b.title}</h3>
              </div>
            </div>
            {b.lead && <p className="cp-block-lead">{b.lead}</p>}
            <p className="cp-block-body">{b.body}</p>
            {b.chips && <ChipRow label={b.chipsLabel} chips={b.chips} />}
            {b.cards && <CardRow label={b.cardsLabel} cards={b.cards} />}
            {b.subBlocks && (
              <div className="cp-subblocks">
                {b.subBlocks.map((sb) => (
                  <div className="cp-subblock" key={sb.h}>
                    <h4>{sb.h}</h4>
                    <p>{sb.p}</p>
                    {sb.chips && <ChipRow label={sb.chipsLabel} chips={sb.chips} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  );
}

export function ConsultingClosing() {
  const { d } = useI18n();
  const c = d.consultingPage.closing;
  return (
    <section className="section cp-closing">
      <div className="container reveal">
        <h2 className="section-title center">{c.title}</h2>
        <p className="section-lead mp-lead-center">{c.p}</p>
      </div>
    </section>
  );
}

type Status = "idle" | "sending" | "ok" | "err";

export function ConsultingForm() {
  const { d, lang } = useI18n();
  const f = d.consultingPage.form;
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
        body: JSON.stringify({ ...data, message: "Solicitação via página de Consultoria Internacional.", locale: lang }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <section className="section section-alt">
      <div className="container reveal cp-form-grid">
        <div>
          <p className="section-eyebrow">{f.eyebrow}</p>
          <h2 className="section-title">{f.title}</h2>
          <p className="section-lead">{f.lead}</p>
        </div>
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <label>
            {f.fields.name}
            <input type="text" name="name" required autoComplete="name" maxLength={120} />
          </label>
          <label>
            {f.fields.company}
            <input type="text" name="company" required autoComplete="organization" maxLength={160} />
          </label>
          <label>
            {f.fields.role}
            <input type="text" name="role" maxLength={120} />
          </label>
          <label>
            {f.fields.email}
            <input type="email" name="email" required autoComplete="email" maxLength={160} />
          </label>
          <label>
            {f.fields.phone}
            <input type="tel" name="phone" autoComplete="tel" maxLength={40} />
          </label>
          <label>
            {f.fields.country}
            <input type="text" name="country" maxLength={120} />
          </label>
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
      </div>
    </section>
  );
}
