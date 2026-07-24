"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

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
    <section className="section" id="contato">
      <div className="container contact-grid reveal">
        <div>
          <p className="section-eyebrow">{d.contact.eyebrow}</p>
          <h2 className="section-title">{d.contact.title}</h2>
          <p className="section-lead">{d.contact.lead}</p>
          <ul className="contact-info">
            <li>
              <span aria-hidden="true">✉️</span>
              <a href="mailto:contato@braziloman.org">contato@braziloman.org</a>
            </li>
            <li>
              <span aria-hidden="true">📍</span>
              <span>{d.contact.address}</span>
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <label>
            {f.name}
            <input type="text" name="name" required autoComplete="name" maxLength={120} />
          </label>
          <label>
            {f.email}
            <input type="email" name="email" required autoComplete="email" maxLength={160} />
          </label>
          <label>
            {f.company}
            <input type="text" name="company" autoComplete="organization" maxLength={160} />
          </label>
          <label>
            {f.message}
            <textarea name="message" rows={4} required maxLength={4000} />
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
