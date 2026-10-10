# CLAUDE.md

Hub XP: produto que conecta **cliente** (anamnese + Open Finance para consolidar investimentos) e **assessor** (gestão de clientes, ativos, métricas e prospecção), com agents de IA para dados bancários e notícias. Contexto completo em `docs/context.md`; visão técnica em `README.md`.

## Git e branches (OBRIGATÓRIO)

- **Nunca** faça commit direto em `main`/`master`. Todo commit vai para `develop` (ou para uma branch criada a partir de `develop`).
- Antes de commitar, verifique a branch atual com `git branch --show-current`. Se estiver em `main`/`master`, mude para `develop` antes (`git switch develop`).
- Subir algo para `main`/`master` (merge, push, PR com merge, rebase, cherry-pick ou reset) exige **dupla confirmação** do usuário:
  1. Pergunte uma vez, mostrando o que vai entrar (commits e diff resumido de `develop` → `main`).
  2. Depois do "sim", peça uma **segunda confirmação explícita** antes de executar o comando.
  - Sem as duas confirmações, não execute. Uma aprovação anterior não vale para uma nova subida.
- Nunca use `--force` em `main`/`master`.
- Commits e PRs só quando o usuário pedir.

## Arquitetura: monolito modular (Next.js full-stack)

- Stack: Next.js (App Router) + TypeScript + React, Drizzle + SQLite, Zod, Tailwind, Anthropic SDK para os agents.
- `src/app/`: rotas de UI e API. Camada fina: valida a entrada e chama o módulo; sem regra de negócio.
- `src/modules/`: módulos de negócio.
  - primordiais: `cliente`, `assessor`
  - suporte: `usuarios`, `integracoes` (inclui `agents/`)
- `src/app` e outros módulos **só** importam `@/modules/<modulo>` (o `index.ts`). Nunca importe `service.ts`, `db.ts` ou `schema.ts` de outro módulo.
- Cada módulo é dono das suas tabelas (prefixo `<modulo>_`); não faça joins entre tabelas de módulos diferentes.
- `src/core/` é só infraestrutura (env, db, llm); `src/shared/` não tem regra de negócio. Nenhum dos dois importa `src/modules`.
- Submódulos seguem o padrão `service.ts` (regra de negócio, com `import "server-only"`), `schema.ts` (Zod) e `db.ts` (tabelas Drizzle).
- Novo submódulo: crie a pasta com esses arquivos e exporte o que for público no `index.ts` do módulo.
- Prefira Server Components e Server Actions; use `"use client"` só quando precisar de interatividade.

## Código

- Nomes de domínio em português (`cliente`, `assessor`, `anamnese`, `patrimonio`); arquivos e pastas em kebab-case.
- TypeScript estrito: sem `any`; valide entradas externas (formulários, APIs, respostas de LLM) com Zod.
- Dependências: versões exatas (sem `^`/`~`). Antes de adicionar uma nova, verifique se uma já existente resolve.
- Segredos e chaves de API ficam no `.env` (nunca commitado); novas variáveis vão também no `.env.example` e em `src/core/env.ts`.
- Dados de clientes são sensíveis (LGPD): não registre dados pessoais ou financeiros em logs e não use dados reais em testes ou fixtures.

## Verificação

Antes de considerar uma tarefa concluída, rode:

```bash
npm run check   # typecheck + lint + fronteiras entre módulos + testes
```

Se algum passo falhar, reporte a falha; não diga que a tarefa está concluída.

## Documentação

- Decisões de produto e questões em aberto: atualize `docs/context.md`.
- Mudanças de estrutura, comandos ou stack: atualize `README.md`.
