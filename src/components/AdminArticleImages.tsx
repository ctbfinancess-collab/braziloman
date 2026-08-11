"use client";

import { useEffect, useState } from "react";
import { deepMerge } from "@/lib/contentMerge";

type Node = string | number | boolean | null | Node[] | { [key: string]: Node };

/** Os dois artigos públicos cuja foto costumava exigir navegar a árvore
 *  inteira do editor de conteúdo geral — atalho direto aqui em "Eventos e
 *  Missões", já que é a tela que a secretaria já usa no dia a dia. Salva
 *  sozinho assim que a imagem termina de subir (sem precisar lembrar de
 *  clicar em "Salvar" depois — foi exatamente o passo que ficava esquecido
 *  usando o editor completo) — e atualiza tanto a foto do artigo quanto a
 *  miniatura correspondente na lista de Notícias, num só upload. */
const ARTICLES: { key: string; label: string; page: string }[] = [
  { key: "missaoArticle", label: "Notícia — Missão Empresarial", page: "/noticias/missao-empresarial" },
  { key: "rodadaNegociosArticle", label: "Notícia — Rodada de Negócios", page: "/noticias/rodada-negocios" },
];

type Status = "idle" | "loading" | "uploading" | "saved" | "error";

function ArticleImageField({ articleKey, label, page }: { articleKey: string; label: string; page: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((json: { defaults: { pt: Node }; overrides: { pt: Node } }) => {
        if (cancelled) return;
        const effectivePt = deepMerge(json.defaults.pt, json.overrides.pt) as Record<string, Node>;
        const article = effectivePt[articleKey] as Record<string, Node> | undefined;
        setImageUrl(typeof article?.image === "string" ? article.image : "");
        setStatus("idle");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [articleKey]);

  async function onFileChange(file: File) {
    setStatus("uploading");
    setErrorMsg("");
    try {
      // 1) Sobe o arquivo.
      const uploadBody = new FormData();
      uploadBody.append("file", file);
      const uploadRes = await fetch("/api/admin/media", { method: "POST", body: uploadBody });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.error || "Falha no upload");
      const url = uploadJson.url as string;

      // 2) Busca o conteúdo efetivo atual (padrão + edições já salvas), troca
      //    só a imagem, e salva de volta — mesma seção pra pt e en, já que a
      //    imagem não varia por idioma.
      const contentRes = await fetch("/api/admin/content");
      const contentJson = await contentRes.json();
      const effectivePt = deepMerge(contentJson.defaults.pt, contentJson.overrides.pt) as Record<string, Node>;
      const effectiveEn = deepMerge(contentJson.defaults.en, contentJson.overrides.en) as Record<string, Node>;
      const nextPt = { ...(effectivePt[articleKey] as Record<string, Node>), image: url };
      const nextEn = { ...(effectiveEn[articleKey] as Record<string, Node>), image: url };

      const saveRes = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: articleKey, pt: nextPt, en: nextEn }),
      });
      if (!saveRes.ok) throw new Error("Falha ao salvar");

      // 3) A miniatura na lista de Notícias (/noticias) é um campo separado
      //    (news.items[].image, não articleKey.image) — sem isso, o artigo
      //    fica com a foto nova mas a lista continua com a antiga (foi
      //    exatamente essa a confusão de "2 cards antigos" já relatada).
      //    Atualiza junto, casando pelo link da notícia.
      const newsPt = effectivePt.news as { items?: Record<string, Node>[] } | undefined;
      const newsEn = effectiveEn.news as { items?: Record<string, Node>[] } | undefined;
      if (newsPt?.items && newsEn?.items) {
        const nextNewsPt = {
          ...newsPt,
          items: newsPt.items.map((it) => (it.link === page ? { ...it, image: url } : it)),
        };
        const nextNewsEn = {
          ...newsEn,
          items: newsEn.items.map((it) => (it.link === page ? { ...it, image: url } : it)),
        };
        await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "news", pt: nextNewsPt, en: nextNewsEn }),
        });
      }

      setImageUrl(url);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Não foi possível trocar a foto.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="ce-field-label">{label}</span>
      <div className="ce-image-row">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={imageUrl} src={imageUrl} alt="" className="ce-image-preview" />
        )}
        <label className="ce-upload-btn">
          {status === "uploading" ? "Enviando…" : "Trocar imagem"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            disabled={status === "uploading"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
              e.target.value = "";
            }}
          />
        </label>
        {status === "saved" && <span className="ce-badge">salvo</span>}
      </div>
      {status === "error" && <p className="form-note err" style={{ margin: 0 }}>{errorMsg}</p>}
      <a href={page} target="_blank" rel="noreferrer" style={{ fontSize: "0.76rem", color: "var(--fg-dim)" }}>
        Ver página →
      </a>
    </div>
  );
}

/** Bloco "Fotos das notícias" — atalho pras duas imagens de artigo público
 *  que mais mudam (Missão Empresarial, Rodada de Negócios), direto na tela
 *  de Eventos e Missões pra não precisar abrir o editor de conteúdo geral. */
export function AdminArticleImages() {
  return (
    <div className="contact-form" style={{ marginBottom: 32, maxWidth: 560, display: "grid", gap: 20 }}>
      <div>
        <h3 className="mp-form-title" style={{ marginBottom: 2 }}>Fotos das notícias</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--fg-dim)", margin: 0 }}>
          Atalho pras fotos das páginas públicas de Missão Empresarial e Rodada de Negócios — troca e já salva sozinho.
        </p>
      </div>
      {ARTICLES.map((a) => (
        <ArticleImageField key={a.key} articleKey={a.key} label={a.label} page={a.page} />
      ))}
    </div>
  );
}
