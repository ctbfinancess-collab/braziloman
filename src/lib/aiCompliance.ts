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
      return `- ${q?.label ?? a.key}: ${a.answer === "yes" ? "SIM" : "Não"}${a.explanation ? ` — explicação: ${a.explanation}` : ""}`;
    })
    .join("\n");

  const prompt = `Você é um assistente de apoio à análise de compliance de uma câmara de comércio bilateral (Brasil-Omã). NÃO tome decisões — apenas organize e destaque pontos de atenção para um analista humano revisar. Seja objetivo e conciso.

Dados do candidato:
- Nome: ${app.name}
- Empresa: ${app.company}
- Cargo/vínculo: ${app.personalData?.role ?? "—"} / ${app.personalData?.companyRelationship ?? "—"}
- Nacionalidade: ${app.personalData?.nationality ?? "—"}

Dados da empresa:
- Tipo: ${app.companyData?.entityType === "foreign" ? "estrangeira" : "brasileira"}
- Setores: ${app.companyData?.sectors ?? "—"}
- Quadro societário: ${app.companyData?.shareholderStructure ?? "—"}
- Beneficiários finais: ${app.companyData?.beneficialOwners ?? "—"}

Perfil comercial:
- Objetivo da associação: ${app.businessProfile?.membershipGoal ?? "—"}
- Interesse no Brasil: ${app.businessProfile?.interestInBrazil ?? "—"}
- Interesse em Omã: ${app.businessProfile?.interestInOman ?? "—"}

Respostas de compliance e integridade:
${answeredCompliance || "Nenhuma resposta registrada."}

Gere a resposta em português, em markdown simples, com estas seções:
1. **Resumo geral** (2-3 frases sobre quem é o candidato e o que busca)
2. **Pontos de atenção** (liste cada resposta "Sim" do compliance com uma frase de contexto; se não houver nenhuma, diga "Nenhum ponto de atenção identificado nas respostas")
3. **Sugestão de nível de risco** (Baixo, Médio ou Alto, com uma frase justificando — deixe claro que é só uma sugestão para o analista confirmar)`;

  const message = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}
