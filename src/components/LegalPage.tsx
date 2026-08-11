"use client";

import { useI18n } from "@/lib/i18n";

/** Página de texto legal simples (Política de Privacidade, Termos de Uso) —
 *  mesmo formato de dados já usado em content.ts para os outros documentos
 *  institucionais (Código de Ética, Compliance etc.), só que reaproveitado
 *  aqui num layout de leitura corrida, sem cards/timeline. Recebe a chave
 *  (não o objeto pronto) pra poder ficar "use client" sozinho, deixando a
 *  page.tsx como server component com metadata normal. */
export function LegalPage({ docKey }: { docKey: "privacyPolicy" | "termsOfUse" | "membershipContract" }) {
  const { d, lang } = useI18n();
  const doc = d.legalPages[docKey];
  return (
    <section className="section">
      <div className="container reveal" style={{ maxWidth: 760 }}>
        <p className="section-eyebrow center">{lang === "pt" ? "Documento institucional" : "Institutional document"}</p>
        <h1 className="section-title center">{doc.title}</h1>
        <span className="about-flourish mp-flourish-center" aria-hidden="true" />
        <p className="section-lead" style={{ marginTop: 24 }}>{doc.intro}</p>
        {doc.sections.map((s) => (
          <div key={s.h} style={{ marginTop: 32 }}>
            <h2 className="mp-subtitle" style={{ fontSize: "1.15rem" }}>{s.h}</h2>
            <p className="section-lead" style={{ textAlign: "left", margin: "10px 0 0" }}>{s.p}</p>
          </div>
        ))}
        <p className="cp-chips-label" style={{ marginTop: 48 }}>{doc.footer}</p>
      </div>
    </section>
  );
}
