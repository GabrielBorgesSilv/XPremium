# Contexto do Projeto — Hub XP

## Visão geral

Hub centralizado para a XP que conecta **cliente** e **assessor** de investimentos em um único produto.

- **Cliente**: principal benefício é **administrar seus investimentos** em um só lugar, consolidando ativos de diferentes instituições.
- **Assessor**: principal benefício é **gerenciar e se relacionar com seus clientes**, com dados e insights para embasar recomendações.

## Arquitetura

**Modular monolith**: uma única aplicação/deploy, dividida em módulos com fronteiras bem definidas (cada módulo é dono dos seus dados e expõe uma interface pública; módulos não acessam o interior uns dos outros).

### Módulos primordiais

| Módulo | Público | Responsabilidade |
|---|---|---|
| `cliente` | Investidor | Anamnese, consolidação de ativos via Open Finance, visão do próprio patrimônio |
| `assessor` | Assessor XP | Gestão da carteira de clientes, métricas, prospecção e insights |

### Módulos de suporte (compartilhados)

- **Usuários / identidade**: autenticação, perfis (cliente, assessor) e permissões. O assessor tem acesso a todos os módulos de usuário.
- **Integrações / agents**: ingestão de dados externos (bancos via Open Finance, notícias via API), consumidos pelos dois módulos primordiais.

## Funcionalidades

### Módulo Cliente

- **Anamnese**: questionário de perfil do investidor (objetivos, horizonte, tolerância a risco, situação financeira).
- **Open Banking / Open Finance**: conexão com outras instituições para importar contas, ativos e investimentos.
- **Consolidação de patrimônio**: visão única de todos os ativos e investimentos, inclusive fora da XP.

### Módulo Assessor

- **Módulos de usuário**: acesso às funcionalidades de gestão de usuários.
- **Meus clientes**: lista e detalhe dos clientes, com perfil (anamnese) e carteira consolidada.
- **Meus ativos**: visão dos ativos sob gestão do assessor.
- **Métricas**: indicadores de desempenho da carteira e do relacionamento com clientes.
- **Prospecção com benchmark de cliente**: identificar potenciais clientes comparando-os com perfis de clientes existentes (benchmark).

## Agents de IA

Agents responsáveis por alimentar o hub com dados externos:

1. **Agent de dados bancários**: importa e normaliza informações das instituições que o cliente utiliza (via Open Finance).
2. **Agent de notícias**: consome APIs de notícias externas e relaciona eventos de mercado aos ativos/clientes, para **embasar decisões e recomendações do assessor**.

## Fluxo principal (alto nível)

```
Cliente ──anamnese──▶ módulo cliente ──▶ perfil do investidor
Cliente ──consente Open Finance──▶ agent bancário ──▶ patrimônio consolidado
APIs de notícias ──▶ agent de notícias ──▶ insights
Perfil + patrimônio + insights ──▶ módulo assessor ──▶ gestão, métricas e prospecção
```

## Decisões

Registro das decisões tomadas, com data, alternativas consideradas e motivo.

### Banco de dados

| Data | Decisão | Alternativas descartadas | Motivo |
|---|---|---|---|
| 10/10/2026 | SQLite local com Drizzle no MVP | Supabase (Postgres + Auth); H2 | Banco gerado sinteticamente e estrutura instável: SQLite é embutido, fácil de apagar e recriar. H2 é do ecossistema Java e não tem driver para Node. |
| 10/10/2026 | Estrutura aplicada com `drizzle-kit push`, sem migrations no hackathon | Migrations a cada mudança | Estrutura muda o tempo todo; `db:reset` recria tudo. |
| 10/10/2026 | Banco criado e populado ao subir a app (`predev`/`prestart` → `db:preparar`) | Preparar dentro do Next (`instrumentation.ts`) | Dentro do Next exigiria migrations ou API instável do drizzle-kit. |
| 10/10/2026 | Dados criados usando a app viram seed por comando manual (`db:exportar`) e commit | Exportar a cada alteração; exportar ao parar o servidor | Controle do que vai para o git; evita conflitos constantes entre 6 pessoas e lixo de testes. |
| 10/10/2026 | Exportado vence por módulo; gerador sintético completa o que não foi exportado | Gerador primeiro e exportado soma | Evita ids/e-mails duplicados. |
| 10/10/2026 | `db:exportar` recusa e-mails fora do domínio `.test` | Só avisar no README | LGPD: impede que um e-mail real cadastrado em teste vá para o GitHub. |
| 10/10/2026 | Geradores com semente fixa (`@/shared/aleatorio`, inclusive `uuid()`) | `Math.random` / UUID aleatório | Todos da equipe têm o mesmo banco e os mesmos ids. |
| 10/10/2026 | `seed.ts` importado direto pelos scripts, fora do `index.ts` | Import dinâmico do Next nos services | O `index.ts` carrega código do Next, que quebra fora do servidor; import dinâmico seria armadilha para a equipe. |

### Arquitetura

| Data | Decisão | Alternativas descartadas | Motivo |
|---|---|---|---|
| 10/10/2026 | `src/features/dashboard/` (M2, PR #9) aceito como exceção ao monolito modular durante o hackathon, com regras no dependency-cruiser: só importa módulos pelo `index.ts`; `modules`, `core` e `shared` não importam `features` | Mover já para `src/modules/assessor/`; adotar `src/features` como padrão do projeto | Código autocontido (não importa nada de fora); mover 42 arquivos agora custaria tempo perto da entrega (17h30). As regras cobrem o risco de fronteira sem trabalho para a autora. |
| 10/10/2026 | Services de `src/features` com chave ou segredo devem usar `import "server-only"` | — | Evita levar código de servidor (e chaves) para o navegador. |

### Processo

| Data | Decisão | Motivo |
|---|---|---|
| 10/10/2026 | Branches `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`, `hotfix/` a partir de `develop`, integradas por PR | Fluxo comum da equipe no GitHub. |
| 10/10/2026 | Node mínimo 22.9 | Scripts usam `--env-file-if-exists`; Node 20 fora de suporte. |

## Questões em aberto

- Depois da demo: mover `src/features/dashboard` para `src/modules` (nomes em kebab-case/português) e unificar os tipos de ativo/cotação do M2 (`Category`, `Period`, `DataOrigin`, `Money`, `QuotePoint`) com os do M4 (`Categoria`, `Periodo`, `OrigemDado`, `Moeda`, `Cotacao`).
- Onde hospedar a demo (SQLite não roda em hospedagem serverless) e se haverá banco de produção.
- Provedor de Open Finance (agregador vs. integração direta) e escopo de dados no MVP.
- Qual(is) API(s) de notícias e LLM usar nos agents.
- Critérios do benchmark de prospecção (quais atributos comparar).
- Quais métricas do assessor entram no MVP.
- Consentimento e LGPD: como o cliente autoriza o compartilhamento de dados com o assessor.
- Escopo do MVP para o hackathon (o que é real vs. mockado).
