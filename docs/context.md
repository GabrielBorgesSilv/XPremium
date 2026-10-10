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
- **Agenda**: reuniões entre assessor e cliente vinculados, marcadas por qualquer um dos dois e aceitas por quem foi convidado.

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

### Produto e marca

| Data | Decisão | Substitui |
|---|---|---|
| 10/10/2026 | Slogan: **"Estratégias exclusivas, resultados de alto nível."** | "Seu patrimônio. Suas escolhas." (protótipo de UI) |

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

### Autenticação e permissões (M1)

| Data | Decisão | Alternativas descartadas | Motivo |
|---|---|---|---|
| 10/10/2026 | Autenticação própria (Next + SQLite), sem provedor externo | Supabase Auth | Decorre da escolha do SQLite; sem dependência externa nem conta compartilhada. |
| 10/10/2026 | Um papel por conta, hierárquico: `usuario` < `assessor` < `admin` | Vários papéis por conta; flag de assessor | "Role geral" pedida pelo produto; hierarquia simples de checar. |
| 10/10/2026 | `/cliente` para qualquer usuário logado; `/assessor` para `assessor`+ | Perfis exclusivos (cliente não-assessor) | A área de usuário aparece para todos; a de assessor, por permissão. |
| 10/10/2026 | Sem permissão: página redireciona para a área do usuário; API responde 403. Sem login: `/login` e 401 | Página de acesso negado | Fluxo mais simples; `forbidden()` do Next 16 ainda é experimental. |
| 10/10/2026 | Sessão no banco (`usuarios_sessoes`), cookie com token aleatório e só o hash SHA-256 no banco | Cookie criptografado sem tabela (stateless) | Logout invalida de verdade (cookie copiado deixa de valer); sem dependência nova. |
| 10/10/2026 | Sessão válida por 7 dias | 8 horas; até fechar o navegador | Ninguém precisa relogar durante o hackathon; padrão do guia do Next. |
| 10/10/2026 | Senha com scrypt (`node:crypto`) | bcrypt/argon2 (dependência nova) | Seguro e nativo do Node. |
| 10/10/2026 | Seed: 1 assessor + 2 usuários (`@hubxp.test`), senha em `SENHA_DEMO`, ids determinísticos; sem admin por ora | Senha fixa no README; criar admin | Dois usuários permitem testar que um não vê o outro; senha trocável se a app for publicada. |
| 10/10/2026 | Branch `feature/m1-contrato-auth` só com o contrato; tela de login na `feature/m1-login` | Contrato + tela juntos | PR menor; a equipe já programa contra a interface. |
| 10/10/2026 | Tela de login em `/login`, com o visual do `prototipo.html` num CSS module próprio | Formulário na home `/` | Não altera a home nem o `globals.css` do protótipo de UI (outra pessoa). |
| 10/10/2026 | "Sou assessor"/"Sou cliente" escolhem só a área de destino; "Sou assessor" sem o papel entra e vai para `/cliente` com aviso | Remover os botões | Mantém o protótipo; a permissão continua vindo só da conta. |
| 10/10/2026 | Login só por e-mail; sem CPF | "E-mail ou CPF" do protótipo; CPF opcional | Inicialmente pedido CPF, depois retirado: CPF gerado no seed pode coincidir com um real (LGPD). |
| 10/10/2026 | E-mail ignora espaços nas pontas e maiúsculas | Recusar e-mail com espaços | Autocompletar do celular costuma incluir espaço. |
| 10/10/2026 | Falha de login com mensagem genérica ("E-mail ou senha inválidos.") | Mensagens específicas | Não revela quais e-mails têm conta. |
| 10/10/2026 | Já logado em `/login` → vai para a própria área | Mostrar o formulário | Para trocar de conta, sai primeiro. |
| 10/10/2026 | Depois do login, volta para a página protegida pedida (`?voltar=`, só caminhos internos); se houver `voltar`, ele vence a área escolhida | Sempre ir para a área escolhida | Quem clicou num link volta para onde queria; caminhos externos são recusados. |
| 10/10/2026 | `src/proxy.ts` repassa o caminho pedido num cabeçalho interno para o `exigirPapel` | Parâmetro no `exigirPapel` | Ninguém da equipe precisa passar o caminho; layouts não conhecem a subpágina. |
| 10/10/2026 | Logout como Server Action (`sairAction`); botão no `WorkspaceShell` fica para a branch de menus, combinando com o dono do protótipo | Botão agora | O frontend de sair não existe e o shell é de outra pessoa. |
| 10/10/2026 | Cadastro (só a conta: etapa 1) e "Esqueci minha senha" (link no console em dev) em branches próprias: `feature/m1-cadastro`, `feature/m1-recuperar-senha` | Tudo na `feature/m1-login`; 4 etapas do cadastro | Etapas 2–4 são a anamnese (módulo cliente); PRs menores. |
| 10/10/2026 | E-mail inexistente também roda o scrypt (contra um hash fictício) | Responder direto | Mesmo tempo de resposta nos dois casos; medido: 31 ms de mediana em ambos. |
| 10/10/2026 | Senha com no máximo 200 caracteres | Sem limite | Evita gastar o scrypt com senhas enormes. |
| 10/10/2026 | Novo login encerra a sessão anterior do navegador e apaga sessões expiradas | Manter até expirar | Banco não acumula sessões mortas. |
| 10/10/2026 | O formulário mantém o e-mail digitado após erro | — | O React 19 limpa o formulário a cada envio. |
| 10/10/2026 | Sem `SENHA_DEMO` no `.env`, o seed usa `demo-hubxp` em desenvolvimento (com aviso); com `NODE_ENV=production` é obrigatória | Sempre exigir | `.env` antigos da equipe não travam o `npm run dev`. |
| 10/10/2026 | Seed de usuários estável: `criado_em` fixo e sal da senha vindo do gerador com semente | Sal aleatório | `db:exportar` não gera diferença em todos os usuários a cada reset. |
| 10/10/2026 | Testes automáticos de sessão e seed com SQLite em memória (`pushSQLiteSchema` com os `db.ts` reais) | Só testes manuais | Regressões aparecem no `npm run check`. |
| 10/10/2026 | Cadastro (`/cadastro`) com conta + dados pessoais da etapa 1 do protótipo, sem CPF; conta sempre com papel `usuario`; etapas 2–4 (anamnese) ficam com o módulo `cliente` | Só os campos da conta; as 4 etapas | Fiel ao protótipo na etapa 1 sem invadir a anamnese (M3). |
| 10/10/2026 | Dados pessoais em `usuarios_dados_pessoais` (1 por conta), lidos por `buscarDadosPessoais` | Colunas na conta; módulo `cliente` | Separa credenciais de dados pessoais; tudo no M1. Avisar o dono do M3. |
| 10/10/2026 | Todos os campos do cadastro obrigatórios | Pessoais opcionais | Decisão de produto. |
| 10/10/2026 | Senha do cadastro: 8 a 200 caracteres, com confirmação | Exigir letra e número; 12+ | Tamanho importa mais que símbolos; menos atrito. |
| 10/10/2026 | Nascimento: 18 anos ou mais; recusa datas futuras, impossíveis ou acima de 130 anos | Não validar idade | Conta de investimento para menor exige responsável legal. |
| 10/10/2026 | Nome no cadastro: pelo menos nome e sobrenome (duas palavras), até 120 caracteres | Mínimo de 2 caracteres | "Nome completo" identifica a pessoa numa conta de investimento; nomes curtos como "Ana Li" seguem aceitos. |
| 10/10/2026 | Estado civil: Solteiro(a), Casado(a), União estável, Separado(a), Divorciado(a), Viúvo(a) | Só as 4 opções do protótipo | O protótipo não tinha viúvo nem separado. |
| 10/10/2026 | Celular brasileiro: DDD (sem zero) + 9 + 8 dígitos; guarda só dígitos | — | Formato do protótipo "(11) 90000-0000". |
| 10/10/2026 | E-mail já cadastrado: avisa "E-mail já cadastrado" com links para entrar ou recuperar a senha | Mensagem genérica | Sem serviço de e-mail não há outra forma de avisar; aceito no MVP (revela que o e-mail tem conta). |
| 10/10/2026 | Após o cadastro, já entra e vai para `/cliente` | Voltar ao `/login` | Menos atrito. |
| 10/10/2026 | Consentimento LGPD obrigatório, gravado com data e versão do termo (`2026-10-10`) | Só exigir o checkbox | Evidência do que foi aceito se o texto mudar. |
| 10/10/2026 | Seed sem dados pessoais; `db:exportar` grava o celular vazio | Recusar exportação; não exportar dados pessoais | Celular gerado pode ser de pessoa real; contas criadas na app continuam exportáveis. |
| 10/10/2026 | Visual do cadastro: formulário do onboarding do protótipo, só a etapa 1, sem a barra de 4 etapas | Barra de etapas; layout do login | Etapas 2–4 ainda não existem. |
| 10/10/2026 | Recuperar senha: link de uso único, válido por 30 min, só o hash do token no banco; resposta sempre igual exista ou não a conta | Enviar e-mail real; pedir ajuda à assessoria | Sem serviço de e-mail; o fluxo não muda quando o envio real entrar. |
| 10/10/2026 | Em desenvolvimento o link aparece no terminal, só o link (sem e-mail); em produção não aparece | Link + e-mail no log | CLAUDE.md proíbe dados pessoais em logs. |
| 10/10/2026 | Novo pedido invalida os links anteriores | Vários links válidos | Evita links circulando. |
| 10/10/2026 | Ao redefinir, encerra todas as sessões da conta e vai para `/login` ("Senha alterada") | Já entrar; manter sessões | Quem estava logado com a senha antiga (inclusive acesso indevido) sai. |
| 10/10/2026 | Telas de recuperar/redefinir no layout do login | Layout do cadastro | O protótipo não tem essas telas. |
| 10/10/2026 | Links montados com `APP_URL` do `.env` (padrão `http://localhost:3000`), nunca com o Host da requisição; página do link com `referrer: no-referrer` | Usar o Host da requisição | Host pode ser forjado (links falsos quando houver e-mail); o token na URL não vaza por Referer. Escolha técnica do Claude, a confirmar. |
| 10/10/2026 | Regra de senha nova única (`SenhaNovaSchema`) para cadastro e redefinição | — | Mesma regra nos dois fluxos. |
| 10/10/2026 | Sem limite de tentativas de login no MVP | 5 tentativas / 15 min | Banco local e demo; scrypt já torna cada tentativa lenta. Pendência para produção. |

### Arquitetura

| Data | Decisão | Alternativas descartadas | Motivo |
|---|---|---|---|
| 10/10/2026 | `src/features/dashboard/` (M2, PR #9) aceito como exceção ao monolito modular durante o hackathon, com regras no dependency-cruiser: só importa módulos pelo `index.ts`; `modules`, `core` e `shared` não importam `features` | Mover já para `src/modules/assessor/`; adotar `src/features` como padrão do projeto | Código autocontido (não importa nada de fora); mover 42 arquivos agora custaria tempo perto da entrega (17h30). As regras cobrem o risco de fronteira sem trabalho para a autora. |
| 10/10/2026 | Services de `src/features` com chave ou segredo devem usar `import "server-only"` | — | Evita levar código de servidor (e chaves) para o navegador. |

### Vínculo, carteiras e agenda (M4)

| Data | Decisão | Alternativas descartadas | Motivo |
|---|---|---|---|
| 10/10/2026 | Vínculo assessor ↔ cliente na tabela `assessor_vinculos` (um assessor por cliente), com ids das contas do M1 | Vínculo de demonstração no código | Agenda e telas do assessor precisam saber "meus clientes" / "meu assessor" a partir do login real. |
| 10/10/2026 | Posições das carteiras no banco (`assessor_posicoes`); ativos, cotações e notícias continuam de demonstração no código | Carteiras fixas no código com ids inventados | Os ids das contas só existem depois do seed do M1; o seed do assessor entrega as 4 carteiras-modelo aos clientes de demo em ordem de e-mail. |
| 10/10/2026 | Seed do M1 com `usuario3` e `usuario4` (4 clientes de demo) | Usar só 2 clientes | Mantém os casos da demo do M4 (FGC acima e perto, cripto, carteira concentrada). |
| 10/10/2026 | `scripts/db/comum.ts` passa às funções de seed um contexto com as contas já gravadas (id, e-mail, papel) | Seed de um módulo importar o de outro; função pública nova no M1 | O seed não pode importar o `index.ts` (código do Next) nem o interior de outro módulo; o script já pode ler o banco. |
| 10/10/2026 | Agenda de reuniões assessor ↔ cliente (módulo `agenda`): qualquer um dos dois convida; quem convidou não aceita, quem foi convidado aceita ou recusa | Só o assessor marca; aceite dos dois lados | Decisão de produto. **Amplia o escopo do calendário (M6)**, que o documento de escopo mantinha mínimo e sem compartilhamento até validação: avisar o dono do M6. |
| 10/10/2026 | Motivo obrigatório (categoria + descrição de 10 a 500 caracteres); online ou presencial, com local obrigatório no presencial; durações de 30, 45, 60, 90 ou 120 min; horário de Brasília | Motivo em texto livre opcional | Decisão de produto: explicar o motivo da reunião. |
| 10/10/2026 | Conflito de horário bloqueado: reunião pendente ou confirmada ocupa o horário do assessor e do cliente; checado ao criar e ao aceitar | Só avisar; ignorar | Evita duas reuniões no mesmo horário para a mesma pessoa. |
| 10/10/2026 | Pendente: só quem convidou cancela (o convidado recusa). Confirmada: qualquer participante cancela. Motivo de recusa/cancelamento opcional | Cancelamento só por quem convidou | Imprevistos acontecem dos dois lados depois de confirmada. |
| 10/10/2026 | Visualização em calendário mensal, com convites pendentes em destaque | Lista por dia; calendário semanal | Decisão de produto. |
| 10/10/2026 | Seed da agenda com datas relativas ao dia do seed | Datas fixas | Com datas fixas, os convites de demo virariam passado e não poderiam ser aceitos na apresentação. |

### Processo

| Data | Decisão | Motivo |
|---|---|---|
| 10/10/2026 | Branches `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`, `hotfix/` a partir de `develop`, integradas por PR | Fluxo comum da equipe no GitHub. |
| 10/10/2026 | Node mínimo 22.9 | Scripts usam `--env-file-if-exists`; Node 20 fora de suporte. |

## Questões em aberto

- Agenda: notificação de convite (hoje só aparece ao abrir a agenda), reagendar sem cancelar e criar de novo, link de videochamada para reunião online, e como fica com o calendário do M6.
- Vínculo assessor ↔ cliente: quem cria o vínculo para contas novas do cadastro (hoje só o seed vincula).

- Limite de tentativas de login e de pedidos de recuperação de senha (sem limite no MVP).
- Serviço de envio de e-mail (hoje o link de redefinição só aparece no terminal em desenvolvimento).
- Depois da demo: mover `src/features/dashboard` para `src/modules` (nomes em kebab-case/português) e unificar os tipos de ativo/cotação do M2 (`Category`, `Period`, `DataOrigin`, `Money`, `QuotePoint`) com os do M4 (`Categoria`, `Periodo`, `OrigemDado`, `Moeda`, `Cotacao`).
- Onde hospedar a demo (SQLite não roda em hospedagem serverless) e se haverá banco de produção.
- Provedor de Open Finance (agregador vs. integração direta) e escopo de dados no MVP.
- Qual(is) API(s) de notícias e LLM usar nos agents.
- Critérios do benchmark de prospecção (quais atributos comparar).
- Quais métricas do assessor entram no MVP.
- Consentimento e LGPD: como o cliente autoriza o compartilhamento de dados com o assessor.
- Escopo do MVP para o hackathon (o que é real vs. mockado).
