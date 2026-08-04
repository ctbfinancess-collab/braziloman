import Anthropic from "@anthropic-ai/sdk";
import { env, hasAiSummary } from "./env";
import { COMPLIANCE_QUESTIONS } from "./candidateSchemas";
import type {
  PersonalData,
  CompanyData,
  BusinessProfile,
  ComplianceAnswer,
} from "./candidateSchemas";

const client = hasAiSummary ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;

export function isAiSummaryEnabled() {
  return hasAiSummary;
}

type ApplicationForSummary = {
  name: string;
  company: string;
  personalData: PersonalData | null;
  companyData: CompanyData | null;
  businessProfile: (BusinessProfile & Record<string, unknown>) | null;
  complianceAnswers: ComplianceAnswer[] | null;
};

/**
 * Gera um resumo de triagem com a Claude API a partir dos dados da candidatura.
 * É só um apoio de leitura para quem for analisar — a decisão de aprovar,
 * pedir informações ou rejeitar continua sempre humana.
 */
export async function generateComplianceSummary(app: ApplicationForSummary): Promise<string> {
  if (!client) throw new Error("Resumo por IA não configurado (ANTHROPIC_API_KEY)");

  const answeredCompliance = (app.complianceAnswers ?? [])
    .map((a) => {
      const q = COMPLIANCE_QUESTIONS.find((q) => q.key === a.key);
      const extra = a.selectedOptions?.length ? ` — selecionado: ${a.selectedOptions.join(", ")}` : "";
      return `- ${q?.label ?? a.key}: ${a.answer === "yes" ? "SIM" : "Não"}${a.explanation ? ` — explicação: ${a.explanation}` : ""}${extra}`;
    })
    .join("\n");

  const shareholders = (app.companyData?.shareholderStructure ?? [])
    .map((s) => `${s.name}${s.stake ? ` (${s.stake})` : ""}`)
    .join("; ");
  const beneficialOwners = (app.companyData?.beneficialOwners ?? [])
    .map((b) => `${b.name}${b.hasRelatedCompany ? ` (vínculo com ${b.relatedCompany || "outra empresa"})` : ""}`)
    .join("; ");

  const prompt = `Você é um assistente de apoio à análise de compliance de uma câmara de comércio bilateral (Brasil-Omã). NÃO tome decisões — apenas organize e destaque pontos de atenção para um analista humano revisar. Seja objetivo e conciso.

Dados do candidato:
- Nome: ${app.name}
- Empresa: ${app.company}
- Cargo/relação com a empresa: ${app.personalData?.role ?? "—"}
- Nacionalidade: ${app.personalData?.nationality ?? "—"}

Dados da empresa:
- Tipo: ${app.companyData?.entityType === "foreign" ? "estrangeira" : "brasileira"}
- Setores: ${app.companyData?.sectors ?? "—"}
- Quadro societário: ${shareholders || "—"}
- Beneficiários finais: ${beneficialOwners || "—"}
- Grupo econômico: ${app.companyData?.belongsToEconomicGroup ? (app.companyData?.economicGroupName || "sim") : "não"}

Perfil comercial:
- Objetivo da associação: ${app.businessProfile?.membershipGoal ?? "—"}
- Interesse no Brasil: ${app.businessProfile?.interestInBrazil ?? "—"}
- O que pretende fazer em Omã: ${app.businessProfile?.omanProjectDescription ?? "—"}
- Categorias de produto: ${(app.businessProfile?.productCategories as string[] | undefined)?.join(", ") ?? "—"}

Respostas de compliance e integridade:
${answeredCompliance || "Nenhuma resposta registrada."}

Gere a resposta em português, em markdown simples, com estas seções:
1. **Resumo geral** (2-3 frases sobre quem é o candidato e o que busca)
2. **Pontos de atenção** (liste cada resposta "Sim" do compliance com uma frase de contexto; se não houver nenhuma, diga "Nenhum ponto de atenção identificado nas respostas")
3. **Sugestão de nível de risco** (Baixo, Médio ou Alto, com uma frase justificando — deixe claro que é só uma sugestão para o analista confirmar)`;

  const message = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  console.info("[aiCompliance] stop_reason:", message.stop_reason, "blocks:", message.content.map((b) => b.type));

  const block = message.content.find((b) => b.type === "text");
  if (!block || !block.text.trim()) {
    throw new Error(
      `A IA não retornou texto (stop_reason: ${message.stop_reason}). Tente novamente ou avise o suporte.`
    );
  }
  return block.text;
}
