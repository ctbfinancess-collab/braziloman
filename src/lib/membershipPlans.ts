/**
 * Catálogo dos planos de associação pagos — três categorias fixas, com preço
 * em USD (é assim que a Câmara cobra). Não tem nenhuma relação com o
 * Programa de Fidelidade (Gold/Black/Platinum, ver lib/loyalty.ts) — são
 * conceitos propositalmente separados, decisão confirmada com o usuário.
 *
 * Fica em código (não no editor de conteúdo do admin) de propósito: preço é
 * dado sensível demais pra editar como texto solto — mesma lógica já usada
 * pras faixas do Programa de Fidelidade em lib/loyalty.ts.
 */

export type MembershipPlanId = "empresarial" | "corporativo" | "estrategico";

export type MembershipPlanBenefit = { icon: string; pt: string; en: string };

export type MembershipPlan = {
  id: MembershipPlanId;
  /// Precisa bater exatamente com o texto usado em
  /// MembershipApplication.membershipCategory (ver formulário do admin).
  name: string;
  priceUsd: number;
  tagline: { pt: string; en: string };
  benefits: MembershipPlanBenefit[];
};

const EMPRESARIAL_BENEFITS: MembershipPlanBenefit[] = [
  { icon: "idcard", pt: "Certificado e carteirinha digital de associado", en: "Digital member certificate and card" },
  { icon: "people", pt: "Presença no Diretório de Associados", en: "Listing in the Member Directory" },
  { icon: "calendar", pt: "Convite para eventos institucionais", en: "Invitation to institutional events" },
  { icon: "star", pt: "Acesso à Área do Associado", en: "Access to the Member Area" },
];

const CORPORATIVO_BENEFITS: MembershipPlanBenefit[] = [
  ...EMPRESARIAL_BENEFITS,
  { icon: "ticket", pt: "Acesso ao Member Privileges (benefícios de parceiros)", en: "Access to Member Privileges (partner benefits)" },
  { icon: "handshake", pt: "Participação em rodadas de negócios", en: "Participation in business roundtables" },
  { icon: "trending", pt: "Destaque no Diretório de Associados", en: "Featured placement in the Member Directory" },
];

const ESTRATEGICO_BENEFITS: MembershipPlanBenefit[] = [
  ...CORPORATIVO_BENEFITS,
  { icon: "plane", pt: "Participação prioritária em missões empresariais internacionais", en: "Priority participation in international business missions" },
  { icon: "briefcase", pt: "Reuniões com a Diretoria", en: "Meetings with the Board" },
  { icon: "megaphone", pt: "Divulgação institucional nas redes da Câmara", en: "Institutional promotion on the Chamber's channels" },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "empresarial",
    name: "Associado Empresarial",
    priceUsd: 700,
    tagline: { pt: "Para quem está começando a se conectar com o ecossistema Brasil–Omã.", en: "For those starting to connect with the Brazil–Oman ecosystem." },
    benefits: EMPRESARIAL_BENEFITS,
  },
  {
    id: "corporativo",
    name: "Associado Corporativo",
    priceUsd: 1500,
    tagline: { pt: "Para empresas que já buscam negócios e parcerias ativamente.", en: "For companies actively pursuing business and partnerships." },
    benefits: CORPORATIVO_BENEFITS,
  },
  {
    id: "estrategico",
    name: "Associado Estratégico",
    priceUsd: 2500,
    tagline: { pt: "Para quem quer papel de liderança institucional na relação bilateral.", en: "For those seeking institutional leadership in the bilateral relationship." },
    benefits: ESTRATEGICO_BENEFITS,
  },
];

export function getMembershipPlan(id: string): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((p) => p.id === id);
}
