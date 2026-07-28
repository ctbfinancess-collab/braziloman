"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { content, type Dict, type Locale } from "./content";

type I18nValue = {
  lang: Locale;
  setLang: (l: Locale) => void;
  toggle: () => void;
  d: Dict;
};

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "ctb-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("pt");
  const [dict, setDict] = useState<typeof content>(content);

  // Load persisted / browser preference on mount (client only).
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "pt" || stored === "en") {
      setLangState(stored);
    } else if (navigator.language && !navigator.language.toLowerCase().startsWith("pt")) {
      setLangState("en");
    }
  }, []);

  // Busca conteúdo efetivo (padrões + substituições do painel admin).
  // O valor estático de content.ts já é usado no primeiro render (sem tela em branco);
  // se houver substituições salvas, o texto é atualizado assim que a resposta chega.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setDict(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep <html lang> and storage in sync.
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (l: Locale) => setLangState(l);
  const toggle = () => setLangState((p) => (p === "pt" ? "en" : "pt"));

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, d: dict[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
