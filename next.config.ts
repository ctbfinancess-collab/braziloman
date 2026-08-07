import type { NextConfig } from "next";

/**
 * Content Security Policy.
 * 'unsafe-inline' é necessário para os estilos/scripts inline do Next.js.
 * media-src https: permite servir o vídeo institucional a partir de um CDN/S3.
 * img-src inclui o subdomínio do R2 (media.brasilomanchamber.org) — é onde
 * ficam as imagens enviadas por upload (eventos/missões, logo do associado,
 * editor de conteúdo). Sem isso o navegador bloqueia o carregamento mesmo
 * a imagem existindo e respondendo 200 (mostra como "imagem quebrada").
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://media.brasilomanchamber.org",
  "media-src 'self' https: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
