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
    <title>Câmara de Comércio Brasil–Omã</title>
  </head>
  <body style="margin:0; padding:0; background-color:#efece3; font-family: Georgia, 'Times New Roman', serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#efece3; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#f5f2eb; border:1px solid rgba(150,116,52,0.28);">
            <tr>
              <td style="background-color:#1a1408; padding: 28px 36px; text-align:center;">
                <img src="${SITE_URL}/logo-ctb-transparent.png" width="84" height="84" alt="Câmara de Comércio Brasil–Omã" style="display:block; margin: 0 auto 12px;" />
                <div style="font-family: Georgia, serif; letter-spacing: 0.02em; color:#c19a4b; font-size: 16px; font-weight:bold;">
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

/** E-mail 1: confirmação de recebimento, enviado logo após o pré-cadastro em /associe-se. */
export async function sendApplicationReceivedEmail(to: string, name: string) {
  if (!resend) return;
  const html = layout(
    "Recebemos sua manifestação de interesse — acesse o Portal do Candidato.",
    `${heading(`Olá, ${name}!`)}
     ${paragraph("Recebemos sua manifestação de interesse em se associar à Câmara de Comércio Brasil–Omã. Falta só um passo: acesse o Portal do Candidato com o e-mail e senha que você cadastrou e complete as informações da sua candidatura.")}
     ${button("Acessar o Portal do Candidato", `${SITE_URL}/membro/login`)}
     ${paragraph("Assim que enviar todas as informações, nossa equipe de compliance vai analisar sua candidatura e avisaremos por e-mail sobre qualquer atualização.")}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recebemos sua manifestação de interesse — Câmara Brasil–Omã",
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

/** E-mail: redefinição de senha, enviado a pedido do associado. */
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  if (!resend) return;
  const html = layout(
    "Redefinição de senha — Área do Membro.",
    `${heading(`Olá, ${name}!`)}
     ${paragraph("Recebemos um pedido para redefinir a senha da sua conta na Área do Membro. Clique no botão abaixo para criar uma nova senha.")}
     ${button("Redefinir minha senha", resetUrl)}
     ${paragraph("Se você não pediu essa redefinição, pode ignorar este e-mail com segurança — sua senha atual continua válida. Este link expira em 1 hora.")}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinição de senha — Câmara Brasil–Omã",
    html,
  });
}

/** E-mail: enviado quando o candidato conclui e envia o Portal do Candidato (etapa 7). */
export async function sendApplicationSubmittedEmail(to: string, name: string) {
  if (!resend) return;
  const html = layout(
    "Recebemos sua documentação — em análise de compliance.",
    `${heading(`Olá, ${name}!`)}
     ${paragraph("Recebemos todas as informações e documentos do seu cadastro de associação. Sua candidatura entrou em <strong>análise de compliance</strong> pela nossa equipe.")}
     ${paragraph("Vamos avisar por e-mail assim que houver uma atualização — seja um pedido de esclarecimento adicional, seja o resultado da análise.")}
     ${button("Acompanhar meu cadastro", `${SITE_URL}/membro/painel`)}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recebemos sua documentação — Câmara Brasil–Omã",
    html,
  });
}

/** E-mail: aviso interno quando alguém envia o formulário de contato do site. */
export async function sendNewContactMessageEmail(data: {
  name: string;
  email: string;
  company?: string | null;
  message: string;
}) {
  if (!resend) return;
  const html = layout(
    "Nova mensagem recebida pelo formulário de contato.",
    `${heading("Nova mensagem de contato")}
     ${paragraph(`<strong>${data.name}</strong> (${data.email}${data.company ? `, ${data.company}` : ""}) enviou uma mensagem pelo site:`)}
     <div style="background:#efece3; border-left:3px solid #96712c; padding:14px 18px; margin:0 0 20px; font-family: Arial, sans-serif; color:#201b13; font-size:14px; line-height:1.6; white-space:pre-wrap;">${data.message}</div>
     ${button("Ver mensagens no painel", `${SITE_URL}/admin/mensagens`)}`
  );
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `Nova mensagem de contato: ${data.name}`,
    html,
  });
}

/** E-mail: aviso interno quando um candidato conclui o envio do Portal do Candidato. */
export async function sendNewSubmissionAdminEmail(data: { name: string; email: string; company: string }) {
  if (!resend) return;
  const html = layout(
    "Candidatura completa recebida para análise.",
    `${heading("Candidatura pronta para análise")}
     ${paragraph(`<strong>${data.name}</strong> (${data.company}, ${data.email}) concluiu todas as etapas do Portal do Candidato e está aguardando análise de compliance.`)}
     ${button("Abrir painel de associados", `${SITE_URL}/admin/associados`)}`
  );
  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Candidatura completa: ${data.company}`,
    html,
  });
}

/** E-mail: enviado quando o compliance solicita informações/documentos adicionais. */
export async function sendInfoRequestedEmail(to: string, name: string, notes: string) {
  if (!resend) return;
  const html = layout(
    "Precisamos de informações adicionais para sua candidatura.",
    `${heading(`Olá, ${name}!`)}
     ${paragraph("Estamos analisando sua candidatura à Câmara de Comércio Brasil–Omã e precisamos de algumas informações ou documentos adicionais antes de prosseguir:")}
     <div style="background:#efece3; border-left:3px solid #96712c; padding:14px 18px; margin:0 0 20px; font-family: Arial, sans-serif; color:#201b13; font-size:14px; line-height:1.6;">${notes}</div>
     ${button("Completar meu cadastro", `${SITE_URL}/membro/painel`)}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Precisamos de mais informações — Câmara Brasil–Omã",
    html,
  });
}

/** E-mail: enviado quando a Diretoria aprova a candidatura (falta finalizar/pagar). */
export async function sendApprovedPendingPaymentEmail(to: string, name: string, category: string) {
  if (!resend) return;
  const html = layout(
    "Sua candidatura foi aprovada pela Câmara de Comércio Brasil–Omã.",
    `${heading(`Parabéns, ${name}!`)}
     ${paragraph(`Sua candidatura foi <strong>aprovada</strong> pela Diretoria da Câmara de Comércio Brasil–Omã, na categoria <strong>${category}</strong>.`)}
     ${paragraph("Falta só um passo: finalizar sua associação escolhendo a forma de pagamento da contribuição anual. Nossa equipe vai entrar em contato para concluir essa etapa com você.")}
     ${button("Acessar meu painel", `${SITE_URL}/membro/painel`)}`
  );
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Candidatura aprovada — Câmara Brasil–Omã",
    html,
  });
}

/** E-mail 3: boas-vindas, enviado quando o admin aprova o pedido. */
export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) return;
  const html = layout(
    "Sua associação foi aprovada — bem-vindo(a) à Câmara.",
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
