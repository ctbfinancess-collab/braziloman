"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deepMerge } from "@/lib/contentMerge";

type Node = string | number | boolean | null | undefined | Node[] | { [key: string]: Node };
type PathSeg = string | number;

function getAt(obj: Node, path: PathSeg[]): Node {
  let cur: Node = obj;
  for (const seg of path) {
    if (cur === null || typeof cur !== "object") return undefined as unknown as Node;
    cur = (cur as Record<string, Node>)[seg as string];
  }
  return cur;
}

function setAt(obj: Node, path: PathSeg[], value: Node): Node {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = obj.slice();
    copy[head as number] = setAt(copy[head as number], rest, value);
    return copy;
  }
  const copy = { ...(obj as Record<string, Node>) };
  copy[head as string] = setAt(copy[head as string], rest, value);
  return copy;
}

const SECTION_LABELS: Record<string, string> = {
  meta: "Título da aba do navegador",
  nav: "Menu de navegação",
  brand: "Nome/selo da marca",
  hero: "Página inicial — topo (Hero)",
  heroBridge: "Página inicial — banner de transição",
  purpose: "Página inicial — missão e pilares",
  about: "A Câmara — quem somos",
  acamaraPage: "A Câmara — abas (Governança, Estatuto, etc.)",
  moment: "Página inicial — seção de destaque",
  countries: "Página Brasil & Omã",
  partnership: "Parcerias / países",
  video: "Vídeo institucional",
  services: "Página Atuação",
  ecosystem: "Página Ecossistema",
  membership: "Associe-se — resumo",
  membershipPage: "Associe-se — página completa e formulário",
  consultingPage: "Associe-se — subpáginas (benefícios, serviços etc.)",
  news: "Notícias — lista",
  launchArticle: "Notícia — Lançamento",
  frenteParlamentarArticle: "Notícia — Frente Parlamentar",
  missaoArticle: "Notícia — Missão Empresarial",
  memberArea: "Área do Membro (login e painel)",
  contact: "Página de Contato",
  footer: "Rodapé",
};

const FIELD_LABEL_OVERRIDES: Record<string, string> = {
  eyebrow: "Texto pequeno (acima do título)",
  title: "Título",
  titleA: "Título (início)",
  titleB: "Título (final)",
  titleAccent: "Título (parte destacada)",
  titleLine1: "Título (linha 1)",
  titleLine2: "Título (linha 2)",
  lead: "Parágrafo principal",
  tagline: "Frase de efeito",
  motto: "Lema",
  mottoMain: "Lema (principal)",
  mottoSub: "Lema (linha menor)",
  photo: "Foto",
  image: "Imagem",
  intro: "Parágrafos de introdução",
  ctaJoin: "Botão: Associe-se",
  ctaContact: "Botão: Fale conosco",
  ctaLearn: "Botão: Saiba mais",
  stats: "Números em destaque",
  items: "Itens/cards",
  n: "Número/valor",
  l: "Legenda",
  h: "Título do card",
  p: "Texto do card",
  icon: "Ícone (nome técnico, cuidado ao mudar)",
};

function humanize(key: string): string {
  if (FIELD_LABEL_OVERRIDES[key]) return FIELD_LABEL_OVERRIDES[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

function sectionLabel(key: string): string {
  return SECTION_LABELS[key] ?? humanize(key);
}

function isImagePath(value: unknown): boolean {
  return typeof value === "string" && /\.(jpe?g|png|webp|gif|svg)($|\?)/i.test(value);
}

function matchesSearch(node: Node, term: string): boolean {
  if (!term) return true;
  if (typeof node === "string") return node.toLowerCase().includes(term);
  if (Array.isArray(node)) return node.some((n) => matchesSearch(n, term));
  if (node !== null && typeof node === "object") {
    return Object.values(node as Record<string, Node>).some((n) => matchesSearch(n, term));
  }
  return false;
}

type FieldProps = {
  path: PathSeg[];
  label: string;
  ptNode: Node;
  enNode: Node;
  defaultPtNode: Node;
  onChangePt: (path: PathSeg[], value: Node) => void;
  onChangeEn: (path: PathSeg[], value: Node) => void;
  onArrayAdd: (path: PathSeg[]) => void;
  onArrayRemove: (path: PathSeg[], index: number) => void;
  searchTerm: string;
  depth: number;
  uploadingKey: string | null;
  onUploadImage: (path: PathSeg[], file: File) => void;
};

function FieldNode(props: FieldProps) {
  const { path, label, ptNode, enNode, defaultPtNode, onChangePt, onChangeEn, onArrayAdd, onArrayRemove, searchTerm, depth, uploadingKey, onUploadImage } = props;

  if (searchTerm && !matchesSearch(ptNode, searchTerm) && !matchesSearch(enNode, searchTerm) && !label.toLowerCase().includes(searchTerm)) {
    return null;
  }

  // Leaf: string
  if (typeof ptNode === "string") {
    const isOverridden = ptNode !== defaultPtNode;
    const pathKey = path.join(".");
    const isImg = isImagePath(ptNode) || isImagePath(defaultPtNode);
    const long = ptNode.length > 70 || (typeof enNode === "string" && enNode.length > 70);

    return (
      <div className="ce-field">
        <div className="ce-field-head">
          <span className="ce-field-label">{label}</span>
          {isOverridden && <span className="ce-badge">editado</span>}
          {isOverridden && (
            <button type="button" className="ce-mini-btn" onClick={() => { onChangePt(path, defaultPtNode); }}>
              Restaurar padrão
            </button>
          )}
        </div>
        {isImg && (
          <div className="ce-image-row">
            {ptNode && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ptNode} alt="" className="ce-image-preview" />
            )}
            <label className="ce-upload-btn">
              {uploadingKey === pathKey ? "Enviando…" : "Trocar imagem"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImage(path, file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        )}
        <div className="ce-field-grid">
          <div>
            <span className="ce-lang-tag">PT</span>
            {long ? (
              <textarea value={ptNode} rows={3} onChange={(e) => onChangePt(path, e.target.value)} />
            ) : (
              <input type="text" value={ptNode} onChange={(e) => onChangePt(path, e.target.value)} />
            )}
          </div>
          <div>
            <span className="ce-lang-tag">EN</span>
            {long ? (
              <textarea value={typeof enNode === "string" ? enNode : ""} rows={3} onChange={(e) => onChangeEn(path, e.target.value)} />
            ) : (
              <input type="text" value={typeof enNode === "string" ? enNode : ""} onChange={(e) => onChangeEn(path, e.target.value)} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Array
  if (Array.isArray(ptNode)) {
    const enArr = Array.isArray(enNode) ? enNode : [];
    return (
      <div className="ce-array">
        <div className="ce-field-head">
          <span className="ce-field-label">{label}</span>
          <button type="button" className="ce-mini-btn" onClick={() => onArrayAdd(path)}>
            + Adicionar item
          </button>
        </div>
        {ptNode.map((item, idx) => (
          <div key={idx} className="ce-array-item">
            <div className="ce-array-item-head">
              <span className="ce-array-index">#{idx + 1}</span>
              <button type="button" className="ce-mini-btn ce-mini-btn-danger" onClick={() => onArrayRemove(path, idx)}>
                Remover
              </button>
            </div>
            <FieldNode
              {...props}
              path={[...path, idx]}
              label=""
              ptNode={item}
              enNode={enArr[idx]}
              defaultPtNode={getAt({ v: defaultPtNode } as unknown as Node, ["v", idx]) as Node}
              depth={depth + 1}
            />
          </div>
        ))}
        {ptNode.length === 0 && <p className="ce-empty">Nenhum item.</p>}
      </div>
    );
  }

  // Object
  if (ptNode !== null && typeof ptNode === "object") {
    const keys = Object.keys(ptNode);
    const content = (
      <div className={depth === 0 ? "ce-section-body" : "ce-object-body"}>
        {keys.map((key) => (
          <FieldNode
            {...props}
            key={key}
            path={[...path, key]}
            label={humanize(key)}
            ptNode={(ptNode as Record<string, Node>)[key]}
            enNode={enNode !== null && typeof enNode === "object" ? (enNode as Record<string, Node>)[key] : undefined}
            defaultPtNode={
              defaultPtNode !== null && typeof defaultPtNode === "object"
                ? (defaultPtNode as Record<string, Node>)[key]
                : undefined
            }
            depth={depth + 1}
          />
        ))}
      </div>
    );

    if (depth === 0) {
      return (
        <details className="ce-section" open={Boolean(searchTerm)}>
          <summary className="ce-section-title">{label}</summary>
          {content}
        </details>
      );
    }
    if (label) {
      return (
        <div className="ce-object">
          <p className="ce-object-title">{label}</p>
          {content}
        </div>
      );
    }
    return content;
  }

  return null;
}

export function ContentEditor() {
  const router = useRouter();
  const [defaults, setDefaults] = useState<{ pt: Node; en: Node } | null>(null);
  const [draftPt, setDraftPt] = useState<Node | null>(null);
  const [draftEn, setDraftEn] = useState<Node | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then(async (r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.error) {
          setStatus("error");
          setErrorMsg(json.error);
          return;
        }
        const mergedPt = deepMerge(json.defaults.pt, json.overrides.pt);
        const mergedEn = deepMerge(json.defaults.en, json.overrides.en);
        setDefaults(json.defaults);
        setDraftPt(mergedPt);
        setDraftEn(mergedEn);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Não foi possível carregar o conteúdo.");
      });
  }, [router]);

  function onChangePt(path: PathSeg[], value: Node) {
    dirty.current = true;
    setDraftPt((prev) => (prev === null ? prev : setAt(prev, path, value)));
  }
  function onChangeEn(path: PathSeg[], value: Node) {
    dirty.current = true;
    setDraftEn((prev) => (prev === null ? prev : setAt(prev, path, value)));
  }
  function onArrayAdd(path: PathSeg[]) {
    dirty.current = true;
    setDraftPt((prev) => {
      if (prev === null) return prev;
      const arr = getAt(prev, path);
      if (!Array.isArray(arr)) return prev;
      const template = arr.length > 0 ? JSON.parse(JSON.stringify(arr[arr.length - 1])) : {};
      const blanked = blankLeaves(template);
      return setAt(prev, path, [...arr, blanked]);
    });
    setDraftEn((prev) => {
      if (prev === null) return prev;
      const arr = getAt(prev, path);
      if (!Array.isArray(arr)) return prev;
      const template = arr.length > 0 ? JSON.parse(JSON.stringify(arr[arr.length - 1])) : {};
      const blanked = blankLeaves(template);
      return setAt(prev, path, [...arr, blanked]);
    });
  }
  function onArrayRemove(path: PathSeg[], index: number) {
    dirty.current = true;
    setDraftPt((prev) => {
      if (prev === null) return prev;
      const arr = getAt(prev, path);
      if (!Array.isArray(arr)) return prev;
      return setAt(prev, path, arr.filter((_, i) => i !== index));
    });
    setDraftEn((prev) => {
      if (prev === null) return prev;
      const arr = getAt(prev, path);
      if (!Array.isArray(arr)) return prev;
      return setAt(prev, path, arr.filter((_, i) => i !== index));
    });
  }

  async function onUploadImage(path: PathSeg[], file: File) {
    const key = path.join(".");
    setUploadingKey(key);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      onChangePt(path, json.url);
      onChangeEn(path, json.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploadingKey(null);
    }
  }

  async function onSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pt: draftPt, en: draftEn }),
      });
      if (!res.ok) throw new Error();
      setStatus("saved");
      dirty.current = false;
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setErrorMsg("Não foi possível salvar.");
    }
  }

  async function onResetAll() {
    if (!confirm("Restaurar TODO o conteúdo para o padrão original? Isso apaga todas as suas edições.")) return;
    setStatus("saving");
    try {
      await fetch("/api/admin/content", { method: "DELETE" });
      window.location.reload();
    } catch {
      setStatus("error");
      setErrorMsg("Não foi possível restaurar.");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const term = search.trim().toLowerCase();

  const sections = useMemo(() => {
    if (!draftPt || typeof draftPt !== "object" || Array.isArray(draftPt)) return [];
    return Object.keys(draftPt as Record<string, Node>);
  }, [draftPt]);

  if (status === "loading") {
    return (
      <section className="section">
        <div className="container reveal">
          <p className="section-lead">Carregando conteúdo…</p>
        </div>
      </section>
    );
  }

  if (status === "error" && !draftPt) {
    return (
      <section className="section">
        <div className="container reveal">
          <p className="form-note err">{errorMsg}</p>
        </div>
      </section>
    );
  }

  if (!draftPt || !draftEn || !defaults) return null;

  return (
    <section className="section">
      <div className="container reveal">
        <div className="ce-toolbar">
          <div>
            <p className="section-eyebrow">Administração</p>
            <h1 className="section-title" style={{ marginBottom: 0 }}>Conteúdo do Site</h1>
          </div>
          <div className="ce-toolbar-actions">
            <Link href="/admin/associados" className="btn btn-ghost">Pedidos de associação</Link>
            <button type="button" className="btn btn-ghost" onClick={logout}>Sair</button>
          </div>
        </div>
        <span className="about-flourish" aria-hidden="true" />

        <div className="ce-controls">
          <input
            type="text"
            placeholder="Buscar texto ou seção…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ce-search"
          />
          <div className="ce-controls-actions">
            <button type="button" className="btn btn-ghost" onClick={onResetAll}>Restaurar tudo</button>
            <button type="button" className="btn btn-primary" onClick={onSave} disabled={status === "saving"}>
              {status === "saving" ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </div>
        {status === "saved" && <p className="form-note" style={{ color: "var(--gold)" }}>Salvo com sucesso.</p>}
        {status === "error" && <p className="form-note err">{errorMsg}</p>}

        <div className="ce-sections">
          {sections.map((key) => (
            <FieldNode
              key={key}
              path={[key]}
              label={sectionLabel(key)}
              ptNode={(draftPt as Record<string, Node>)[key]}
              enNode={(draftEn as Record<string, Node>)[key]}
              defaultPtNode={(defaults.pt as Record<string, Node>)[key]}
              onChangePt={onChangePt}
              onChangeEn={onChangeEn}
              onArrayAdd={onArrayAdd}
              onArrayRemove={onArrayRemove}
              searchTerm={term}
              depth={0}
              uploadingKey={uploadingKey}
              onUploadImage={onUploadImage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function blankLeaves(node: Node): Node {
  if (typeof node === "string") return "";
  if (Array.isArray(node)) return node.map(blankLeaves);
  if (node !== null && typeof node === "object") {
    const out: Record<string, Node> = {};
    for (const k of Object.keys(node)) out[k] = blankLeaves((node as Record<string, Node>)[k]);
    return out;
  }
  return node;
}
