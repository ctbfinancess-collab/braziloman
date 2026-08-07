// Programa de Fidelidade — "Brazil–Oman Chamber Rewards".
// Catálogo de ações, níveis e benefícios. Sem import de Prisma — pode ser usado
// tanto em componentes de servidor quanto de cliente. A contraparte que grava no
// banco fica em loyaltyServer.ts (server-only).

export type LoyaltyActionId =
  | "TORNAR_SE_ASSOCIADO"
  | "RENOVAR_ANUIDADE"
  | "PARTICIPAR_EVENTO"
  | "PARTICIPAR_MISSAO_EMPRESARIAL"
  | "INDICAR_NOVO_ASSOCIADO"
  | "PARTICIPAR_RODADA_NEGOCIOS"
  | "MINISTRAR_PALESTRA"
  | "PATROCINAR_EVENTO";

export const LOYALTY_CUSTOM_ACTION_ID = "CUSTOM" as const;

export type LoyaltyAction = {
  id: LoyaltyActionId;
  labelPt: string;
  labelEn: string;
  points: number;
  /** true só para TORNAR_SE_ASSOCIADO — concedida automaticamente, não aparece
   *  como opção selecionável no formulário manual do admin. */
  automatic?: boolean;
  /** nome do ícone (ver src/components/Icons.tsx) usado no extrato de atividade. */
  icon: string;
};

export const LOYALTY_ACTIONS: LoyaltyAction[] = [
  { id: "TORNAR_SE_ASSOCIADO", labelPt: "Tornar-se associado", labelEn: "Become a member", points: 1000, automatic: true, icon: "userplus" },
  { id: "RENOVAR_ANUIDADE", labelPt: "Renovar anuidade", labelEn: "Renew annual membership", points: 500, icon: "clock" },
  { id: "PARTICIPAR_EVENTO", labelPt: "Participar de evento", labelEn: "Attend an event", points: 100, icon: "calendar" },
  { id: "PARTICIPAR_MISSAO_EMPRESARIAL", labelPt: "Participar de missão empresarial", labelEn: "Join a business mission", points: 500, icon: "plane" },
  { id: "INDICAR_NOVO_ASSOCIADO", labelPt: "Indicar novo associado", labelEn: "Refer a new member", points: 1000, icon: "people" },
  { id: "PARTICIPAR_RODADA_NEGOCIOS", labelPt: "Participar de rodada de negócios", labelEn: "Join a business roundtable", points: 150, icon: "handshake" },
  { id: "MINISTRAR_PALESTRA", labelPt: "Ministrar palestra", labelEn: "Give a talk", points: 300, icon: "megaphone" },
  { id: "PATROCINAR_EVENTO", labelPt: "Patrocinar evento", labelEn: "Sponsor an event", points: 2000, icon: "trending" },
];

export function getActionById(id: string): LoyaltyAction | undefined {
  return LOYALTY_ACTIONS.find((a) => a.id === id);
}

/** Rótulo de exibição de uma ação (ou "Ação personalizada" para lançamentos CUSTOM). */
export function getActionLabel(actionId: string, locale: "pt" | "en"): string {
  const a = getActionById(actionId);
  if (a) return locale === "pt" ? a.labelPt : a.labelEn;
  return locale === "pt" ? "Ação personalizada" : "Custom action";
}

/** Ícone de exibição de uma ação no extrato de atividade (ver src/components/Icons.tsx). */
export function getActionIcon(actionId: string): string {
  return getActionById(actionId)?.icon ?? "seal";
}

export type LoyaltyTier = "GOLD" | "BLACK" | "PLATINUM";

export const TIER_NAMES: Record<LoyaltyTier, string> = {
  GOLD: "Gold",
  BLACK: "Black",
  PLATINUM: "Platinum",
};

/** Faixas de pontos por nível. Platinum não tem teto. */
export const TIER_BANDS: {
  GOLD: { min: number; max: number };
  BLACK: { min: number; max: number };
  PLATINUM: { min: number; max: null };
} = {
  GOLD: { min: 0, max: 2500 },
  BLACK: { min: 2501, max: 8000 },
  PLATINUM: { min: 8001, max: null },
};

export function getTier(points: number): LoyaltyTier {
  if (points > TIER_BANDS.BLACK.max) return "PLATINUM";
  if (points > TIER_BANDS.GOLD.max) return "BLACK";
  return "GOLD";
}

export function getTierProgress(points: number): {
  tier: LoyaltyTier;
  isMaxTier: boolean;
  nextTier: LoyaltyTier | null;
  pointsToNext: number | null;
  progressPct: number;
} {
  const tier = getTier(points);
  if (tier === "PLATINUM") {
    return { tier, isMaxTier: true, nextTier: null, pointsToNext: null, progressPct: 100 };
  }
  const band = TIER_BANDS[tier];
  const nextTier: LoyaltyTier = tier === "GOLD" ? "BLACK" : "PLATINUM";
  const pointsToNext = band.max - points + 1;
  const progressPct = Math.min(100, Math.max(0, Math.round(((points - band.min) / (band.max - band.min + 1)) * 100)));
  return { tier, isMaxTier: false, nextTier, pointsToNext, progressPct };
}

export type TierBenefit = { icon: string; pt: string; en: string };

/** Benefícios progressivos: cada nível inclui os benefícios do nível anterior + os novos. */
const GOLD_BENEFITS: TierBenefit[] = [
  { icon: "ticket", pt: "Desconto em eventos", en: "Discount on events" },
  { icon: "plane", pt: "Desconto em missões empresariais", en: "Discount on business missions" },
  { icon: "megaphone", pt: "Divulgação nas redes da Câmara", en: "Promotion on the Chamber's social channels" },
  { icon: "people", pt: "Acesso a uma rede exclusiva", en: "Access to an exclusive network" },
];
const BLACK_BENEFITS: TierBenefit[] = [
  ...GOLD_BENEFITS,
  { icon: "seal", pt: "Acesso VIP", en: "VIP access" },
  { icon: "briefcase", pt: "Salas de reunião", en: "Meeting rooms" },
  { icon: "idcard", pt: "Destaque no diretório empresarial", en: "Featured placement in the business directory" },
];
const PLATINUM_BENEFITS: TierBenefit[] = [
  ...BLACK_BENEFITS,
  { icon: "handshake", pt: "Consultorias", en: "Consulting sessions" },
  { icon: "clock", pt: "Prioridade em agendas institucionais", en: "Priority on institutional agendas" },
];

export const TIER_BENEFITS: Record<LoyaltyTier, TierBenefit[]> = {
  GOLD: GOLD_BENEFITS,
  BLACK: BLACK_BENEFITS,
  PLATINUM: PLATINUM_BENEFITS,
};

export const TIER_ORDER: LoyaltyTier[] = ["GOLD", "BLACK", "PLATINUM"];
