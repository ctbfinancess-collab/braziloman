import { generateSecret, generateURI, verify } from "otplib";

/**
 * 2FA (TOTP, tipo Google Authenticator/Authy) das contas individuais do
 * admin (Usuários). Usa os padrões do RFC 6238 (SHA1, 6 dígitos, 30s) —
 * são os únicos parâmetros que todo app autenticador espera por padrão.
 */

export async function generateTotpSecret(): Promise<string> {
  return generateSecret();
}

export async function generateTotpUri(secret: string, email: string): Promise<string> {
  return generateURI({ secret, label: email, issuer: "Câmara de Comércio Brasil–Omã" });
}

/** Tolera 1 passo (±30s) de dessincronia de relógio, como todo autenticador. */
export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const result = await verify({ secret, token: code, epochTolerance: 30 });
  return result.valid;
}
