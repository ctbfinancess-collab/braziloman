import { z } from "zod";

/**
 * Schemas e constantes do Portal do Candidato (7 etapas do fluxo completo de
 * associação). Cada etapa é salva parcialmente (ver /api/member/application)
 * e revalidada por inteiro no envio final (/api/member/application/submit).
 */

// ---------- Etapa 1: dados do responsável ----------
export const personalDataSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  nationality: z.string().trim().min(2).max(80),
  birthDate: z.string().trim().min(1),
  taxId: z.string().trim().min(1).max(60),
  idDocument: z.string().trim().min(1).max(60),
  role: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email(),
  address: z.string().trim().min(1).max(300),
  residenceCountry: z.string().trim().min(1).max(80),
  linkedin: z.string().trim().max(300).optional().or(z.literal("")),
  companyRelationship: z.string().trim().min(1).max(200),
  authorizedRepresentative: z.boolean(),
});
export type PersonalData = z.infer<typeof personalDataSchema>;

// ---------- Etapa 2: dados da empresa ----------
export const companyDataSchema = z.object({
  entityType: z.enum(["br", "foreign"]),
  legalName: z.string().trim().min(2).max(200),
  tradeName: z.string().trim().max(200).optional().or(z.literal("")),
  registrationNumber: z.string().trim().min(1).max(60),
  foundingDate: z.string().trim().min(1),
  countryHQ: z.string().trim().min(1).max(80),
  cityHQ: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(300),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().min(1).max(40),
  institutionalEmail: z.string().trim().email(),
  legalNature: z.string().trim().min(1).max(120),
  shareCapital: z.string().trim().max(80).optional().or(z.literal("")),
  employeeCount: z.string().trim().max(40).optional().or(z.literal("")),
  sectors: z.string().trim().min(1).max(300),
  productsServices: z.string().trim().min(1).max(600),
  countriesOfOperation: z.string().trim().max(300).optional().or(z.literal("")),
  affiliates: z.string().trim().max(400).optional().or(z.literal("")),
  administrators: z.string().trim().min(1).max(400),
  shareholderStructure: z.string().trim().min(1).max(400),
  beneficialOwners: z.string().trim().min(1).max(400),
});
export type CompanyData = z.infer<typeof companyDataSchema>;

// ---------- Etapa 3: perfil comercial + diagnóstico de internacionalização ----------
export const businessProfileSchema = z.object({
  annualRevenueRange: z.string().trim().min(1).max(80),
  mainMarkets: z.string().trim().max(300).optional().or(z.literal("")),
  importExportVolume: z.string().trim().max(200).optional().or(z.literal("")),
  tradedProducts: z.string().trim().max(400).optional().or(z.literal("")),
  interestInBrazil: z.string().trim().min(1).max(500),
  interestInOman: z.string().trim().min(1).max(500),
  sectorsOfInterest: z.string().trim().max(300).optional().or(z.literal("")),
  membershipGoal: z.string().trim().min(1).max(500),
  partnershipType: z.string().trim().max(300).optional().or(z.literal("")),
  investmentIntention: z.string().trim().max(300).optional().or(z.literal("")),
  publicTenderParticipation: z.boolean(),
  financingNeed: z.boolean(),
  interestInTradeMissions: z.boolean(),
  interestInMatchmaking: z.boolean(),
  expectationFromChamber: z.string().trim().min(1).max(600),

  exportsOrImports: z.boolean(),
  hasForeignTradeDept: z.boolean(),
  hasCertifications: z.boolean(),
  knowsTargetMarketLaw: z.boolean(),
  hasLocalDistributor: z.boolean(),
  needsRegulatorySupport: z.boolean(),
  needsLogistics: z.boolean(),
  needsFinancing: z.boolean(),
  needsMarketResearch: z.boolean(),
  plansToOpenBranch: z.boolean(),
  estimatedTimeline: z.string().trim().max(120).optional().or(z.literal("")),
  estimatedProjectValue: z.string().trim().max(120).optional().or(z.literal("")),
  mainDifficulties: z.string().trim().max(600).optional().or(z.literal("")),
});
export type BusinessProfile = z.infer<typeof businessProfileSchema>;

// ---------- Etapa 4: compliance e integridade ----------
export const COMPLIANCE_QUESTIONS = [
  { key: "pep", label: "Algum sócio, administrador ou beneficiário final é pessoa politicamente exposta?" },
  { key: "investigated", label: "A empresa ou seus responsáveis já foram objeto de investigação?" },
  { key: "litigation", label: "Existem processos criminais, fiscais, ambientais, trabalhistas ou regulatórios relevantes?" },
  { key: "sanctions", label: "A empresa já recebeu sanções administrativas?" },
  { key: "integrityProgram", label: "A empresa possui programa de integridade?" },
  { key: "anticorruptionPolicy", label: "A empresa possui política anticorrupção?" },
  { key: "amlPolicy", label: "A empresa possui política de prevenção à lavagem de dinheiro?" },
  { key: "sanctionedCountries", label: "A empresa realiza negócios com países ou entidades sancionadas?" },
  { key: "intermediaries", label: "A empresa utiliza intermediários, agentes ou representantes comerciais?" },
  { key: "conflictOfInterest", label: "Existem conflitos de interesse com integrantes da Câmara?" },
  { key: "criminalConviction", label: "Houve condenação por fraude, corrupção, lavagem de dinheiro ou financiamento ao terrorismo?" },
  { key: "licenses", label: "A empresa possui as licenças e autorizações necessárias?" },
  { key: "taxDebts", label: "Existem débitos fiscais relevantes?" },
  { key: "insolvency", label: "A empresa está em recuperação judicial, falência ou insolvência?" },
] as const;

export type ComplianceQuestionKey = (typeof COMPLIANCE_QUESTIONS)[number]["key"];

export const complianceAnswerSchema = z.object({
  key: z.string(),
  answer: z.enum(["yes", "no"]),
  explanation: z.string().trim().max(1000).optional().or(z.literal("")),
  documentUrl: z.string().trim().optional().or(z.literal("")),
});
export const complianceAnswersSchema = z.array(complianceAnswerSchema);
export type ComplianceAnswer = z.infer<typeof complianceAnswerSchema>;

// ---------- Etapa 5: documentos ----------
export const DOCUMENT_SLOTS_BR = [
  { key: "cnpjCard", label: "Cartão CNPJ" },
  { key: "articlesOfAssociation", label: "Contrato social e alterações" },
  { key: "registryCertificate", label: "Certidão simplificada da Junta Comercial" },
  { key: "directorsDocuments", label: "Documentos dos administradores" },
  { key: "addressProof", label: "Comprovante de endereço" },
  { key: "shareholderChart", label: "Organograma societário" },
  { key: "beneficialOwnersId", label: "Identificação dos beneficiários finais" },
  { key: "taxCertificates", label: "Certidões fiscais" },
  { key: "laborCertificate", label: "Certidão trabalhista" },
  { key: "balanceSheet", label: "Balanço patrimonial" },
  { key: "financialStatements", label: "Demonstrações financeiras" },
  { key: "bankStatement", label: "Comprovante bancário" },
  { key: "regulatoryLicenses", label: "Licenças regulatórias" },
  { key: "compliancePolicies", label: "Políticas de compliance" },
  { key: "powerOfAttorney", label: "Procuração (quando aplicável)" },
] as const;

export const DOCUMENT_SLOTS_FOREIGN = [
  { key: "certificateOfIncorporation", label: "Certificado de constituição" },
  { key: "businessLicense", label: "Licença comercial" },
  { key: "articlesOfAssociation", label: "Memorandum/articles of association" },
  { key: "shareholderRegistry", label: "Registro de acionistas" },
  { key: "directorsRegistry", label: "Registro de administradores" },
  { key: "beneficialOwnersId", label: "Identificação dos beneficiários finais" },
  { key: "representativePassports", label: "Passaportes ou documentos dos representantes" },
  { key: "addressProof", label: "Comprovante de endereço" },
  { key: "goodStandingCertificate", label: "Certificado de regularidade" },
  { key: "financialStatements", label: "Demonstrações financeiras" },
  { key: "bankReference", label: "Carta ou referência bancária" },
  { key: "apostilledDocuments", label: "Documentos apostilados ou legalizados (quando exigidos)" },
] as const;

export const documentEntrySchema = z.object({
  key: z.string(),
  label: z.string(),
  storageKey: z.string(),
  fileName: z.string().optional(),
  uploadedAt: z.string().optional(),
});
export const documentsSchema = z.array(documentEntrySchema);
export type DocumentEntry = z.infer<typeof documentEntrySchema>;

// ---------- Etapa 6: declarações finais + assinatura ----------
export const declarationsSchema = z.object({
  confirmTruthfulInfo: z.literal(true),
  confirmAuthorized: z.literal(true),
  confirmWillUpdate: z.literal(true),
  acceptsIntegrityChecks: z.literal(true),
  acceptsDataProcessing: z.literal(true),
  knowsCodeOfEthics: z.literal(true),
  acceptsStatute: z.literal(true),
  understandsDecision: z.literal(true),
  signatureName: z.string().trim().min(2).max(160),
  signatureRole: z.string().trim().min(1).max(120),
});
export type Declarations = z.infer<typeof declarationsSchema>;

export const WIZARD_STEPS = [
  { step: 1, key: "personal", label: "Dados pessoais" },
  { step: 2, key: "company", label: "Dados da empresa" },
  { step: 3, key: "profile", label: "Perfil comercial" },
  { step: 4, key: "compliance", label: "Compliance e integridade" },
  { step: 5, key: "documents", label: "Documentos" },
  { step: 6, key: "declarations", label: "Declarações e assinatura" },
  { step: 7, key: "review", label: "Revisão e envio" },
] as const;
