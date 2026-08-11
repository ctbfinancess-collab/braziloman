/**
 * Versão vigente do Contrato de Associação (termos aceitos antes de qualquer
 * cobrança de anuidade — ver src/lib/content.ts -> legalPages.membershipContract
 * para o texto completo, exibido em /contrato-associacao).
 *
 * Formato "AAAA-MM". Ao editar o texto do contrato de forma relevante,
 * incremente esta versão — associados que já aceitaram a versão anterior
 * precisarão aceitar de novo antes da próxima cobrança (ver
 * lib/paymentsServer.ts -> recordContractAcceptance).
 */
export const MEMBERSHIP_CONTRACT_VERSION = "2026-08";
