# RotaXP | Escopo do Projeto

_Hackathon “O Assessor de Investimentos do Futuro”  •  Documento de divisão por 6 responsáveis_

Versão 1.0 • 10/10/2026 • Status: planejamento para validação da equipe

## 1. Objetivo e premissas

Construir um MVP demonstrável de plataforma financeira com dois perfis (assessor e cliente), apoiando a leitura do mercado, o entendimento da carteira, o relacionamento e a visualização de cenários. O documento consolida as decisões discutidas até a especificação do Dashboard v1.9 e propõe a distribuição do trabalho entre seis integrantes. Os módulos além do Dashboard ainda carecem de detalhamento funcional; os recortes abaixo são propostas de MVP, não requisitos já aprovados.

| Restrição | Regra de planejamento |
|---|---|
| Equipe | 6 participantes; cada um lidera 1 módulo e responde pela integração dele |
| Hackathon | 08h–18h; código desenvolvido durante o evento |
| Repositório | Pronto para clonagem às 17h30 |
| Pitch | Até 5 minutos, com aplicação funcionando |
| Stack aprovada | Next.js + TypeScript, backend integrado; Supabase PostgreSQL + Auth |
| IA | API da OpenAI como candidata preferencial, não provedor definitivamente contratado |

## 2. Escopo funcional e distribuição de módulos

| Dono | Módulo independente | Resultado demonstrável |
|---|---|---|
| M1 | Fundação, login e permissões | Entrar como assessor ou cliente; rotas protegidas; navegação entre áreas |
| M2 | Dashboard do assessor — mercado e rankings | Panorama Brasil/Internacional, filtros e rankings ou renda fixa; estados real/simulado |
| M3 | Clientes e perfil patrimonial | Assessor vê clientes vinculados e perfil individual; cliente acessa o próprio perfil |
| M4 | Investimentos e cenários do cliente | Investimentos atuais e possibilidades de simulação claramente hipotéticas |
| M5 | Notícias e IA | Três notícias selecionadas e resumos simples com fonte; fallback sem alucinações |
| M6 | Calendário, integração, QA e entrega | Calendário mínimo, smoke tests, deploy, README e roteiro de demonstração |

Responsáveis = papéis numerados, não atribuição nominal. A liderança por módulo não elimina revisão cruzada nem apoio entre integrantes.

## 3. Escopo por módulo — entregáveis e limites

### M1 — Fundação, login e permissões

Responsável: Pessoa 1 — plataforma / autenticação

- Configurar Next.js/TypeScript, convenções, layout base e menus por perfil.
- Integrar Supabase Auth, perfis ASSESSOR e CLIENTE e proteção server-side de rotas/APIs.
- Fornecer ambiente de desenvolvimento, .env.example e fixtures de usuários fictícios.

Aceite mínimo: Login demonstrável com redirecionamento correto; cliente não acessa endpoint restrito ao assessor (403); logout funcional.

Dependências / não assumir: Não implementar permissões por cliente sem definição de vínculo e sem teste de segregação. A UI não é mecanismo de autorização.

### M2 — Dashboard do assessor: mercado e rankings

Responsável: Pessoa 2 — dados de mercado / frontend

- Panorama brasileiro e internacional; seletores de região BR/Internacional e período 1D/7D/30D.
- Rankings até 10 altas e 10 baixas entre ativos elegíveis de ações, FIIs/REITs, ETFs e cripto; preços na moeda original e variações na moeda de cotação.
- Painel específico de renda fixa para títulos públicos brasileiros e referências soberanas internacionais; sem ranking genérico.
- Integrar GET /api/dashboard/overview, GET /rankings e GET /fixed-income com adaptadores e fallback.

Aceite mínimo: Filtros alteram resultados; posições ordenadas; origem, data, metodologia e cobertura parcial visíveis; falha de API não derruba a tela.

Dependências / não assumir: PoC brapi ainda NÃO executada; todas as fontes são candidatas. Limiares de liquidez, universo elegível, preços ajustados, períodos e indicadores gerais ainda pendentes.

### M3 — Clientes e perfil patrimonial

Responsável: Pessoa 3 — CRM / perfil

- Criar lista mínima de clientes vinculados ao assessor, com acesso ao detalhe individual.
- Criar tela de perfil do cliente, reutilizada de modo seguro no ambiente cliente.
- Prever campos pessoais e patrimoniais apenas após definição; usar fixtures fictícias no MVP.

Aceite mínimo: Assessor abre apenas clientes vinculados; cliente vê somente seu perfil; estados vazio/erro e responsividade.

Dependências / não assumir: Campos de patrimônio, cadastro, vinculação assessor-cliente e edição ainda NÃO especificados. Não coletar dados pessoais reais para a demo.

### M4 — Investimentos atuais e possibilidades

Responsável: Pessoa 4 — carteiras / simulação

- Implementar visão demonstrativa dos investimentos atuais do cliente, com saldo e composição a partir de dados fictícios identificados.
- Implementar tela de possíveis investimentos com um cenário simples, separado de valores reais e sem promessas de retorno.
- Definir contrato compartilhado com M3 para cliente/carteira e com M2 para ativos, sem acoplamento ao provedor externo.

Aceite mínimo: Investimentos atuais e cenário hipotético são distinguidos; cálculos são reproduzíveis; acesso restrito ao cliente correspondente.

Dependências / não assumir: Método de simulação, premissas financeiras, tipos de investimento e campos definitivos dependem de validação. Nada deve ser apresentado como recomendação personalizada.

### M5 — Notícias, IA e fonte

Responsável: Pessoa 5 — notícias / IA

- Consultar provedor de notícias ainda a definir; selecionar até três por recência + relevância e eliminar duplicações.
- Produzir resumos em pt-BR por IA com fonte, link, publicação e rótulo de geração; fallback seguro quando IA falhar.
- Implementar GET /api/dashboard/news e cache de resumos por artigo/versão.

Aceite mínimo: Até três notícias distintas; fonte verificável; resumo fiel à informação recebida; links corretos; falha da IA não inventa texto.

Dependências / não assumir: Fonte de notícias, direitos de resumo, modelo OpenAI, custos e ponderação de relevância estão pendentes; texto incompleto não autoriza inferir fatos.

### M6 — Calendário, QA, integração e entrega

Responsável: Pessoa 6 — calendário / qualidade / release

- Criar experiência mínima de calendário para cada perfil com compromissos fictícios e visualização por usuário.
- Organizar smoke tests de login, permissões, rankings, notícias, cache e falhas; integrar módulos nas rotas finais.
- Validar build, deploy quando viável, README, credenciais demo, roteiro de pitch e congelamento antes de 17h30.

Aceite mínimo: Calendário demonstrável; build e navegação sem erros bloqueantes; roteiro de 5 min executável; repositório íntegro.

Dependências / não assumir: Compartilhamento de compromissos, criação/edição, notificações e sincronização externa NÃO aprovados. Escopo do calendário deve permanecer mínimo até validação.

## 4. Contratos de integração e fronteiras

| Interface | Produtor → consumidor | Status |
|---|---|---|
| Supabase Auth e perfil | M1 → M2/M3/M4/M5/M6 | Tecnologia aprovada; autorização detalhada pendente |
| GET /api/dashboard/overview | M2 → interface de assessor | Contrato proposto v1.6 |
| GET /api/dashboard/rankings | M2 → interface de assessor | Contrato proposto, exclui FIXED_INCOME |
| GET /api/dashboard/fixed-income | M2 → interface de assessor | Contrato proposto v1.7 |
| GET /api/dashboard/news | M5 → interface do Dashboard M2 | Contrato proposto |
| POST /api/dashboard/refresh | M2 com M5 → Dashboard | Contrato proposto; cache e limites |
| Cliente/Carteira | M3 ↔ M4 | Contrato a definir antes da codificação |
| Eventos do calendário | M6 ↔ M1/M3 | Modelo a validar; sem compartilhamento implícito |

Política transversal aprovada: cotações com cache inicial de 15 minutos; atualização no carregamento e via botão; prioridade de exibição: dado real atual → último real com data/alerta → simulado identificado → indisponível. Identificar origem por seção/ativo e preservar asOf (referência) distinto de fetchedAt (consulta).

## 5. Prioridades do MVP: Must / Should / Could / Won’t

| Prioridade | Escopo |
|---|---|
| Must | Login por perfil e autorização; navegação; uma jornada ponta a ponta por assessor e cliente; Dashboard funcional com filtros e estados de dados; notícias com indicação de fonte; demo e repositório entregues. |
| Should | Cobertura progressiva de todas as categorias e regiões; painel de renda fixa com dados permitidos; resumos de IA ao vivo; histórico e tratamento robusto de API. |
| Could | Gráficos ricos, preferências persistidas, calendário mais completo, mais detalhes de patrimônio, cenários adicionais. |
| Won’t nesta versão | Integração bancária real, execução de ordens, recomendações automatizadas personalizadas, alertas comerciais, microserviços, integrações de calendário externo e coleta de patrimônio real sem aprovação. |

Nota: “Should” reflete faseamento da implementação, não cancela as categorias e funcionalidades aprovadas. Se APIs impedirem uma parte, demonstrar fallback simulado rotulado e comunicar claramente as limitações.

## 6. Sequência de execução e marcos de integração

| Janela | Objetivo e porta de qualidade |
|---|---|
| 08h00–09h00 | M1 cria projeto, autenticação base e contratos/tipos; equipe confirma schemas, fixtures e branches. |
| 09h00–11h30 | Cada dono implementa caminho mínimo independente; APIs externas são testadas sem bloquear interfaces mockadas. |
| 11h30 | Checkpoint 1: rotas funcionam, build sem erros, payloads integráveis. |
| 11h30–14h30 | Integrar serviços e componentes; reforçar permissões e cenários críticos; congelar mudanças de contrato sem acordo. |
| 14h30 | Checkpoint 2: jornada de demonstração inteira passa com dados reais ou simulação identificada. |
| 14h30–16h30 | Testes cruzados, UX, contingência e README/pitch; corrigir falhas bloqueantes. |
| 16h30–17h30 | Congelamento de escopo, build final, evidências, repositório pronto para clonagem. |
| 17h30–18h00 | Demonstração e pitch de até cinco minutos. |

## 7. Testes de aceite compartilhados

- Sessão ausente recebe 401; cliente em rota de assessor recebe 403; cliente não lê dados de outro cliente.
- Trocar região/categoria/período recalcula rankings válidos, exibe até 10 itens e sinaliza cobertura parcial.
- Renda fixa usa taxas, preços e retornos com unidades e data, sem ranking genérico de alta/baixa.
- Erro em uma API não quebra outras seções; fallback diferencia último real, simulado e indisponível.
- Exibir até três notícias não duplicadas, com fonte/data/link e resumos sem fatos inventados.
- Build de produção, navegação desktop/mobile, README e pitch testados antes das 17h30.

## 8. Pendências e riscos de decisão

| Pendência | Dono proposto / ação |
|---|---|
| APIs financeiras: acesso, licenças, cobertura e histórico | M2: executar PoCs; brapi ainda não testada; registrar HTTP, schema, limitações. |
| Liquidez mínima e universo elegível; metodologia 1/7/30 dias | M2: apresentar definição com amostra verificável antes do ranking definitivo. |
| Títulos/países/práticos da renda fixa; métricas e preços | M2: validar instrumentos e cobertura ANBIMA/FRED. |
| Fonte, relevância e custo de notícias/IA | M5: escolher fonte e demonstrar resumo seguro. |
| Campos, vínculo e permissões de cliente | M3 com M1: validar modelo mínimo. |
| Método e premissas das simulações | M4: obter aprovação antes de cálculos definitivos. |
| Regra de compartilhamento do calendário | M6: confirmar com produto antes de expor eventos a outros perfis. |
| Implantação, contas e limites dos provedores | M1/M6: confirmar credenciais e ambiente de teste. |

## 9. Definição de pronto (Definition of Done) por módulo

Um módulo só é considerado pronto quando: (1) o fluxo principal funciona; (2) possui cenário de erro/vazio; (3) aplica autorização no servidor; (4) diferencia real, histórico e simulado quando necessário; (5) não quebra build ou outros módulos; (6) existe evidência de teste; (7) consta no roteiro da demonstração ou está explicitamente sinalizado como indisponível.

## 10. Decisões versus propostas

Aprovado: dois perfis; estrutura funcional original; cinco categorias de investimentos; FIIs/REITs; rankings Brasil/Internacional, 1/7/30 dias, até 10; renda fixa em painel próprio; preços na moeda original, variação na moeda de cotação; elegibilidade por liquidez e disponibilidade; preferência por preços ajustados; três notícias com IA, recência + relevância; cache inicial de 15 minutos; política de último dado real; Next.js/TypeScript, Supabase Auth/PostgreSQL; OpenAI como candidata preferencial.

Proposto nesta distribuição: liderança por seis módulos, recortes mínimos para áreas ainda não especificadas, rotas internas além dos requisitos já documentados, organização de trabalho e critérios operacionais de aceite. Qualquer mudança significativa de escopo deve ser validada pela equipe antes da implementação.
