import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://braziloman.org"),
  title: {
    default: "CTB — Câmara de Comércio Brasil–Omã",
    template: "%s | CTB",
  },
  description:
    "Câmara de Comércio Brasil–Omã (CTB): conectando potências complementares. Comércio, investimentos e cooperação institucional entre o Brasil e o Sultanato de Omã.",
  keywords: [
    "Câmara de Comércio Brasil Omã",
    "Brazil Oman Chamber of Commerce",
    "CTB",
    "comércio bilateral",
    "investimentos",
    "Mascate",
    "São Paulo",
  ],
  icons: { icon: "/icon.png", apple: "/icon.png" },
  openGraph: {
    title: "CTB — Câmara de Comércio Brasil–Omã",
    description: "Conectando potências complementares. União e Prosperidade.",
    type: "website",
    locale: "pt_BR",
    siteName: "Câmara de Comércio Brasil–Omã",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${inter.variable}`}>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
