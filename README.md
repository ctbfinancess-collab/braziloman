# CTB — Câmara de Comércio Brasil–Omã

Site institucional e base do futuro sistema da **Câmara de Comércio Brasil–Omã (CTB)** —
_"Conectando potências complementares em um mundo em transformação"_.

Site bilíngue (Português / Inglês), com design premium **preto & dourado** baseado na
identidade oficial da Câmara.

> _União e Prosperidade._

---

## 🧱 Tecnologias

| Camada        | Tecnologia                                            |
| ------------- | ----------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| Linguagem     | TypeScript                                            |
| Estilo        | CSS (design system próprio) + Tailwind CSS v4         |
| Banco de dados| PostgreSQL + [Prisma 7](https://www.prisma.io)        |
| Validação     | [Zod](https://zod.dev)                                |
| Deploy        | Railway (agora) · AWS ECS/App Runner (escala futura)  |

O site é a fundação de um **sistema** maior (área de associados, painel administrativo,
Centro de Arbitragem, etc.). Por isso usa um framework full-stack, e não HTML estático.

---

## 🚀 Rodando localmente

Pré-requisitos: **Node.js 20.9+** e **npm**.

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de ambiente
cp .env.example .env
# (opcional) preencher DATABASE_URL para ativar o banco

# 3. Iniciar em modo desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**.

> Sem `DATABASE_URL` o site funciona normalmente — o formulário de contato apenas
> registra as mensagens no log do servidor em vez de salvar no banco.

---

## 🎬 Vídeo institucional (hero)

O vídeo de fundo do topo é **grande demais para o Git** e por isso **não** é versionado.

- **Local:** coloque o arquivo em `public/institucional.mp4`.
- **Produção:** hospede o vídeo em um CDN/S3 e defina a variável:
  ```
  NEXT_PUBLIC_HERO_VIDEO="https://cdn.braziloman.org/institucional.mp4"
  ```
  Sem essa variável, o hero exibe o selo dourado sobre o gradiente (também elegante).

---

## 🗄️ Banco de dados (Prisma + PostgreSQL)

```bash
# Criar/atualizar as tabelas em desenvolvimento
npm run db:migrate

# Aplicar migrações em produção
npm run db:deploy

# Abrir o Prisma Studio (visualizar dados)
npm run db:studio
```

Modelos: `ContactMessage` (mensagens do formulário) e `MembershipApplication`
(pedidos de associação — base do sistema de membros).

---

## 🔒 Segurança

- **Cabeçalhos de segurança** (CSP, HSTS, X-Frame-Options, etc.) em `next.config.ts`.
- **Validação de entrada** com Zod em toda requisição do formulário.
- **Rate limiting** por IP no endpoint de contato.
- **Honeypot** anti-spam no formulário.
- **Segredos** apenas em `.env` (nunca versionado); `.env.example` documenta as chaves.
- **Validação das variáveis de ambiente** na inicialização (`src/lib/env.ts`).

---

## ☁️ Deploy

### Railway (recomendado agora)

1. Crie um projeto no Railway e conecte o repositório `ctbfinancess-collab/braziloman`.
2. Adicione um banco **PostgreSQL** (plugin do Railway) — ele gera `DATABASE_URL`.
3. Em _Variables_, confirme `DATABASE_URL` e (opcional) `NEXT_PUBLIC_HERO_VIDEO`.
4. O deploy usa `railway.json`: roda as migrações e sobe o site automaticamente.

### AWS (escala futura)

- `Dockerfile` pronto (saída _standalone_ do Next.js) para **ECS** ou **App Runner**.
- Banco em **RDS PostgreSQL**; vídeo/estáticos em **S3 + CloudFront**.

```bash
docker build -t braziloman .
docker run -p 3000:3000 -e DATABASE_URL="..." braziloman
```

---

## 📁 Estrutura

```
src/
  app/
    layout.tsx          # metadata, fontes, provider de idioma
    page.tsx            # composição da home
    globals.css         # design system preto & dourado
    api/contact/route.ts# endpoint do formulário (valida + rate limit + salva)
  components/           # Header, Sections, Contact, Footer
  lib/
    content.ts          # todo o conteúdo bilíngue (PT/EN)
    i18n.tsx            # contexto de idioma
    env.ts              # validação de variáveis de ambiente
    validation.ts       # schema Zod do contato
    prisma.ts           # cliente Prisma (driver adapter pg)
    rateLimit.ts        # limitador por IP
prisma/schema.prisma    # modelos do banco
public/                 # logo (selo), favicon
```

---

© 2026 CTB — Câmara de Comércio Brasil–Omã. Todos os direitos reservados.
