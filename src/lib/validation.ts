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
