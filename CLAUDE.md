# CLAUDE.md

Hub XP: produto que conecta **cliente** (anamnese + Open Finance para consolidar investimentos) e **assessor** (gestão de clientes, ativos, métricas e prospecção), com agents de IA para dados bancários e notícias. Contexto completo em `docs/context.md`; visão técnica em `README.md`.

## Git e branches (OBRIGATÓRIO)

Fluxo no GitHub, usado por toda a equipe: cada funcionalidade ou correção tem sua própria branch, criada a partir de `develop` e integrada de volta em `develop` por Pull Request para os testes da equipe. `main` recebe só o que já foi validado em `develop`.

- Prefixos de branch (kebab-case, a partir de `develop` atualizada):
  - `feature/<nome>`: nova funcionalidade (ex.: `feature/m1-login`).
  - `fix/<nome>`: correção de bug.
  - `refactor/<nome>`: mudança de código sem alterar comportamento.
  - `docs/<nome>`: só documentação.
  - `chore/<nome>`: configuração, dependências, build, CI.
  - `test/<nome>`: só testes.
  - `hotfix/<nome>`: correção urgente que precisa ir para `main` (sai de `main`, volta para `main` e `develop`; segue a dupla confirmação abaixo).
- Para começar: `git switch develop && git pull` e então `git switch -c feature/<nome>`.
- **Nunca** faça commit direto em `main`/`master`, e evite commit direto em `develop`: trabalhe na branch da funcionalidade.
- Antes de commitar, verifique a branch atual com `git branch --show-current`. Se estiver em `main`/`master` ou `develop`, crie/mude para a branch da funcionalidade antes.
- Integração: abra PR da branch → `develop` com `npm run check` passando. Antes do PR, traga as novidades de `develop` (`git merge develop`) e resolva conflitos na própria branch.
- Branch já enviada ao GitHub: não reescreva histórico (rebase/`--force`) sem pedir ao usuário.
- Mensagens de commit em português, no imperativo e curtas (ex.: "Adiciona login por perfil").
- Subir algo para `main`/`master` (merge, push, PR com merge, rebase, cherry-pick ou reset) exige **dupla confirmação** do usuário:
  1. Pergunte uma vez, mostrando o que vai entrar (commits e diff resumido de `develop` → `main`).
  2. Depois do "sim", peça uma **segunda confirmação explícita** antes de executar o comando.
  - Sem as duas confirmações, não execute. Uma aprovação anterior não vale para uma nova subida.
- Nunca use `--force` em `main`/`master`.
- Commits e PRs só quando o usuário pedir.
- Decisões tomadas: registre em `docs/context.md` (seção "Decisões"), com data, alternativas e motivo.

## Arquitetura: monolito modular (Next.js full-stack)

- Stack: Next.js (App Router) + TypeScript + React, Drizzle + SQLite, Zod, Tailwind, Anthropic SDK para os agents.
- `src/app/`: rotas de UI e API. Camada fina: valida a entrada e chama o módulo; sem regra de negócio.
- `src/modules/`: módulos de negócio.
  - primordiais: `cliente`, `assessor`
  - suporte: `usuarios`, `integracoes` (inclui `agents/`)
- `src/app` e outros módulos **só** importam `@/modules/<modulo>` (o `index.ts`). Nunca importe `service.ts`, `db.ts` ou `schema.ts` de outro módulo.
- Cada módulo é dono das suas tabelas (prefixo `<modulo>_`); não faça joins entre tabelas de módulos diferentes.
- `src/core/` é só infraestrutura (env, db, llm); `src/shared/` não tem regra de negócio. Nenhum dos dois importa `src/modules`.
- **Exceção (hackathon):** `src/features/dashboard/` (M2, dashboard de mercado) fica fora de `src/modules`. Regras: só importa módulos pelo `index.ts`; `src/modules`, `src/core` e `src/shared` não importam `src/features` (verificado pelo `check:modules`); services com chave ou segredo usam `import "server-only"`. **Código novo continua em `src/modules/`**; não crie outras features. Mudança de pasta e unificação dos tipos de ativo/cotação com `assessor/ativos` (M4) ficam para depois da demo.
- Submódulos seguem o padrão `service.ts` (regra de negócio, com `import "server-only"`), `schema.ts` (Zod) e `db.ts` (tabelas Drizzle).
- Novo submódulo: crie a pasta com esses arquivos e exporte o que for público no `index.ts` do módulo.
- Banco de desenvolvimento: SQLite local, preparado sozinho no `npm run dev`/`start` (`db:preparar`). Mudou um `db.ts`, rode `npm run db:reset`; não crie migrations durante o hackathon.
- Seed = dados exportados (`dados/seed/<tabela>.json`, via `npm run db:exportar`) + geradores sintéticos (`src/modules/<modulo>/seed.ts`, `semear<Modulo>`). O exportado vence por módulo.
- `seed.ts` é a única exceção à interface pública: só `scripts/db/` o importa direto (`@/modules/<modulo>/seed`); ele não entra no `index.ts` e não pode importar código do Next. Use o `Aleatorio` recebido (`@/shared/aleatorio`), nunca `Math.random`; dados de outro módulo, leia do banco.
- LGPD: só dados fictícios no seed; e-mails sempre no domínio `.test` (o `db:exportar` recusa outros).
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

Testes verificam o código contra as regras de negócio estabelecidas; o código segue a regra, não o teste.

- **Nunca** altere o código nem a regra de negócio só para um teste passar, a menos que o usuário peça.
- Teste falhou? Investigue a causa:
  - erro no próprio teste ou no ambiente (comando, dados, busca de texto): corrija o teste e diga isso;
  - o código viola a regra: corrija o código para cumprir a regra;
  - a regra parece errada ou ambígua: pare e pergunte ao usuário.
- Sempre relate o que falhou e o que foi mudado.

## Documentação

- Decisões de produto e questões em aberto: atualize `docs/context.md`.
- Mudanças de estrutura, comandos ou stack: atualize `README.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
