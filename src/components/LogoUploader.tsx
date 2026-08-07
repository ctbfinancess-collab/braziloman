"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icons";

/**
 * Upload da logo da empresa pelo próprio associado — usado tanto no Portal do
 * Candidato (etapa de dados da empresa) quanto em "Meu Perfil". Sobe direto pra
 * /api/member/logo (que já persiste no registro do associado), sem depender do
 * fluxo de salvamento do formulário em volta.
 */
export function LogoUploader({ initialUrl }: { initialUrl: string | null }) {
  const { d } = useI18n();
  const t = d.memberArea.dashboard;
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFileChange(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/member/logo", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  async function onRemove() {
    setUploading(true);
    try {
      await fetch("/api/member/logo", { method: "DELETE" });
      setUrl(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="logo-uploader">
      <div className="logo-uploader-preview">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" />
        ) : (
          <Icon name="briefcase" />
        )}
      </div>
      <div className="logo-uploader-controls">
        <p className="cp-chips-label" style={{ marginBottom: 4 }}>{t.companyLogo}</p>
        <label className="btn btn-ghost logo-uploader-btn">
          {uploading ? t.uploadingLogo : url ? t.changeLogo : t.uploadLogo}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
          />
        </label>
        {url && (
          <button type="button" className="logo-uploader-remove" onClick={onRemove} disabled={uploading}>
            {t.removeLogo}
          </button>
        )}
        <p className="logo-uploader-hint">{t.logoHint}</p>
        {error && <p className="form-note err" style={{ marginTop: 4 }}>{error}</p>}
      </div>
    </div>
  );
}
