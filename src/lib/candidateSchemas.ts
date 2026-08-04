import { z } from "zod";

/**
 * Schemas e constantes do Portal do Candidato (7 etapas do fluxo completo de
 * associação). Cada etapa é salva parcialmente (ver /api/member/application)
 * e revalidada por inteiro no envio final (/api/member/application/submit).
 */

// ---------- Etapa 1: dados do responsável ----------
export const ROLE_OPTIONS = ["Sócio", "Diretor", "CEO", "Presidente", "Procurador", "Advogado", "Representante Legal", "Outro"] as const;
export const LANGUAGE_OPTIONS = [
  { value: "pt", label: "Português" },
  { value: "en", label: "Inglês" },
  { value: "ar", label: "Árabe" },
] as const;
export const CONTACT_METHOD_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "phone", label: "Telefone" },
  { value: "video", label: "Videoconferência" },
] as const;
export const OMAN_RELATIONSHIP_TYPES = [
  { value: "company", label: "Empresa" },
  { value: "person", label: "Pessoa" },
  { value: "institution", label: "Instituição" },
] as const;

export const personalDataSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  nationality: z.string().trim().min(2).max(80),
  birthDate: z.string().trim().min(1),
  taxId: z.string().trim().min(1).max(60),
  idDocument: z.string().trim().min(1).max(60),
  role: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  sameWhatsappAsPhone: z.boolean().optional(),
  email: z.string().trim().email(),
  address: z.string().trim().min(1).max(300),
  residenceCountry: z.string().trim().min(1).max(80),
  linkedin: z.string().trim().max(300).optional().or(z.literal("")),
  preferredLanguage: z.enum(["pt", "en", "ar"]).optional(),
  preferredContactMethod: z.enum(["whatsapp", "email", "phone", "video"]).optional(),
  hasOmanRelationship: z.boolean().optional(),
  omanRelationshipType: z.enum(["company", "person", "institution"]).optional(),
  omanRelationshipWho: z.string().trim().max(200).optional().or(z.literal("")),
  referredBy: z.string().trim().max(200).optional().or(z.literal("")),
  authorizedRepresentative: z.literal(
    true,
    "Você precisa confirmar que está autorizado(a) a representar a empresa."
  ),
});
export type PersonalData = z.infer<typeof personalDataSchema>;

// ---------- Etapa 2: dados da empresa ----------
export const LEGAL_NATURE_OPTIONS = [
  "LTDA", "S/A", "Sociedade Anônima Fechada", "Sociedade Anônima Aberta", "MPE", "EPP", "MEI",
  "Cooperativa", "Fundação", "Associação", "Holding", "Startup", "Empresa Pública", "Outro",
] as const;
export const COMPANY_CERTIFICATION_OPTIONS = ["ISO", "ESG", "B Corp", "FDA", "ANVISA", "Halal", "Kosher", "Outro"] as const;
export const CURRENCY_OPTIONS = ["USD", "BRL", "OMR", "EUR"] as const;
export const CONSOLIDATED_REVENUE_RANGES = [
  "Até R$ 360 mil", "R$ 360 mil a R$ 4,8 milhões", "R$ 4,8 a 20 milhões", "R$ 20 a 100 milhões",
  "R$ 100 a 500 milhões", "Acima de R$ 500 milhões",
] as const;

export const administratorEntrySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(160),
  document: z.string().trim().max(60).optional().or(z.literal("")),
  role: z.string().trim().max(120).optional().or(z.literal("")),
});
export type AdministratorEntry = z.infer<typeof administratorEntrySchema>;

export const shareholderEntrySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(160),
  stake: z.string().trim().max(40).optional().or(z.literal("")),
  nationality: z.string().trim().max(80).optional().or(z.literal("")),
});
export type ShareholderEntry = z.infer<typeof shareholderEntrySchema>;

export const beneficialOwnerEntrySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(160),
  stake: z.string().trim().max(40).optional().or(z.literal("")),
  hasRelatedCompany: z.boolean().optional(),
  relatedCompany: z.string().trim().max(200).optional().or(z.literal("")),
});
export type BeneficialOwnerEntry = z.infer<typeof beneficialOwnerEntrySchema>;

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
  countriesOfOperationCount: z.string().trim().max(20).optional().or(z.literal("")),
  affiliates: z.string().trim().max(400).optional().or(z.literal("")),
  administrators: z.array(administratorEntrySchema).min(1, "Adicione ao menos um administrador"),
  shareholderStructure: z.array(shareholderEntrySchema).min(1, "Adicione ao menos um sócio"),
  beneficialOwners: z.array(beneficialOwnerEntrySchema).min(1, "Adicione ao menos um beneficiário final"),
  belongsToEconomicGroup: z.boolean().optional(),
  economicGroupName: z.string().trim().max(200).optional().or(z.literal("")),
  hasSubsidiaries: z.boolean().optional(),
  hasInternationalOperations: z.boolean().optional(),
  certificationTypes: z.array(z.string()).optional(),
  isFamilyBusiness: z.boolean().optional(),
  internationalizationStartYear: z.string().trim().max(10).optional().or(z.literal("")),
  hasBoardOfDirectors: z.boolean().optional(),
  consolidatedAnnualRevenueRange: z.string().trim().max(80).optional().or(z.literal("")),
  revenueCurrency: z.enum(["USD", "BRL", "OMR", "EUR"]).optional(),
});
export type CompanyData = z.infer<typeof companyDataSchema>;

// ---------- Etapa 3: perfil comercial + diagnóstico de internacionalização ----------
export const MAIN_GOALS_OPTIONS = [
  "Encontrar clientes", "Encontrar fornecedores", "Encontrar investidores", "Exportar", "Importar",
  "Abrir empresa em Omã", "Abrir empresa no Brasil", "Missões empresariais", "Networking",
  "Representação institucional", "Acesso ao governo", "Eventos", "Inteligência de mercado",
  "Estudos setoriais", "Consultoria", "Certificações", "Compliance", "Logística", "Financiamento",
  "Joint Venture", "Distribuidor", "Franquia",
] as const;

export const TARGET_MARKETS_OPTIONS = ["Omã", "GCC", "Oriente Médio", "África", "Ásia", "Europa", "América Latina"] as const;

export const PRODUCT_CATEGORIES = [
  "Alimentos e Bebidas", "Agronegócio", "Pecuária", "Pesca e Aquicultura", "Mineração", "Petróleo e Gás",
  "Energia", "Energia Renovável", "Construção Civil", "Materiais de Construção", "Engenharia",
  "Máquinas e Equipamentos", "Automotivo", "Aeroespacial", "Naval", "Tecnologia", "Software",
  "Inteligência Artificial", "Fintech", "Blockchain", "Cibersegurança", "Telecomunicações", "Saúde",
  "Farmacêutico", "Equipamentos Médicos", "Cosméticos", "Moda e Têxtil", "Móveis", "Papel e Celulose",
  "Químicos", "Plásticos", "Metalurgia", "Educação", "Turismo", "Hotelaria", "Logística", "Transporte",
  "Meio Ambiente", "Reciclagem", "ESG", "Defesa", "Segurança", "Outro",
] as const;

export const PRODUCT_CERTIFICATIONS_OPTIONS = ["ANVISA", "FDA", "CE", "ISO", "Halal", "Kosher", "Orgânico", "Outro"] as const;

export const COMMERCIAL_SITUATION_OPTIONS = [
  "Produção própria", "Distribuidor", "Fabricante", "Revendedor", "Representante Comercial",
  "Prestador de Serviços", "Desenvolvedor de Tecnologia", "Importador", "Exportador",
] as const;

export const MATCHMAKING_TYPES_OPTIONS = [
  "Fornecedor", "Cliente", "Distribuidor", "Representante", "Investidor", "Fabricante",
  "Parceiro tecnológico", "Joint Venture",
] as const;

export const PROJECT_TIMELINE_OPTIONS = [
  "Já estou em negociação", "Nos próximos 3 meses", "Entre 3 e 6 meses", "Entre 6 e 12 meses",
  "Acima de 12 meses", "Ainda estou estudando o mercado",
] as const;

export const PROJECT_SCALE_OPTIONS = [
  "Apenas prospecção comercial", "Busca de fornecedores", "Busca de clientes", "Representação comercial",
  "Distribuição de produtos", "Exportação", "Importação", "Joint Venture", "Abertura de escritório",
  "Abertura de empresa", "Implantação industrial", "Ainda não definido",
] as const;

export const PROJECT_FINANCIAL_RANGE_OPTIONS = [
  "Ainda não estimado", "Até US$ 100 mil", "US$ 100 mil a US$ 500 mil", "US$ 500 mil a US$ 2 milhões",
  "Acima de US$ 2 milhões", "Prefiro não informar",
] as const;

export const PROJECT_STAGE_OPTIONS = [
  "Apenas conhecendo o mercado", "Realizando estudos", "Buscando parceiros", "Já possui contatos comerciais",
  "Está negociando", "Já possui operações em Omã", "Preciso da Câmara Brasil–Omã para me ajudar",
] as const;

export const NEXT_12M_GOALS_OPTIONS = [
  "Encontrar clientes", "Encontrar fornecedores", "Buscar investidores", "Exportar", "Importar",
  "Abrir empresa", "Abrir escritório", "Participar de missão empresarial", "Participar de rodadas de negócios",
  "Buscar apoio regulatório", "Buscar financiamento", "Outro",
] as const;

export const PRIORITY_URGENCY_OPTIONS = ["Imediata", "3 meses", "6 meses", "12 meses", "Sem prazo"] as const;

export const CHALLENGE_GROUPS = [
  { group: "Mercado e Estratégia", items: ["Conhecimento do mercado local", "Identificação de oportunidades de negócio", "Encontrar clientes", "Encontrar fornecedores", "Encontrar distribuidores", "Encontrar representantes comerciais", "Encontrar parceiros estratégicos (Joint Venture)", "Encontrar investidores"] },
  { group: "Regulatório e Jurídico", items: ["Legislação local", "Licenciamento", "Registro de produtos", "Tributação", "Constituição de empresa", "Contratos internacionais", "Proteção de propriedade intelectual"] },
  { group: "Operações", items: ["Logística internacional", "Transporte de mercadorias", "Desembaraço aduaneiro", "Armazenagem", "Cadeia de suprimentos"] },
  { group: "Financeiro", items: ["Acesso a financiamento", "Câmbio", "Meios de pagamento internacionais", "Garantias bancárias", "Seguro internacional"] },
  { group: "Comercial", items: ["Formação de preços", "Estratégia de entrada no mercado", "Concorrência local", "Marketing internacional", "Posicionamento da marca"] },
  { group: "Cultural", items: ["Idioma", "Diferenças culturais", "Etiqueta empresarial", "Negociação com empresas omanitas"] },
  { group: "Certificações e Compliance", items: ["Certificações exigidas", "Certificação Halal", "Compliance", "ESG", "Due Diligence", "Anticorrupção"] },
  { group: "Recursos Humanos", items: ["Contratação de profissionais", "Obtenção de vistos", "Transferência de executivos"] },
  { group: "Tecnologia", items: ["Adequação tecnológica", "Transformação digital", "Segurança da informação"] },
] as const;

export const CHAMBER_SUPPORT_AREAS_OPTIONS = [
  "Inteligência de mercado", "Matchmaking com empresas", "Missões empresariais", "Rodadas de negócios",
  "Apoio institucional", "Assessoria regulatória", "Assessoria jurídica", "Abertura de empresa em Omã",
  "Busca de investidores", "Busca de fornecedores", "Busca de clientes", "Apoio logístico",
  "Eventos e networking", "Capacitações e treinamentos", "Outro",
] as const;

export const businessProfileSchema = z.object({
  annualRevenueRange: z.string().trim().min(1).max(80),
  mainMarkets: z.string().trim().max(300).optional().or(z.literal("")),
  importExportVolume: z.string().trim().max(200).optional().or(z.literal("")),
  interestInBrazil: z.string().trim().min(1).max(500),
  sectorsOfInterest: z.string().trim().max(300).optional().or(z.literal("")),
  membershipGoal: z.string().trim().min(1).max(500),
  partnershipType: z.string().trim().max(300).optional().or(z.literal("")),
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
  mainDifficulties: z.string().trim().max(600).optional().or(z.literal("")),

  // Objetivos e mercado-alvo
  mainGoals: z.array(z.string()).max(3).optional(),
  targetMarkets: z.array(z.string()).optional(),

  // Produtos
  productCategories: z.array(z.string()).min(1, "Selecione ao menos uma categoria"),
  productSubcategory: z.string().trim().max(200).optional().or(z.literal("")),
  productDescription: z.string().trim().min(1).max(800),
  strategicProducts: z.string().trim().max(400).optional().or(z.literal("")),
  commercialBrand: z.string().trim().max(160).optional().or(z.literal("")),
  ncmHsCode: z.string().trim().max(60).optional().or(z.literal("")),
  productCertifications: z.array(z.string()).optional(),
  commercialSituation: z.array(z.string()).optional(),
  monthlyProductionCapacity: z.string().trim().max(80).optional().or(z.literal("")),
  annualProductionCapacity: z.string().trim().max(80).optional().or(z.literal("")),
  productionUnit: z.string().trim().max(40).optional().or(z.literal("")),

  // Exportação / Importação
  exportYears: z.string().trim().max(40).optional().or(z.literal("")),
  exportCountries: z.string().trim().max(300).optional().or(z.literal("")),
  exportAnnualVolume: z.string().trim().max(120).optional().or(z.literal("")),
  importProducts: z.string().trim().max(300).optional().or(z.literal("")),
  importOrigin: z.string().trim().max(300).optional().or(z.literal("")),

  // Inteligência comercial e matchmaking
  mainCompetitors: z.string().trim().max(400).optional().or(z.literal("")),
  referenceCompanies: z.string().trim().max(400).optional().or(z.literal("")),
  companiesToMeet: z.string().trim().max(400).optional().or(z.literal("")),
  matchmakingTypes: z.array(z.string()).optional(),

  // Projeto Omã
  omanProjectDescription: z.string().trim().min(1).max(1200),
  projectStartTimeline: z.string().trim().max(80).optional().or(z.literal("")),
  projectScale: z.string().trim().max(80).optional().or(z.literal("")),
  projectFinancialRange: z.string().trim().max(80).optional().or(z.literal("")),
  projectStage: z.string().trim().max(80).optional().or(z.literal("")),
  next12MonthsGoals: z.array(z.string()).max(3).optional(),
  priorityUrgency: z.string().trim().max(40).optional().or(z.literal("")),
  expectedChallenges: z.array(z.string()).optional(),
  chamberSupportAreas: z.array(z.string()).max(3).optional(),
});
export type BusinessProfile = z.infer<typeof businessProfileSchema>;

// ---------- Etapa 4: compliance e integridade ----------
const EXPLANATION = "explanation" as const;
const CHECKLIST = "checklist" as const;
const TEXT = "text" as const;

export const COMPLIANCE_QUESTIONS = [
  { key: "pep", label: "Algum sócio, administrador ou beneficiário final é pessoa politicamente exposta?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "investigated", label: "A empresa ou seus responsáveis já foram objeto de investigação?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "litigation", label: "Existem processos criminais, fiscais, ambientais, trabalhistas ou regulatórios relevantes?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "sanctions", label: "A empresa já recebeu sanções administrativas?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "integrityProgram", label: "A empresa possui programa de integridade?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "anticorruptionPolicy", label: "A empresa possui política anticorrupção?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "amlPolicy", label: "A empresa possui política de prevenção à lavagem de dinheiro?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "sanctionedCountries", label: "A empresa realiza negócios com países ou entidades sancionadas?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "intermediaries", label: "A empresa utiliza intermediários, agentes ou representantes comerciais?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "conflictOfInterest", label: "Existem conflitos de interesse com integrantes da Câmara?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "criminalConviction", label: "Houve condenação por fraude, corrupção, lavagem de dinheiro ou financiamento ao terrorismo?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "licenses", label: "A empresa possui as licenças e autorizações necessárias?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "taxDebts", label: "Existem débitos fiscais relevantes?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "insolvency", label: "A empresa está em recuperação judicial, falência ou insolvência?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  {
    key: "internationalSanctionsLists",
    label: "A empresa, seus sócios, administradores ou beneficiários finais estão sujeitos a listas de sanções internacionais?",
    revealType: CHECKLIST,
    checklistOptions: ["OFAC (Estados Unidos)", "Organização das Nações Unidas (ONU)", "União Europeia (UE)", "Reino Unido (UK Sanctions)", "Outra"],
    textLabel: "",
  },
  {
    key: "highRiskBeneficialOwners",
    label: "Há beneficiários finais residentes em países ou jurisdições classificadas como de alto risco?",
    revealType: TEXT,
    checklistOptions: [] as string[],
    textLabel: "Especifique",
  },
  { key: "hasComplianceProgram", label: "A empresa possui um Programa de Compliance ou Integridade formalmente implementado?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "hasCodeOfEthicsCompany", label: "A empresa possui Código de Ética e Conduta?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "hasHumanRightsPolicy", label: "A empresa possui Política de Direitos Humanos?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "hasEsgPolicy", label: "A empresa possui Política ESG (Ambiental, Social e Governança)?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "hasWhistleblowerChannel", label: "A empresa possui Canal de Denúncias?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  {
    key: "isAudited",
    label: "A empresa é auditada por auditoria independente?",
    revealType: TEXT,
    checklistOptions: [] as string[],
    textLabel: "Nome da empresa de auditoria",
  },
  {
    key: "hasComplianceCertifications",
    label: "A empresa possui certificações de compliance, governança ou sustentabilidade?",
    revealType: CHECKLIST,
    checklistOptions: ["ISO 37001 (Antissuborno)", "ISO 37301 (Compliance)", "ISO 9001", "ISO 14001", "ESG", "Outra"],
    textLabel: "",
  },
  { key: "ongoingInvestigation", label: "Existe alguma investigação, processo ou fato relevante em andamento que possa impactar a reputação da empresa?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "publicSectorContracts", label: "A empresa mantém contratos relevantes com órgãos públicos ou empresas estatais?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
  { key: "omanGovernmentBusiness", label: "A empresa já realizou ou pretende realizar negócios com o Governo do Sultanato de Omã ou com empresas estatais omanitas?", revealType: EXPLANATION, checklistOptions: [] as string[], textLabel: "" },
] as const;

export type ComplianceQuestionKey = (typeof COMPLIANCE_QUESTIONS)[number]["key"];

export const complianceAnswerSchema = z.object({
  key: z.string(),
  answer: z.enum(["yes", "no"]),
  explanation: z.string().trim().max(1000).optional().or(z.literal("")),
  selectedOptions: z.array(z.string()).optional(),
  /// Chave do objeto no bucket privado do R2 (não é a URL de exibição, que é
  /// gerada à parte e assinada com validade curta — ver rotas GET).
  documentKey: z.string().trim().optional().or(z.literal("")),
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
  { key: "companyProfile", label: "Apresentação Institucional (Company Profile)" },
  { key: "productCatalog", label: "Catálogo de Produtos e Serviços" },
  { key: "projectPortfolio", label: "Portfólio de Projetos ou Cases de Sucesso" },
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
  { key: "companyProfile", label: "Apresentação Institucional (Company Profile)" },
  { key: "productCatalog", label: "Catálogo de Produtos e Serviços" },
  { key: "projectPortfolio", label: "Portfólio de Projetos ou Cases de Sucesso" },
] as const;

export const DOCUMENT_STATUS_OPTIONS = [
  { value: "sent", label: "Enviado" },
  { value: "under_review", label: "Em análise" },
  { value: "approved", label: "Aprovado" },
] as const;

export const documentEntrySchema = z.object({
  key: z.string(),
  label: z.string(),
  storageKey: z.string(),
  fileName: z.string().optional(),
  uploadedAt: z.string().optional(),
  status: z.enum(["sent", "under_review", "approved"]).optional(),
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
  confirmDataUpdate: z.literal(true),
  confirmComplementaryDocs: z.literal(true),
  confirmNoBrokerageObligation: z.literal(true),
  consentsDataSharing: z.boolean().optional(),
  consentsMarketingComms: z.boolean().optional(),
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
