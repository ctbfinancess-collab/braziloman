import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Config do Capacitor — empacota o site já publicado numa casca de app
 * nativo (Android/iOS), SEM duplicar nem reescrever nada do site.
 *
 * `server.url` faz o app carregar direto a versão de produção
 * (brasilomanchamber.org), a mesma que roda no navegador — login, área do
 * associado, benefícios, pagamentos, banco de dados e painel admin
 * continuam funcionando exatamente como hoje, porque é o MESMO site rodando
 * dentro do WebView do app. Nada foi duplicado ou reescrito.
 *
 * `webDir` aponta pro stub em capacitor-www/ (exigido pelo Capacitor, mas
 * nunca chega a ser exibido de verdade — ver o comentário no index.html).
 */
const config: CapacitorConfig = {
  appId: "org.brasilomanchamber.app",
  appName: "Câmara Brasil–Omã",
  webDir: "capacitor-www",
  server: {
    url: "https://brasilomanchamber.org",
    cleartext: false,
  },
};

export default config;
