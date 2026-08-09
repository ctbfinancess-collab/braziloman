/**
 * Catálogo do módulo "Parceiros & Benefícios" — marketplace exclusivo pra
 * associados dentro da Área do Associado. Sem import de Prisma, importável
 * tanto em componentes client quanto em rotas/server components.
 */

export const BENEFIT_TYPES = [
  "PERCENT_DISCOUNT",
  "FIXED_DISCOUNT",
  "SPECIAL_RATE",
  "UPGRADE",
  "VIP_PERK",
  "COURTESY",
  "CASHBACK",
  "VOUCHER",
  "EXCLUSIVE_EXPERIENCE",
  "PRIORITY_SUPPORT",
  "OTHER",
] as const;

export type BenefitType = (typeof BENEFIT_TYPES)[number];

export const BENEFIT_TYPE_LABELS: Record<BenefitType, string> = {
  PERCENT_DISCOUNT: "Desconto percentual",
  FIXED_DISCOUNT: "Desconto em valor fixo",
  SPECIAL_RATE: "Tarifa especial",
  UPGRADE: "Upgrade",
  VIP_PERK: "Benefício VIP",
  COURTESY: "Cortesia",
  CASHBACK: "Cashback",
  VOUCHER: "Voucher",
  EXCLUSIVE_EXPERIENCE: "Experiência exclusiva",
  PRIORITY_SUPPORT: "Atendimento prioritário",
  OTHER: "Outro",
};

export const ELIGIBILITY_OPTIONS = ["ALL", "GOLD", "BLACK", "PLATINUM"] as const;
export type BenefitEligibility = (typeof ELIGIBILITY_OPTIONS)[number];

export const ELIGIBILITY_LABELS: Record<BenefitEligibility, string> = {
  GOLD: "Gold",
  BLACK: "Black",
  PLATINUM: "Platinum",
  ALL: "Todos os níveis",
};

/** Hierarquia dos níveis — usada pra checar se um associado de nível X
 *  também pode acessar benefícios exigindo um nível abaixo do dele. */
const TIER_RANK: Record<"GOLD" | "BLACK" | "PLATINUM", number> = { GOLD: 1, BLACK: 2, PLATINUM: 3 };

// ---------- Frequência de uso (controle de resgate repetido) ----------

export const BENEFIT_FREQUENCIES = ["SINGLE_USE", "DAILY", "WEEKLY", "MONTHLY", "UNLIMITED"] as const;
export type BenefitFrequency = (typeof BENEFIT_FREQUENCIES)[number];

export const BENEFIT_FREQUENCY_LABELS: Record<BenefitFrequency, string> = {
  SINGLE_USE: "Uso único por associado",
  DAILY: "1 vez por dia",
  WEEKLY: "1 vez por semana",
  MONTHLY: "1 vez por mês",
  UNLIMITED: "Uso ilimitado",
};

/** Janela de "cooldown" de cada frequência, em milissegundos. SINGLE_USE não
 *  tem janela — um resgate anterior bloqueia pra sempre (por isso não entra
 *  aqui, ver isBenefitRedemptionBlocked). */
const FREQUENCY_WINDOW_MS: Partial<Record<BenefitFrequency, number>> = {
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
  MONTHLY: 30 * 24 * 60 * 60 * 1000,
};

/** Decide se um associado pode registrar um NOVO "Usar benefício" agora,
 *  dado o resgate mais recente dele (se houver) e a frequência configurada
 *  no benefício. UNLIMITED nunca bloqueia; SINGLE_USE bloqueia pra sempre
 *  depois do primeiro resgate; DAILY/WEEKLY/MONTHLY bloqueiam só dentro da
 *  janela (24h/7d/30d) a partir do último resgate. */
export function isBenefitRedemptionBlocked(
  frequency: BenefitFrequency,
  lastUseAt: Date | null,
  now: Date = new Date()
): boolean {
  if (!lastUseAt) return false;
  if (frequency === "UNLIMITED") return false;
  if (frequency === "SINGLE_USE") return true;
  const windowMs = FREQUENCY_WINDOW_MS[frequency];
  if (!windowMs) return false;
  return now.getTime() - lastUseAt.getTime() < windowMs;
}

// ---------- Captação de Parceiros (funil de prospecção) ----------

export const PROSPECT_STATUSES = ["PROSPECTED", "CONTACTED", "NEGOTIATING", "APPROVED", "ACTIVE", "REJECTED"] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

export const PROSPECT_STATUS_LABELS: Record<ProspectStatus, string> = {
  PROSPECTED: "Prospectado",
  CONTACTED: "Contatado",
  NEGOTIATING: "Em negociação",
  APPROVED: "Aprovado",
  ACTIVE: "Ativo",
  REJECTED: "Recusado",
};

/** Um associado Black também acessa benefícios marcados como "Gold" (o nível
 *  superior sempre inclui os benefícios dos níveis abaixo), além de "Todos". */
export function memberCanAccessBenefit(
  memberTier: "GOLD" | "BLACK" | "PLATINUM",
  eligibility: BenefitEligibility
): boolean {
  if (eligibility === "ALL") return true;
  return TIER_RANK[memberTier] >= TIER_RANK[eligibility];
}
