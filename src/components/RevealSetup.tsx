"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Observa elementos .reveal e anima quando entram na tela. Roda em toda página. */
export default function RevealSetup() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll(".reveal:not(.in)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
