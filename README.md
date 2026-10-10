# Hub XP

Hub centralizado que conecta **cliente** e **assessor** de investimentos da XP.

- **Cliente**: faz a anamnese e conecta suas contas via Open Finance para administrar todos os seus ativos e investimentos em um só lugar.
- **Assessor**: gerencia e se relaciona com seus clientes, acompanha métricas e prospecta novos clientes com base em benchmark, apoiado por agents de IA que trazem dados bancários e notícias de mercado.

Contexto completo do produto: [`docs/context.md`](docs/context.md).

## Arquitetura

**Monolito modular em Next.js full-stack**: um único projeto e um único deploy. A UI e a API ficam em `src/app` (App Router), e as regras de negócio ficam em módulos independentes em `src/modules`. Cada módulo é dono dos seus dados e só é acessado pela sua interface pública (`index.ts`).

```
Cliente ──▶ /cliente  ──▶ [cliente] ──┐
                                      ├──▶ [assessor] ◀── /assessor ◀── Assessor
          [integracoes/agents] ───────┘
            ├─ agent bancário (Open Finance)
            └─ agent de notícias (APIs externas + LLM)
          [usuarios] ── identidade e permissões para todos
```

| Módulo | Tipo | Submódulos |
|---|---|---|
| `cliente` | primordial | `anamnese`, `open-finance`, `patrimonio` |
| `assessor` | primordial | `clientes`, `ativos`, `metricas`, `prospeccao` |
| `usuarios` | suporte | `auth`, `perfis` |
| `integracoes` | suporte | `bancos`, `noticias`, `agents` |

## Estrutura de pastas

```
.
├── CLAUDE.md                  # regras do projeto para o Claude Code
├── docs/                      # context.md (produto), study.md
├── src/
│   ├── app/                   # rotas Next: UI e API (camada fina, sem regra de negócio)
│   │   ├── cliente/           # anamnese, open-finance, patrimonio
│   │   ├── assessor/          # clientes, ativos, metricas, prospeccao
│   │   └── api/               # route handlers (ex.: /api/health)
│   ├── modules/
│   │   ├── cliente/
│   │   │   ├── index.ts       # interface pública do módulo
│   │   │   ├── seed.ts        # dados sintéticos do módulo (npm run db:seed)
│   │   │   └── anamnese/      # service.ts, schema.ts, db.ts
│   │   ├── assessor/
│   │   ├── usuarios/
│   │   └── integracoes/
│   │       └── agents/        # banco-agent.ts, noticias-agent.ts
│   ├── core/                  # infraestrutura: env, db (Drizzle), llm (Anthropic)
│   └── shared/                # utilitários e UI genérica, sem regra de negócio
├── scripts/db/                # seed, preparar, exportar e apagar (comandos db:*)
├── dados/seed/                # dados exportados do banco (JSON por tabela), carregados pelo seed
├── drizzle.config.ts
├── .dependency-cruiser.cjs    # regras de fronteira entre módulos
└── package.json
```

Cada submódulo segue o mesmo padrão:

- `service.ts`: regras de negócio (só no servidor, `import "server-only"`)
- `schema.ts`: DTOs e validação com Zod
- `db.ts`: tabelas Drizzle, prefixadas com o nome do módulo (`cliente_*`)

## Regras dos módulos

1. `src/app` e outros módulos só importam `@/modules/<modulo>` (o `index.ts`), nunca arquivos internos.
2. Cada módulo é dono das suas tabelas; nada de joins entre tabelas de módulos diferentes.
3. `src/core` e `src/shared` não importam nada de `src/modules`.
4. Regras verificadas com `npm run check:modules` (dependency-cruiser).

## Autenticação e permissões (M1)

Cada conta tem **um papel**, em hierarquia: `usuario` < `assessor` < `admin` (cada papel herda o acesso dos anteriores).

| Área | Quem acessa |
|---|---|
| `/cliente` | qualquer usuário logado |
| `/assessor` | `assessor` e `admin` |

Tudo vem de `@/modules/usuarios`:

```ts
// Páginas, layouts e Server Actions: sem login → /login; sem permissão → área do próprio usuário
const usuario = await exigirPapel("assessor");

// Route Handlers: 401 sem login, 403 sem permissão
const acesso = await autorizarApi("assessor");
if (acesso instanceof Response) return acesso;

// Só consultar (pode ser null)
const usuario = await obterUsuarioAtual();
```

- **A UI não é autorização:** esconder um link não protege nada. Toda página, API e Server Action com dados chama `exigirPapel` ou `autorizarApi`.
- Sessão no banco (`usuarios_sessoes`), cookie `hub_sessao` (httpOnly), válida por 7 dias; logout invalida no servidor. Senhas com scrypt.
- `entrar(dados)` e `sair()` só funcionam em Server Action ou Route Handler (escrevem cookie).

**Tela de login:** `/login` (visual do `prototipo.html`). Login só por e-mail (espaços nas pontas e maiúsculas são ignorados). "Sou assessor"/"Sou cliente" escolhem a área de destino; a permissão vem sempre do papel da conta. Quem abre uma página protegida sem login vai para `/login?voltar=<página>` e volta para ela depois de entrar (só caminhos internos).

**Cadastro:** `/cadastro` (etapa 1 do onboarding do protótipo). Cria a conta sempre com papel `usuario` e já entra (vai para `/cliente`). Campos obrigatórios: nome, e-mail, senha (8 a 200 caracteres) e confirmação, data de nascimento (18 anos ou mais), celular com DDD, profissão, estado civil, renda mensal e consentimento LGPD (gravado com data e versão do termo). As etapas 2–4 (anamnese) são do módulo `cliente`.

**Recuperar senha:** `/recuperar-senha` pede o e-mail e sempre responde "se o e-mail estiver cadastrado, enviamos um link" (não revela se a conta existe). Sem serviço de e-mail ainda: **em desenvolvimento o link aparece no terminal do `npm run dev`** (só o link, sem o e-mail). O link (`/redefinir-senha?token=...`) vale 30 minutos, é de uso único e só o último pedido vale. Ao salvar a nova senha (mesma regra do cadastro), todas as sessões da conta são encerradas e a pessoa entra de novo pelo `/login`. Links usam `APP_URL` do `.env`.

**Dados pessoais** ficam em `usuarios_dados_pessoais`, separados da conta. Outros módulos leem por `buscarDadosPessoais(usuarioId)` (retorna `null` para contas sem dados, como as do seed). O `db:exportar` grava o **celular vazio**: nenhum telefone vai para o git.

**Botão de sair**, em qualquer componente:

```tsx
import { sairAction } from "@/app/login/actions";

<form action={sairAction}><button type="submit">Sair</button></form>
```

`src/proxy.ts` só repassa o caminho da requisição (cabeçalho interno `x-hub-caminho`) para o `exigirPapel` montar o `voltar`; não faz autorização.

**Logins da demo** (criados pelo seed; senha = `SENHA_DEMO` do `.env`, ou `demo-hubxp` em desenvolvimento se ela não estiver definida):

| E-mail | Papel |
|---|---|
| `assessor@hubxp.test` | assessor |
| `usuario1@hubxp.test` | usuario |
| `usuario2@hubxp.test` | usuario |

## Dependências

Versões fixadas (`.npmrc` com `save-exact=true`).

| Pacote | Uso |
|---|---|
| `next`, `react`, `react-dom` | framework full-stack (UI, rotas, server actions) |
| `zod` | validação de DTOs e variáveis de ambiente |
| `drizzle-orm`, `@libsql/client` | ORM + SQLite no MVP (fácil trocar por Postgres) |
| `@anthropic-ai/sdk` | LLM dos agents de IA |
| `recharts` | gráficos de patrimônio e métricas |
| `server-only` | impede código de servidor de ir para o browser |

| Dev | Uso |
|---|---|
| `typescript`, `@types/*` | tipagem |
| `eslint`, `eslint-config-next` | lint |
| `tailwindcss`, `@tailwindcss/postcss` | estilos |
| `drizzle-kit` | push do schema e migrations |
| `tsx` | roda os scripts TypeScript de `scripts/` |
| `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `@testing-library/*`, `jsdom` | testes |
| `dependency-cruiser` | fronteiras entre módulos |

## Como rodar

Requer Node.js 22.9+.

```bash
npm install
cp .env.example .env
npm run db:reset       # cria o banco local e popula com dados sintéticos

npm run dev            # http://localhost:3000
npm run check          # typecheck + lint + fronteiras + testes
```

## Banco de dados (desenvolvimento)

SQLite local (`hub.db`, fora do git). A estrutura muda com frequência no hackathon, então usamos `push` (aplica os `db.ts` direto no banco) em vez de migrations.

**O banco se prepara sozinho:** `npm run dev` e `npm start` rodam antes o `db:preparar`, que aplica a estrutura (`db:push`) e, se o banco estiver vazio, roda o seed. Se já houver dados, nada é apagado.

```bash
npm run db:preparar    # push + seed só se o banco estiver vazio (roda sozinho no dev/start)
npm run db:push        # aplica os db.ts no banco (aprova perda de dados automaticamente)
npm run db:seed        # popula: dados exportados + geradores sintéticos (semente 42)
npm run db:seed -- 7   # popula com outra semente
npm run db:reset       # apaga o banco, aplica o schema e roda o seed
npm run db:exportar    # grava o banco atual em dados/seed/ para compartilhar via git
npm run db:studio      # navega pelos dados no navegador
npm run db:generate    # gera migrations a partir dos db.ts (quando o schema estabilizar)
npm run db:migrate     # aplica migrations
```

Mudou um `db.ts`? Rode `npm run db:reset`.

**Testes com banco:** use SQLite em memória (`DATABASE_URL=:memory:`) e aplique a estrutura real com `pushSQLiteSchema` do `drizzle-kit/api`. Exemplo em `src/modules/usuarios/auth/service.test.ts` (inclui como simular cookies e `redirect` do Next).

### Dados do seed: exportados + sintéticos

O seed tem duas fontes. Para cada módulo, na ordem `usuarios` → `cliente` → `assessor` → `integracoes`:

1. **Dados exportados** (`dados/seed/<tabela>.json`, no git): se existir arquivo de alguma tabela do módulo, o seed carrega esses arquivos. O exportado vence.
2. **Gerador sintético** (`src/modules/<modulo>/seed.ts`, função `semear<Modulo>`): usado quando o módulo não tem nada exportado.

**Compartilhar dados criados usando a app:**

```bash
npm run db:exportar    # grava dados/seed/*.json (retrato completo do banco)
git add dados/seed && git commit -m "Atualiza dados do seed"
# colegas: git pull && npm run db:reset
```

- Um registro por linha e ordenado pelo id, para reduzir conflitos de merge.
- As tabelas `usuarios_sessoes` e `usuarios_recuperacoes_senha` nunca são exportadas, e o celular de `usuarios_dados_pessoais` vai vazio.
- **LGPD:** a exportação é recusada se alguma coluna de e-mail tiver domínio diferente de `.test` (reservado, nunca real). Só dados fictícios no git.

**Escrevendo o `seed.ts` de um módulo:**

- Use o `aleatorio` recebido (de `@/shared/aleatorio`) e nunca `Math.random`: com a mesma semente, todos da equipe têm exatamente o mesmo banco. Para ids, `aleatorio.uuid()`.
- Se precisar de dados de outro módulo (ex.: ids de usuários), **leia do banco** pelas funções públicas daquele módulo; não recalcule, porque ele pode ter sido carregado dos dados exportados.
- O `seed.ts` não é exportado pelo `index.ts`: os scripts em `scripts/db/` importam `@/modules/<modulo>/seed` direto, porque o `index.ts` pode carregar código do Next, que não roda fora do servidor. Em `src/`, ninguém importa `seed.ts` de outro módulo.
- O seed assume tabelas vazias; para recomeçar, use `db:reset`.
