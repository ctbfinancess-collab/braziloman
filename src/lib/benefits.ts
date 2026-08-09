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

/** Um associado Black também acessa benefícios marcados como "Gold" (o nível
 *  superior sempre inclui os benefícios dos níveis abaixo), além de "Todos". */
export function memberCanAccessBenefit(
  memberTier: "GOLD" | "BLACK" | "PLATINUM",
  eligibility: BenefitEligibility
): boolean {
  if (eligibility === "ALL") return true;
  return TIER_RANK[memberTier] >= TIER_RANK[eligibility];
}
