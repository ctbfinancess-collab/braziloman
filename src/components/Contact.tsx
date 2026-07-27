"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

type Status = "idle" | "sending" | "ok" | "err";

export default function Contact() {
  const { d } = useI18n();
  const f = d.contact.form;
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <section className="section contact-section" id="contato">
      <div className="container contact-grid reveal">
        <div>
          <p className="section-eyebrow">{d.contact.eyebrow}</p>
          <span className="diamond-flourish contact-eyebrow-flourish" aria-hidden="true">
            <span className="df-line" /><span className="df-dot" /><span className="df-line" />
          </span>
          <h2 className="section-title">{d.contact.title}</h2>
          <span className="contact-title-rule" aria-hidden="true" />
          <p className="section-lead">{d.contact.lead}</p>
          <ul className="contact-info">
            <li>
              <span className="contact-icon"><Icon name="mail" /></span>
              <div>
                <strong>{d.contact.emailLabel}</strong>
                <a href="mailto:contact@brasilomanchamber.org">contact@brasilomanchamber.org</a>
              </div>
            </li>
            <li>
              <span className="contact-icon"><Icon name="pin" /></span>
              <div>
                <strong>{d.contact.locationLabel}</strong>
                <span>{d.contact.address}</span>
              </div>
            </li>
          </ul>
          <span className="diamond-flourish contact-quote-flourish" aria-hidden="true">
            <span className="df-line" /><span className="df-dot" /><span className="df-line" />
          </span>
          <span className="contact-quote-icon" aria-hidden="true"><Icon name="handshake" /></span>
          <p className="contact-quote">{d.contact.quote}</p>
        </div>

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <span className="diamond-flourish contact-form-flourish" aria-hidden="true">
            <span className="df-line" /><span className="df-dot" /><span className="df-line" />
          </span>
          <label>
            {f.name}
            <input type="text" name="name" placeholder={f.namePh} required autoComplete="name" maxLength={120} />
          </label>
          <label>
            {f.email}
            <input type="email" name="email" placeholder={f.emailPh} required autoComplete="email" maxLength={160} />
          </label>
          <label>
            {f.company}
            <input type="text" name="company" placeholder={f.companyPh} autoComplete="organization" maxLength={160} />
          </label>
          <label>
            {f.message}
            <textarea name="message" placeholder={f.messagePh} rows={4} required maxLength={4000} />
          </label>
          {/* honeypot anti-spam field (hidden from users) */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            <Icon name="mail" />
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
      <span className="diamond-flourish contact-bottom-flourish" aria-hidden="true">
        <span className="df-line" /><span className="df-dot" /><span className="df-line" />
      </span>
    </section>
  );
}
