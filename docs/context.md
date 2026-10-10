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

## Questões em aberto

- Banco: decidido SQLite/Drizzle no MVP (10/10/2026), com dados sintéticos gerados por seed e estrutura alterada via `db:push`; Supabase/Postgres descartado por ora. Em aberto: onde hospedar a demo (SQLite não roda em hospedagem serverless) e se haverá banco de produção.
- Provedor de Open Finance (agregador vs. integração direta) e escopo de dados no MVP.
- Qual(is) API(s) de notícias e LLM usar nos agents.
- Critérios do benchmark de prospecção (quais atributos comparar).
- Quais métricas do assessor entram no MVP.
- Consentimento e LGPD: como o cliente autoriza o compartilhamento de dados com o assessor.
- Escopo do MVP para o hackathon (o que é real vs. mockado).
