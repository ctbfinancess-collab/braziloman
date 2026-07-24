"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import {
  Hero,
  About,
  Moment,
  Countries,
  Partnership,
  Services,
  Ecosystem,
  Membership,
  News,
} from "@/components/Sections";

export default function Home() {
  // Reveal sections on scroll.
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
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
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Moment />
        <Countries />
        <Partnership />
        <Services />
        <Ecosystem />
        <Membership />
        <News />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
