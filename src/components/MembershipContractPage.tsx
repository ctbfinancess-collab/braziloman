"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LegalPage } from "./LegalPage";

/** Página do Contrato de Associação. Além do texto (LegalPage), quando
 *  acessada por um associado no meio do fluxo de pagamento (`showAcceptance`,
 *  decidido pelo server component em app/contrato-associacao/page.tsx a
 *  partir do status real da candidatura) mostra a caixinha de aceite + um
 *  botão "Aceitar e voltar" — registra o aceite (mesma função usada em
 *  /escolher-plano e no botão "Pagar contribuição anual") e retorna pra
 *  página de onde vieram via router.back(), pra não deixar o associado
 *  "preso" na leitura do contrato sem saber como voltar pros planos. */
export function MembershipContractPage({
  showAcceptance,
  initialAccepted,
}: {
  showAcceptance: boolean;
  initialAccepted: boolean;
}) {
  const router = useRouter();
  const { lang } = useI18n();
  const [checked, setChecked] = useState(initialAccepted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quando essa aba não tem uma página anterior no histórico (ex: link que
  // abriu numa aba nova antes de deixarmos de usar target="_blank", ou o
  // associado digitou a URL direto), `router.back()` não tem pra onde ir e
  // fica sem fazer nada — history.length <= 1 detecta esse caso e manda pro
  // painel, que já sabe reconstruir a tela certa a partir do status real.
  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/membro/painel");
    }
  }

  async function onAcceptAndBack() {
    if (!checked) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/member/membership/accept-contract", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || (lang === "pt" ? "Não foi possível registrar o aceite." : "Could not record acceptance."));
        return;
      }
      goBack();
    } catch {
      setError(lang === "pt" ? "Não foi possível registrar o aceite." : "Could not record acceptance.");
    } finally {
      // Sempre desliga o "Salvando…", mesmo quando a navegação deu certo —
      // sem isso, se `goBack()` não desmontar o componente na hora (ex: sem
      // histórico, indo pro fallback), o botão ficava preso carregando pra
      // sempre.
      setLoading(false);
    }
  }

  return (
    <>
      <div className="container" style={{ maxWidth: 760, paddingTop: 32 }}>
        <button type="button" className="btn btn-ghost" onClick={goBack}>
          ← {lang === "pt" ? "Voltar" : "Back"}
        </button>
      </div>

      <LegalPage docKey="membershipContract" />

      {showAcceptance && (
        <div className="container" style={{ maxWidth: 760, paddingBottom: 60, marginTop: -24 }}>
          <label className="wiz-check">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            {lang === "pt"
              ? "Li e aceito os termos deste Contrato de Associação."
              : "I have read and accept the terms of this Membership Agreement."}
          </label>
          {error && <p className="form-note err">{error}</p>}
          <button type="button" className="btn btn-primary" disabled={!checked || loading} onClick={onAcceptAndBack} style={{ marginTop: 8 }}>
            {loading
              ? (lang === "pt" ? "Salvando…" : "Saving…")
              : (lang === "pt" ? "Aceitar e voltar" : "Accept and go back")}
          </button>
        </div>
      )}
    </>
  );
}
