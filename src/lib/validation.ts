import { z } from "zod";

/** Schema de validação da mensagem de contato. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Mensagem muito curta").max(4000),
  locale: z.enum(["pt", "en"]).optional().default("pt"),
  // honeypot: precisa vir vazio (bots costumam preencher).
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Schema de validação do pedido de associação. */
export const membershipSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(160),
  company: z.string().trim().min(2, "Empresa muito curta").max(160),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  sector: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  locale: z.enum(["pt", "en"]).optional().default("pt"),
  // honeypot: precisa vir vazio (bots costumam preencher).
  website: z.string().max(0).optional().or(z.literal("")),
});

export type MembershipInput = z.infer<typeof membershipSchema>;
