import { Resend } from "resend";
import { env, hasEmail } from "./env";

/**
 * Cliente Resend como singleton. Retorna null sem RESEND_API_KEY:
 * o site funciona normalmente, só não envia e-mails automáticos.
 */
const resend = hasEmail ? new Resend(env.RESEND_API_KEY) : null;

const FROM = "Câmara de Comércio Brasil–Omã <contact@brasilomanchamber.org>";
const ADMIN_EMAIL = "contact@brasilomanchamber.org";
const SITE_URL = "https://www.brasilomanchamber.org";

function layout(previewText: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CTB — Câmara de Comércio Brasil–Omã</title>
  </head>
  <body style="margin:0; padding:0; background-color:#efece3; font-family: Georgia, 'Times New Roman', serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efece3; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#f5f2eb; border:1px solid rgba(150,116,52,0.28);">
            <tr>
              <td style="background-color:#1a1408; padding: 28px 36px; text-align:center;">
                <img src="${SITE_URL}/logo-ctb-transparent.png" width="52" height="52" alt="CTB" style="display:block; margin: 0 auto 10px;" />
                <div style="font-family: Georgia, serif; letter-spacing: 0.14em; color:#c19a4b; font-size: 18px; font-weight:bold;">CTB</div>
                <div style="font-family: Arial, sans-serif; letter-spacing: 0.08em; color:#f0e2b8; font-size: 11px; text-transform: uppercase; margin-top: 4px;">
                  Câmara de Comércio Brasil–Omã
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 36px 36px 8px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 36px 32px;">
                <div style="height:1px; background: linear-gradient(90deg, #96712c, transparent); margin-bottom:18px;"></div>
                <div style="font-family: Arial, sans-serif; color:#857c6b; font-size: 12px; line-height:1.6;">
                  Câmara de Comércio Brasil–Omã · <a href="${SITE_URL}" style="color:#96712c; text-decoration:none;">brasilomanchamber.org</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="font-family: Arial, sans-serif; color:#201b13; font-size: 15px; line-height:1.7; margin: 0 0 16px;">${text}</p>`;
}

function heading(text: string): string {
  return `<h1 style="font-family: Georgia, serif; color:#201b13; font-size: 22px; font-weight:bold; margin: 0 0 18px;">${text}</h1>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #c19a4b, #5c4418); border:1px solid #96712c;">
        <a href="${href}" style="display:inline-block; padding: 13px 28px; font-family: Arial, sans-serif; font-weight:bold; font-size: 14px; color:#1a1408; text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** E-mail 1: confirmação de recebimento, enviado logo após o cadastro em /associe-se. */
export async function sendApplicationReceivedEmail(to: string, name: string) {
  if (!resend) return;
  const html = layout(
    "Recebemos seu pedido de associação à CTB.",
    `${heading(`Olá, ${name}!`)}
     ${paragraph("Recebemos seu pedido de associação à Câmara de Comércio Brasil–Omã. Nossa equipe vai analisar as informações enviadas e você receberá um novo e-mail assim que o cadastro for aprovado.")}
     ${paragraph("Isso costuma levar pouco tempo. Enquanto isso, fique à vontade para conhecer mais sobre nossos serviços e o ecossistema Brasil–Omã no site.")}
     ${button("Visitar o site", SITE_URL)}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recebemos seu pedido de associação — CTB",
    html,
  });
}

/** E-mail 2: aviso interno para a Câmara quando chega um pedido novo. */
export async function sendNewApplicationAdminEmail(data: {
  name: string;
  email: string;
  company: string;
  role?: string | null;
  sector?: string | null;
  country?: string | null;
}) {
  if (!resend) return;
  const rows = [
    ["Nome", data.name],
    ["E-mail", data.email],
    ["Empresa", data.company],
    ["Cargo", data.role || "—"],
    ["Setor", data.sector || "—"],
    ["País", data.country || "—"],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="font-family: Arial, sans-serif; color:#857c6b; font-size:13px; padding:4px 12px 4px 0; white-space:nowrap;">${label}</td><td style="font-family: Arial, sans-serif; color:#201b13; font-size:14px; padding:4px 0;">${value}</td></tr>`
    )
    .join("");

  const html = layout(
    "Novo pedido de associação recebido.",
    `${heading("Novo pedido de associação")}
     ${paragraph("Chegou um novo pedido pelo formulário do site. Confira os dados abaixo e acesse o painel para aprovar ou rejeitar.")}
     <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${rows}</table>
     ${button("Abrir painel de associados", `${SITE_URL}/admin/associados`)}`
  );
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Novo pedido de associação: ${data.company}`,
    html,
  });
}

/** E-mail 3: boas-vindas, enviado quando o admin aprova o pedido. */
export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) return;
  const html = layout(
    "Sua associação foi aprovada — bem-vindo(a) à CTB.",
    `${heading(`Bem-vindo(a), ${name}!`)}
     ${paragraph("É com grande satisfação que confirmamos: sua associação à <strong>Câmara de Comércio Brasil–Omã</strong> foi aprovada.")}
     ${paragraph("A partir de agora você faz parte de uma rede dedicada a fortalecer as relações comerciais, institucionais e culturais entre o Brasil e o Omã. Acesse a Área do Membro para ver os detalhes da sua associação.")}
     ${button("Entrar na Área do Membro", `${SITE_URL}/membro/login`)}
     ${paragraph("Seja muito bem-vindo(a). Estamos à disposição para o que precisar.")}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bem-vindo(a) à Câmara de Comércio Brasil–Omã",
    html,
  });
}
