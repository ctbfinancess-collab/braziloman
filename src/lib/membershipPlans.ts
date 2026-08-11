/**
 * Catálogo dos planos de associação pagos — três categorias fixas, com preço
 * em USD (é assim que a Câmara cobra). Não tem nenhuma relação com o
 * Programa de Fidelidade (Gold/Black/Platinum, ver lib/loyalty.ts) — são
 * conceitos propositalmente separados, decisão confirmada com o usuário, e
 * por isso esses nomes nunca aparecem aqui.
 *
 * Fica em código (não no editor de conteúdo do admin) de propósito: preço é
 * dado sensível demais pra editar como texto solto — mesma lógica já usada
 * pras faixas do Programa de Fidelidade em lib/loyalty.ts.
 *
 * Cada plano lista só os benefícios EXCLUSIVOS dele (não repete os do plano
 * anterior) — a UI (ChoosePlanPage) mostra `inheritsLabel` ("Inclui todos os
 * benefícios do Empresarial, mais:") antes da lista pra deixar claro que é
 * cumulativo. Benefícios marcados com "*" dependem de disponibilidade/custos
 * à parte — ver o aviso "Informações importantes" abaixo dos cards, também
 * definido aqui pra não duplicar o texto em dois lugares.
 *
 * ORDEM importa: a UI mostra só os 4 primeiros de cada `benefits` de cara
 * (os mais "concretos"/tangíveis primeiro) e esconde o resto atrás de "Ver
 * todos os benefícios" — os 4 primeiros aqui foram escolhidos de propósito
 * pra serem o resumo mais forte de cada categoria.
 */

export type MembershipPlanId = "empresarial" | "corporativo" | "estrategico";

export type MembershipPlanBenefit = { pt: string; en: string };

export type MembershipPlan = {
  id: MembershipPlanId;
  /// Precisa bater exatamente com o texto usado em
  /// MembershipApplication.membershipCategory (ver formulário do admin).
  name: string;
  /** Nome curto pro botão "Escolher X" (ex.: "Empresarial"/"Business") —
   *  `name` fica sempre em português (ver nota acima), então não dá pra
   *  extrair a versão em inglês dele. */
  shortLabel: { pt: string; en: string };
  priceUsd: number;
  tagline: { pt: string; en: string };
  /** "Tudo do Empresarial +" etc. — null no primeiro plano, que não herda nada. */
  inheritsLabel: { pt: string; en: string } | null;
  /** Só os benefícios exclusivos/adicionais deste plano. */
  benefits: MembershipPlanBenefit[];
  /** Legenda do placeholder de imagem institucional no topo do card —
   *  usada como `title`/`alt`, e como texto do próprio placeholder enquanto
   *  `imageSrc` for null (ver ChoosePlanPage). */
  imageHint: { pt: string; en: string };
  /** Caminho da foto real em /public, quando já tiver uma (ver
   *  public/images/plans/). null = mostra o placeholder com ícone. */
  imageSrc: string | null;
};

/** Quantos benefícios de cada plano ficam visíveis de cara na tela de
 *  escolha — o resto fica atrás do "Ver todos os benefícios" (ver
 *  ChoosePlanPage). Os 4 primeiros de cada `benefits` abaixo foram
 *  ordenados de propósito pra serem esse resumo. */
export const VISIBLE_BENEFITS_COUNT = 4;

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "empresarial",
    name: "Associado Empresarial",
    shortLabel: { pt: "Empresarial", en: "Business" },
    priceUsd: 700,
    tagline: {
      pt: "Para empresas que desejam iniciar e ampliar suas conexões no ecossistema Brasil–Omã.",
      en: "For companies looking to start and expand their connections in the Brazil–Oman ecosystem.",
    },
    inheritsLabel: null,
    imageHint: { pt: "Rodada de negócios Brasil–Omã", en: "Brazil–Oman business roundtable" },
    imageSrc: "/images/plans/empresarial.jpg",
    benefits: [
      { pt: "Certificado e credencial digital de associado", en: "Digital member certificate and credential" },
      { pt: "Networking empresarial Brasil–Omã", en: "Brazil–Oman business networking" },
      { pt: "Conteúdos e oportunidades exclusivas", en: "Exclusive content and opportunities" },
      { pt: "Orientação inicial sobre negócios e estabelecimento em Brasil ou Omã", en: "Initial guidance on doing business and establishing a presence in Brazil or Oman" },
      { pt: "Acesso à Área do Associado", en: "Access to the Member Area" },
      { pt: "Convites para eventos e iniciativas da Câmara*", en: "Invitations to Chamber events and initiatives*" },
      { pt: "Condições especiais com parceiros da Câmara", en: "Special conditions with Chamber partners" },
      { pt: "Orientação sobre procedimentos empresariais, documentais e consulares", en: "Guidance on business, documentation and consular procedures" },
    ],
  },
  {
    id: "corporativo",
    name: "Associado Corporativo",
    shortLabel: { pt: "Corporativo", en: "Corporate" },
    priceUsd: 1500,
    tagline: {
      pt: "Para empresas que buscam negócios, internacionalização e presença ativa entre Brasil e Omã.",
      en: "For companies pursuing business, internationalization and an active presence between Brazil and Oman.",
    },
    inheritsLabel: { pt: "Inclui todos os benefícios do Empresarial, mais:", en: "Includes everything in Business, plus:" },
    imageHint: { pt: "Networking Brasil–Omã", en: "Brazil–Oman networking" },
    imageSrc: "/images/plans/corporativo.jpg",
    benefits: [
      { pt: "Consultoria inicial de internacionalização", en: "Initial internationalization consulting" },
      { pt: "Orientação para abertura e estabelecimento de empresas em Brasil ou Omã", en: "Guidance for setting up and establishing companies in Brazil or Oman" },
      { pt: "Suporte inicial em processos de licenciamento e documentação", en: "Initial support with licensing and documentation processes" },
      { pt: "Conexão com parceiros especializados locais", en: "Connection with specialized local partners" },
      { pt: "Condições preferenciais em serviços de parceiros, incluindo corporate services, jurídico, contabilidade, tradução e legalização", en: "Preferential conditions on partner services, including corporate services, legal, accounting, translation and legalization" },
      { pt: "Acesso a informações e relatórios de mercado", en: "Access to market information and reports" },
      { pt: "Participação em rodadas de negócios promovidas pela Câmara*", en: "Participation in business roundtables promoted by the Chamber*" },
      { pt: "Prioridade de inscrição em eventos e encontros empresariais*", en: "Priority registration for business events and meetings*" },
    ],
  },
  {
    id: "estrategico",
    name: "Associado Estratégico",
    shortLabel: { pt: "Estratégico", en: "Strategic" },
    priceUsd: 2500,
    tagline: {
      pt: "Para empresas que necessitam de acompanhamento estratégico em sua expansão e atuação bilateral.",
      en: "For companies that need strategic support for their expansion and bilateral operations.",
    },
    inheritsLabel: { pt: "Inclui todos os benefícios do Corporativo, mais:", en: "Includes everything in Corporate, plus:" },
    imageHint: { pt: "Reunião executiva de alto nível", en: "High-level executive meeting" },
    imageSrc: "/images/plans/estrategico.jpg",
    benefits: [
      { pt: "Business Support Brasil–Omã personalizado", en: "Personalized Brazil–Oman Business Support" },
      { pt: "Diagnóstico estratégico para entrada ou expansão no mercado", en: "Strategic diagnostic for market entry or expansion" },
      { pt: "Apoio de Soft Landing para estabelecimento empresarial", en: "Soft Landing support for business establishment" },
      { pt: "Acompanhamento na estruturação inicial da implantação", en: "Support structuring the initial setup" },
      { pt: "Facilitação de conexões empresariais e institucionais relevantes", en: "Facilitation of relevant business and institutional connections" },
      { pt: "Apoio na identificação de parceiros e oportunidades de negócios", en: "Support identifying partners and business opportunities" },
      { pt: "Prioridade em rodadas de negócios e agendas empresariais*", en: "Priority in business roundtables and business agendas*" },
      { pt: "Prioridade de inscrição em missões empresariais internacionais*", en: "Priority registration for international business missions*" },
      { pt: "Acesso prioritário a encontros estratégicos promovidos pela Câmara*", en: "Priority access to strategic gatherings promoted by the Chamber*" },
      { pt: "International Trade Desk Brasil–Omã", en: "Brazil–Oman International Trade Desk" },
      { pt: "Mastermind Estratégico Brasil–Omã", en: "Brazil–Oman Strategic Mastermind" },
    ],
  },
];

/** Aviso "Informações importantes" exibido abaixo dos três cards — mesmo
 *  texto pra todos os planos, não repetido em cada card. */
export const MEMBERSHIP_PLANS_NOTICE = {
  title: { pt: "Informações importantes", en: "Important information" },
  paragraphs: [
    {
      pt: "A anuidade refere-se à categoria de associação e aos benefícios descritos. Eventos, jantares, missões empresariais, viagens, hospedagem, transporte, taxas governamentais ou consulares e determinados serviços especializados não estão automaticamente incluídos na anuidade e poderão ter custos adicionais.",
      en: "The annual dues refer to the membership category and the benefits described. Events, dinners, business missions, travel, lodging, transportation, government or consular fees and certain specialized services are not automatically included in the annual dues and may involve additional costs.",
    },
    {
      pt: "Consultorias, orientações e facilitação oferecidas pela Câmara estão sujeitas ao escopo de cada categoria. Serviços jurídicos, contábeis, consulares, governamentais ou técnicos especializados poderão ser executados por parceiros ou profissionais habilitados e cobrados separadamente. Condições preferenciais e descontos estão sujeitos à disponibilidade e aos acordos vigentes com parceiros.",
      en: "Consulting, guidance and facilitation offered by the Chamber are subject to the scope of each category. Legal, accounting, consular, government or specialized technical services may be carried out by qualified partners or professionals and billed separately. Preferential conditions and discounts are subject to availability and current partner agreements.",
    },
  ],
};

export function getMembershipPlan(id: string): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((p) => p.id === id);
}
