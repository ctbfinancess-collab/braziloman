/**
 * Conteúdo bilíngue (PT/EN) da Câmara de Comércio Brasil–Omã (CTB).
 * Fonte: apresentação institucional oficial "Câmara de Comércio - CTB II".
 */

export type Locale = "pt" | "en";

export const content = {
  pt: {
    meta: {
      title: "CTB — Câmara de Comércio Brasil–Omã",
      description:
        "Câmara de Comércio Brasil–Omã (CTB): conectando potências complementares. Promovemos comércio, investimentos e cooperação institucional entre o Brasil e o Sultanato de Omã.",
    },
    nav: {
      about: "A Câmara",
      countries: "Brasil & Omã",
      services: "Atuação",
      ecosystem: "Ecossistema",
      membership: "Associe-se",
      news: "Notícias",
      contact: "Contato",
    },
    brand: { tagline: "Câmara de Comércio Brasil–Omã" },
    hero: {
      eyebrow: "Brasil · Sultanato de Omã · 2026",
      titleA: "Conectando potências ",
      titleAccent: "complementares",
      titleB: " em um mundo em transformação",
      lead: "A CTB é a ponte institucional entre o Brasil e Omã: promovemos comércio, investimentos e cooperação estratégica, com neutralidade, transparência e segurança jurídica.",
      ctaJoin: "Associe-se à Câmara",
      ctaContact: "Fale conosco",
      motto: "“União e Prosperidade”",
      stats: [
        { n: "US$ 2 bi+", l: "em comércio bilateral anual" },
        { n: "São Paulo · Mascate", l: "presença nos dois países" },
        { n: "Londres · Dubai", l: "ecossistema global integrado" },
      ],
    },
    heroBridge: {
      eyebrow: "Brasil · Sultanato de Omã · 2026",
      titleA: "A ponte oficial entre o ",
      titleAccent: "Brasil",
      titleB: " e o Sultanato de Omã",
      lead: "A CTB é a plataforma institucional que conecta governos, empresas e investidores para promover comércio, investimento e cooperação estratégica entre duas nações unidas pela confiança e por uma visão compartilhada de futuro.",
      ctaJoin: "Associe-se à Câmara",
      ctaLearn: "Saiba mais",
      mottoMain: "União e Prosperidade",
      mottoSub: "Unio et Prosperitas · الاتحاد والازدهار",
    },
    purpose: {
      eyebrow: "Nosso propósito",
      titleA: "Promovemos conexões que transformam, ",
      titleAccent: "parcerias que constroem, futuros que permanecem.",
      items: [
        { icon: "handshake", h: "Conectamos", p: "Construímos pontes estratégicas entre instituições e líderes empresariais." },
        { icon: "chart", h: "Promovemos", p: "Fomentamos investimento, comércio e inovação com segurança e transparência." },
        { icon: "globe", h: "Fortalecemos", p: "Incentivamos o diálogo entre culturas e mercados." },
        { icon: "scale", h: "Garantimos", p: "Zelamos pela ética, conformidade e segurança jurídica em todas as relações." },
        { icon: "laurel", h: "Geramos", p: "Criamos prosperidade compartilhada e desenvolvimento sustentável." },
      ],
    },
    strip: [
      { icon: "globe", h: "Reconhecimento institucional", p: "Governos · Embaixadas · Parceiros estratégicos" },
      { icon: "pin", h: "Cooperação bilateral", p: "Comércio · Investimento · Inovação" },
      { icon: "network", h: "Rede global", p: "Brasil · Omã · CCG · Mercados internacionais" },
    ],
    about: {
      eyebrow: "A Câmara de Comércio (CTB)",
      title: "Uma associação civil, sem fins lucrativos e de caráter institucional",
      p1: "A CTB — Câmara de Comércio Brasil–Omã é uma associação civil de direito privado, sem fins lucrativos, criada para fortalecer e aprofundar as relações comerciais, econômicas e de investimentos entre as duas nações.",
      p2: "Atuamos com personalidade jurídica própria e plena autonomia administrativa, financeira e patrimonial, sempre pautados pela ética, transparência e neutralidade institucional.",
      pillars: [
        { h: "Missão", p: "Promover, fortalecer e aprofundar as relações comerciais, econômicas e de investimentos entre o Brasil e Omã." },
        { h: "Princípios", p: "Atuação baseada na ética, transparência, neutralidade institucional e respeito às legislações de ambos os países." },
        { h: "Governança", p: "Personalidade jurídica própria, com plena autonomia administrativa, financeira e patrimonial." },
      ],
    },
    moment: {
      eyebrow: "O momento global de 2026",
      title: "Por que agora",
      lead: "A reconfiguração geopolítica e a fragmentação das cadeias globais de suprimento tornaram as parcerias estratégicas baseadas em confiança e neutralidade mais essenciais do que nunca.",
      cards: [
        { icon: "🌐", h: "Contexto", p: "Reconfiguração geopolítica e fragmentação das cadeias globais de suprimento." },
        { icon: "⚡", h: "Desafios", p: "Pressão por segurança alimentar, segurança energética e transição para economias sustentáveis." },
        { icon: "🤝", h: "Oportunidade", p: "Parcerias estratégicas baseadas em confiança e neutralidade tornaram-se essenciais." },
      ],
    },
    countries: {
      eyebrow: "Duas economias, uma sinergia",
      title: "Brasil & Omã",
      brazil: {
        flag: "🇧🇷",
        name: "Brasil",
        sub: "Protagonismo e resiliência",
        items: [
          { b: "Geopolítica:", t: "voz central do Sul Global e mediador em fóruns como G20 e BRICS+." },
          { b: "Diplomacia ambiental:", t: "matriz energética limpa como “moeda diplomática” na transição climática." },
          { b: "Força econômica:", t: "agronegócio, infraestrutura e energia renovável (hidrogênio verde e eólica offshore)." },
          { b: "Comércio exterior:", t: "exportações projetadas entre US$ 340 e US$ 380 bilhões, com superávit de US$ 70 a 90 bilhões." },
        ],
      },
      oman: {
        flag: "🇴🇲",
        name: "Sultanato de Omã",
        sub: "Estabilidade e visão estratégica",
        items: [
          { b: "Diplomacia:", t: "política de “amigo de todos”, facilitador essencial de diálogos no Oriente Médio." },
          { b: "Geopolítica:", t: "posição invejável fora do Estreito de Ormuz, garantindo segurança energética." },
          { b: "Hub logístico:", t: "portos de Duqm, Sohar e Salalah conectando Ásia, África e Europa." },
          { b: "Vision 2040:", t: "diversificação com foco em turismo, mineração, tecnologia e hidrogênio verde." },
        ],
      },
    },
    partnership: {
      eyebrow: "Uma parceria natural e complementar",
      title: "Fluxos comerciais e sinergia",
      lead: "O Brasil fornece energia calórica (alimentos) e mineral; Omã fornece os insumos químicos (fertilizantes) e energéticos que sustentam a potência agrícola brasileira. Uma “parceria estratégica silenciosa” que já supera US$ 2 bilhões anuais.",
      flowFrom: {
        h: "Brasil → Omã",
        p: "Minério de ferro, complexo de proteínas animais (frango e carne) e açúcar.",
      },
      flowTo: {
        h: "Omã → Brasil",
        p: "Fertilizantes nitrogenados, petróleo refinado e produtos petroquímicos.",
      },
      example:
        "Exemplo prático: a operação da Vale em Sohar como centro de distribuição industrial para o Oriente Médio e Ásia.",
    },
    services: {
      eyebrow: "Como atuamos",
      title: "Fomento, conectividade e segurança jurídica",
      lead: "Uma estrutura completa para viabilizar negócios entre os dois países — do primeiro contato à segurança jurídica das operações.",
      cards: [
        { icon: "🤝", h: "Intercâmbio", p: "Promoção de missões comerciais, fóruns, seminários e feiras de negócios bilaterais." },
        { icon: "📊", h: "Inteligência", p: "Produção de estudos, relatórios e análises setoriais para identificar oportunidades de mercado." },
        { icon: "🔬", h: "Cultura e Tecnologia", p: "Incentivo a iniciativas que facilitem o intercâmbio tecnológico entre os dois países." },
        { icon: "📑", h: "Certificação", p: "Serviços de certificação de documentos de exportação e certificados de origem." },
        { icon: "🏛️", h: "Interlocução", p: "Atuação como interlocutora institucional perante autoridades governamentais quando autorizada." },
        { icon: "⚖️", h: "Segurança Jurídica", p: "Centro próprio de Arbitragem e Mediação, com gestão independente, celeridade e imparcialidade." },
      ],
    },
    ecosystem: {
      eyebrow: "Nosso ecossistema estratégico",
      title: "Uma estrutura global integrada",
      lead: "O sucesso da CTB é sustentado por um ecossistema de empresas e instituições que garantem suporte jurídico, financeiro, operacional e humanitário em escala global.",
      cards: [
        { tag: "Londres", h: "CTB Holdings", p: "Mantenedora global do Grupo, responsável pela governança corporativa e diretrizes estratégicas internacionais." },
        { tag: "Trade Finance", h: "CTBX Venture Investment S.A.", p: "Braço especializado em Trade Finance e consultoria em commodities, focado em operações estruturadas." },
        { tag: "Dubai", h: "CTB Finance", p: "Suporte às operações financeiras internacionais, posicionada no maior hub financeiro do Oriente Médio." },
        { tag: "Inteligência", h: "OmanBrazil", p: "Hub de inteligência comercial: identificação de oportunidades, análise de mercado e intermediação de negócios." },
        { tag: "ESG · Impacto", h: "Fundação Wahibi", p: "Pilar de responsabilidade institucional em projetos humanitários, sustentabilidade e desenvolvimento humano." },
        { tag: "Arbitragem", h: "Centro de Arbitragem CTB", p: "Órgão especial da Câmara para administração de conflitos, com gestão independente e imparcial." },
      ],
    },
    membership: {
      eyebrow: "Faça parte",
      title: "Associe-se à CTB",
      lead: "Torne-se membro e acesse uma rede exclusiva de negócios, inteligência de mercado e segurança jurídica entre o Brasil e Omã.",
      benefits: [
        "Acesso a rodadas de negócios e missões empresariais",
        "Relatórios e análises de mercado exclusivos",
        "Suporte em certificação e comércio exterior",
        "Networking com lideranças dos dois países",
        "Acesso ao Centro de Arbitragem e Mediação",
        "Divulgação da sua empresa nos canais da Câmara",
      ],
      cta: "Quero me associar",
    },
    news: {
      eyebrow: "Fique por dentro",
      title: "Notícias & Eventos",
      items: [
        { tag: "Lançamento", date: "2026 · São Paulo / Mascate", h: "Lançamento oficial da CTB", p: "“Hoje iniciamos uma nova rota de crescimento global. Junte-se à Câmara de Comércio Brasil–Omã.”" },
        { tag: "Missão", date: "Em breve · Mascate", h: "Missão empresarial a Omã", p: "Delegação de empresas brasileiras para rodadas de negócios nos portos de Duqm, Sohar e Salalah." },
        { tag: "Webinar", date: "Em breve · Online", h: "Como exportar para o Golfo", p: "Especialistas apresentam oportunidades e caminhos para acessar o mercado do Oriente Médio." },
      ],
    },
    contact: {
      eyebrow: "Fale conosco",
      title: "Contato",
      lead: "Quer expandir seus negócios entre o Brasil e Omã ou saber mais sobre a CTB? Envie sua mensagem — retornaremos o quanto antes.",
      address: "São Paulo, Brasil · Mascate, Omã",
      form: {
        name: "Nome completo",
        email: "E-mail",
        company: "Empresa",
        message: "Mensagem",
        submit: "Enviar mensagem",
        sending: "Enviando…",
        ok: "Mensagem enviada com sucesso. Obrigado pelo contato!",
        err: "Não foi possível enviar. Verifique os campos e tente novamente.",
      },
    },
    footer: {
      tagline: "Câmara de Comércio Brasil–Omã",
      about: "Associação civil de direito privado, sem fins lucrativos. União e Prosperidade.",
      navTitle: "Navegação",
      contactTitle: "Contato",
      rights: "Todos os direitos reservados.",
    },
  },

  en: {
    meta: {
      title: "BOCC — Brazil–Oman Chamber of Commerce",
      description:
        "Brazil–Oman Chamber of Commerce (CTB): connecting complementary powers. We promote trade, investment and institutional cooperation between Brazil and the Sultanate of Oman.",
    },
    nav: {
      about: "The Chamber",
      countries: "Brazil & Oman",
      services: "What we do",
      ecosystem: "Ecosystem",
      membership: "Join us",
      news: "News",
      contact: "Contact",
    },
    brand: { tagline: "Brazil–Oman Chamber of Commerce" },
    hero: {
      eyebrow: "Brazil · Sultanate of Oman · 2026",
      titleA: "Connecting ",
      titleAccent: "complementary powers",
      titleB: " in a changing world",
      lead: "CTB is the institutional bridge between Brazil and Oman: we promote trade, investment and strategic cooperation with neutrality, transparency and legal certainty.",
      ctaJoin: "Join the Chamber",
      ctaContact: "Get in touch",
      motto: "“Union and Prosperity”",
      stats: [
        { n: "US$ 2 bn+", l: "in annual bilateral trade" },
        { n: "São Paulo · Muscat", l: "presence in both countries" },
        { n: "London · Dubai", l: "integrated global ecosystem" },
      ],
    },
    heroBridge: {
      eyebrow: "Brazil · Sultanate of Oman · 2026",
      titleA: "The official bridge between ",
      titleAccent: "Brazil",
      titleB: " and the Sultanate of Oman",
      lead: "CTB is the institutional platform that connects governments, businesses and investors to promote trade, investment and strategic cooperation between two nations united by trust and a shared vision for the future.",
      ctaJoin: "Join the Chamber",
      ctaLearn: "Learn more",
      mottoMain: "Unity and Prosperity",
      mottoSub: "Unio et Prosperitas · الاتحاد والازدهار",
    },
    purpose: {
      eyebrow: "Our purpose",
      titleA: "We promote connections that transform, ",
      titleAccent: "partnerships that build, futures that last.",
      items: [
        { icon: "handshake", h: "We connect", p: "We build strategic bridges between institutions and business leaders." },
        { icon: "chart", h: "We promote", p: "We foster investment, trade and innovation with security and transparency." },
        { icon: "globe", h: "We strengthen", p: "We encourage dialogue between cultures and markets." },
        { icon: "scale", h: "We ensure", p: "We uphold ethics, compliance and legal certainty in all relationships." },
        { icon: "laurel", h: "We generate", p: "We create shared prosperity and sustainable development." },
      ],
    },
    strip: [
      { icon: "globe", h: "Institutional recognition", p: "Governments · Embassies · Strategic partners" },
      { icon: "pin", h: "Bilateral cooperation", p: "Trade · Investment · Innovation" },
      { icon: "network", h: "Global network", p: "Brazil · Oman · GCC · International markets" },
    ],
    about: {
      eyebrow: "The Chamber of Commerce (CTB)",
      title: "A non-profit civil association of institutional character",
      p1: "CTB — the Brazil–Oman Chamber of Commerce is a private-law, non-profit civil association created to strengthen and deepen commercial, economic and investment relations between the two nations.",
      p2: "We operate with our own legal personality and full administrative, financial and asset autonomy, always guided by ethics, transparency and institutional neutrality.",
      pillars: [
        { h: "Mission", p: "To promote, strengthen and deepen commercial, economic and investment relations between Brazil and Oman." },
        { h: "Principles", p: "Action grounded in ethics, transparency, institutional neutrality and respect for both countries' laws." },
        { h: "Governance", p: "Own legal personality with full administrative, financial and asset autonomy." },
      ],
    },
    moment: {
      eyebrow: "The global moment of 2026",
      title: "Why now",
      lead: "Geopolitical realignment and the fragmentation of global supply chains have made strategic partnerships based on trust and neutrality more essential than ever.",
      cards: [
        { icon: "🌐", h: "Context", p: "Geopolitical realignment and fragmentation of global supply chains." },
        { icon: "⚡", h: "Challenges", p: "Pressure for food security, energy security and the transition to sustainable economies." },
        { icon: "🤝", h: "Opportunity", p: "Strategic partnerships based on trust and neutrality have become essential." },
      ],
    },
    countries: {
      eyebrow: "Two economies, one synergy",
      title: "Brazil & Oman",
      brazil: {
        flag: "🇧🇷",
        name: "Brazil",
        sub: "Leadership and resilience",
        items: [
          { b: "Geopolitics:", t: "a central voice of the Global South and mediator in forums such as G20 and BRICS+." },
          { b: "Environmental diplomacy:", t: "clean energy matrix as a “diplomatic currency” in the climate transition." },
          { b: "Economic strength:", t: "agribusiness, infrastructure and renewable energy (green hydrogen and offshore wind)." },
          { b: "Foreign trade:", t: "exports projected between US$ 340 and US$ 380 billion, with a US$ 70–90 billion surplus." },
        ],
      },
      oman: {
        flag: "🇴🇲",
        name: "Sultanate of Oman",
        sub: "Stability and strategic vision",
        items: [
          { b: "Diplomacy:", t: "a “friend to all” policy, an essential facilitator of dialogue in the Middle East." },
          { b: "Geopolitics:", t: "an enviable position outside the Strait of Hormuz, ensuring energy security." },
          { b: "Logistics hub:", t: "the ports of Duqm, Sohar and Salalah connecting Asia, Africa and Europe." },
          { b: "Vision 2040:", t: "diversification focused on tourism, mining, technology and green hydrogen." },
        ],
      },
    },
    partnership: {
      eyebrow: "A natural and complementary partnership",
      title: "Trade flows and synergy",
      lead: "Brazil supplies caloric (food) and mineral energy; Oman supplies the chemical inputs (fertilizers) and energy that sustain Brazil's agricultural power. A “quiet strategic partnership” already exceeding US$ 2 billion per year.",
      flowFrom: {
        h: "Brazil → Oman",
        p: "Iron ore, animal protein complex (poultry and meat) and sugar.",
      },
      flowTo: {
        h: "Oman → Brazil",
        p: "Nitrogen fertilizers, refined oil and petrochemical products.",
      },
      example:
        "Case in point: Vale's operation in Sohar as an industrial distribution hub for the Middle East and Asia.",
    },
    services: {
      eyebrow: "What we do",
      title: "Promotion, connectivity and legal certainty",
      lead: "A complete structure to enable business between the two countries — from first contact to legal certainty of operations.",
      cards: [
        { icon: "🤝", h: "Exchange", p: "Promotion of trade missions, forums, seminars and bilateral business fairs." },
        { icon: "📊", h: "Intelligence", p: "Studies, reports and sector analyses to identify market opportunities." },
        { icon: "🔬", h: "Culture & Technology", p: "Support for initiatives that facilitate technological exchange between the two countries." },
        { icon: "📑", h: "Certification", p: "Certification services for export documents and certificates of origin." },
        { icon: "🏛️", h: "Interlocution", p: "Acting as an institutional interlocutor before government authorities when authorized." },
        { icon: "⚖️", h: "Legal Certainty", p: "Own Arbitration and Mediation Center with independent management, speed and impartiality." },
      ],
    },
    ecosystem: {
      eyebrow: "Our strategic ecosystem",
      title: "An integrated global structure",
      lead: "CTB's success is supported by an ecosystem of companies and institutions that provide legal, financial, operational and humanitarian support on a global scale.",
      cards: [
        { tag: "London", h: "CTB Holdings", p: "Global holding of the Group, responsible for corporate governance and international strategic guidelines." },
        { tag: "Trade Finance", h: "CTBX Venture Investment S.A.", p: "Specialized arm in Trade Finance and commodities consulting, focused on structured operations." },
        { tag: "Dubai", h: "CTB Finance", p: "Support for international financial operations, positioned in the largest financial hub of the Middle East." },
        { tag: "Intelligence", h: "OmanBrazil", p: "Commercial intelligence hub: opportunity identification, market analysis and business intermediation." },
        { tag: "ESG · Impact", h: "Wahibi Foundation", p: "Pillar of institutional responsibility in humanitarian projects, sustainability and human development." },
        { tag: "Arbitration", h: "CTB Arbitration Center", p: "Special body of the Chamber for conflict management, with independent and impartial governance." },
      ],
    },
    membership: {
      eyebrow: "Be part of it",
      title: "Join the CTB",
      lead: "Become a member and access an exclusive network of business, market intelligence and legal certainty between Brazil and Oman.",
      benefits: [
        "Access to business rounds and corporate missions",
        "Exclusive market reports and analyses",
        "Support in certification and foreign trade",
        "Networking with leaders from both countries",
        "Access to the Arbitration and Mediation Center",
        "Promotion of your company across the Chamber's channels",
      ],
      cta: "I want to join",
    },
    news: {
      eyebrow: "Stay informed",
      title: "News & Events",
      items: [
        { tag: "Launch", date: "2026 · São Paulo / Muscat", h: "Official launch of the CTB", p: "“Today we begin a new route of global growth. Join the Brazil–Oman Chamber of Commerce.”" },
        { tag: "Mission", date: "Soon · Muscat", h: "Business mission to Oman", p: "A delegation of Brazilian companies for business rounds at the ports of Duqm, Sohar and Salalah." },
        { tag: "Webinar", date: "Soon · Online", h: "How to export to the Gulf", p: "Experts present opportunities and pathways to access the Middle East market." },
      ],
    },
    contact: {
      eyebrow: "Get in touch",
      title: "Contact",
      lead: "Want to expand your business between Brazil and Oman or learn more about CTB? Send us a message — we'll get back to you as soon as possible.",
      address: "São Paulo, Brazil · Muscat, Oman",
      form: {
        name: "Full name",
        email: "Email",
        company: "Company",
        message: "Message",
        submit: "Send message",
        sending: "Sending…",
        ok: "Message sent successfully. Thank you for reaching out!",
        err: "Could not send. Please check the fields and try again.",
      },
    },
    footer: {
      tagline: "Brazil–Oman Chamber of Commerce",
      about: "A private-law, non-profit civil association. Union and Prosperity.",
      navTitle: "Navigation",
      contactTitle: "Contact",
      rights: "All rights reserved.",
    },
  },
};

export type Dict = (typeof content)["pt"];
