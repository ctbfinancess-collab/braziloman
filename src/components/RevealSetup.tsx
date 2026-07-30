"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Observa elementos .reveal e anima quando entram na tela. Roda em toda página. */
export default function RevealSetup() {
  const pathname = usePathname();

  useEffect(() => {
    // threshold precisa ser 0: com ratio > 0 a área visível é medida contra a
    // altura TOTAL do alvo, e páginas longas (ex.: Governança, com várias fotos,
    // passam de 10.000px) nunca atingem a fração exigida — o .reveal fica opacity:0
    // para sempre. rootMargin recupera o efeito de só revelar perto do centro da tela.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );

    const observeNew = () => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    };
    observeNew();

    // Conteúdo trocado sem navegação (ex.: router.refresh(), mudança de estado
    // após um formulário) não muda a URL, então precisamos observar o DOM
    // diretamente em vez de depender só da troca de rota.
    const mo = new MutationObserver(observeNew);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
