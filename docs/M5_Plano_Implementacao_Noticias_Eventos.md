# M5 — Plano de implementação: notícias e eventos de mercado

## 1. Objetivo

Entregar ao assessor um radar confiável de notícias, atos, indicadores e acontecimentos que possam afetar o mercado e os ativos acompanhados. O sistema coleta conteúdo de fontes autorizadas, normaliza e deduplica os itens, resume o que a fonte efetivamente informou e apresenta evidências e limitações para apoiar a análise do assessor.

O M5 é apoio informacional. Não calcula probabilidade de retorno, não recomenda compra ou venda e não decide automaticamente que um evento afetará uma carteira. A associação com ativos é uma pista explicável para revisão humana.

## 2. Base atual e aderência ao produto

- A divisão de trabalho identifica M5 como **Notícias e IA**: até três notícias por recência e relevância, sem duplicações, resumo em pt-BR, fonte/data/link, cache e fallback sem alucinações.
- `docs/context.md` atribui ao agent de notícias a ingestão de APIs e a relação de eventos com ativos/clientes para apoiar o assessor.
- Current architecture: modular Next.js monolith, Drizzle + SQLite, Zod, and OpenAI Responses API. M5 consumes the TRF1 public REST/JSON API for institutional news using configured IDs.
- O protótipo HTML apresenta dashboard com patrimônio, alocação, investimentos e agenda, mas não desenha uma área de notícias ou eventos. Recomenda-se incluir nele um painel de assessor chamado **Radar do mercado**, sem alterar a jornada cliente do MVP.
- A documentação do hackathon menciona Supabase/OpenAI em algumas decisões, enquanto o estado atual do código e `CLAUDE.md` registra SQLite/Anthropic. Para implementação, seguir o código atual; registrar mudança de stack somente após decisão explícita da equipe.

## 3. Escopo proposto

### Incluído no MVP

1. Ingestão por API ou feed/licença autorizada, com conectores substituíveis; nada de contornar login, paywall, CAPTCHA, robots ou termos de uso por scraping.
2. Tipos de conteúdo: notícias empresariais e setoriais, comunicados oficiais, decisões regulatórias/fiscais, indicadores e decisões de política monetária, eventos corporativos/econômicos e acontecimentos geopolíticos com fonte primária ou cobertura jornalística identificada.
3. Normalização, validação, deduplicação, classificação temática, relevância transparente e ordenação por recência + relevância.
4. Até três itens no dashboard do assessor, com manchete, resumo curto, fonte, horário de publicação, link, horário de coleta e rótulo “resumo gerado por IA” quando aplicável.
5. Associação de termos/ativos mencionados como **possíveis relações**, com evidência textual e grau de confiança explicável. Sem cruzar tabelas de módulos: o M5 recebe uma lista de símbolos/nomes elegíveis por contrato do módulo consumidor.
6. Cache de itens e resumos, estado de atualização, fallback por último dado válido e operação sem IA.

### Fora do MVP

- Recomendação individual, suitability, ordem ou alerta comercial automatizado.
- Envio automático a clientes, notificações push e publicação de conteúdo protegido.
- Rastreamento indiscriminado da web, scraping de sites sem autorização, compra de feed não aprovada ou associação baseada apenas em sentimento.
- Monitoramento intradiário com SLA, backtesting de impacto/retorno e cobertura global garantida.

## 4. Fluxo de dados

```text
Fontes autorizadas
  → conectores (fetch com timeout/limite e respeito a cota)
  → validação do payload + normalização
  → deduplicação e persistência do original permitido/metadados
  → classificação e ordenação determinística
  → resumo opcional por LLM usando somente texto recebido
  → validação de saída e cache por artigo/versão
  → GET /api/dashboard/news
  → painel Radar do mercado (assessor)
```

### Contrato normalizado sugerido

`id`, `titulo`, `descricaoFonte` (trecho permitido), `url`, `fonte`, `publicadoEm`, `coletadoEm`, `idioma`, `tipoEvento`, `temas[]`, `entidades[]`, `ativosRelacionados[]`, `relevancia`, `resumo`, `resumoGerado`, `versaoResumo`, `statusConteudo`, `asOf`.

`publicadoEm` representa o horário informado pela fonte; `coletadoEm` é a consulta do sistema. Não substituir um pelo outro. Guardar timezone e tratar publicação sem horário como data aproximada. O resumo deve apontar para a fonte e distinguir fato reportado de inferência.

## 5. Fontes e conectores

Fazer uma PoC curta antes de escolher provedor. Comparar pelo menos uma API de notícias licenciada e fontes primárias públicas relevantes ao escopo brasileiro (por exemplo, comunicados de reguladores, governo, bancos centrais, bolsas e relações com investidores), verificando disponibilidade técnica e permissão de uso. Esses exemplos são candidatos, não integrações aprovadas.

Critérios de seleção: cobertura Brasil e ativos acompanhados; latência e histórico; campos e qualidade de timestamp; identificador/URL canônica; limites e custo; termos de armazenamento, exibição e resumo; atribuição obrigatória; estabilidade do schema; credenciais e ambiente de teste. Preferir API/ RSS oficialmente oferecido. Só persistir texto integral quando licença permitir; caso contrário, guardar metadados e trecho autorizado.

Definir interface interna `FonteNoticias.buscar({ desde, cursor })`, com adaptador por fornecedor. Falha, rate limit ou resposta inválida de uma fonte não deve impedir retorno de itens em cache ou de outras fontes. Guardar `fonteId`/nome do provedor para rastreabilidade sem vazar segredo.

## 6. Seleção e tratamento de eventos

1. Validar campos externos com Zod; rejeitar URL inválida, payload excessivo ou timestamps impossíveis.
2. Normalizar URL (remover parâmetros de rastreamento conhecidos), espaços, acentos/case para comparação e nomes de fonte.
3. Deduplicar por ID do provedor, URL canônica e similaridade de título + janela temporal; a regra precisa permitir atualizações legítimas da notícia.
4. Classificar em taxonomia inicial controlada: `EMPRESA`, `SETOR`, `MACRO`, `REGULATORIO`, `POLITICA_FISCAL`, `POLITICA_MONETARIA`, `CORPORATIVO`, `GEOPOLITICO`, `OUTRO`. Persistir versão da taxonomia.
5. Extrair entidades/símbolos com regras ou provedor estruturado. Uma associação só é exibida se houver menção identificável; registrar trecho/evidência e método. Ambiguidade fica como “mercado/setor”, sem atribuição individual.
6. Ordenação inicial explicável: recência dentro de janela configurável, qualidade/confiabilidade da fonte, correspondência de tema/ativo e diversidade para não mostrar três versões do mesmo assunto. Limiares e pesos devem ser configuráveis e documentados, não apresentados como medida de impacto financeiro.
7. Limitar resposta a três itens distintos, mas manter paginação/histórico interno para permitir evolução.

## 7. Resumo com IA e fallback

- Usar o cliente LLM já centralizado em `src/core/llm.ts`, sujeito a revisão do modelo/custo. O prompt deve tratar o conteúdo recebido como dado não confiável, ignorar instruções contidas na notícia e solicitar 1–2 frases factuais em pt-BR, sem opinião, previsão ou conselho.
- Enviar apenas conteúdo necessário e permitido. Não incluir dados pessoais, perfil, saldo, carteira nominal ou qualquer dado de cliente no prompt.
- Resposta estruturada validada por Zod; rejeitar alegações sem suporte, texto vazio ou excesso de tamanho. Armazenar versão do prompt/modelo e hash da entrada para invalidar cache quando mudar conteúdo ou versão.
- Se LLM falhar ou não houver licença/trecho suficiente, mostrar título + descrição autorizada da fonte com rótulo “Resumo indisponível”; nunca fabricar resumo. Resumo gerado deve trazer rótulo claro e link para leitura da fonte.

## 8. Persistência e cache

Tabelas de propriedade do submódulo `integracoes/noticias`, todas prefixadas `integracoes_`:

- `integracoes_noticias`: conteúdo normalizado, provedor, URL, datas, tipo, temas, status e chave de deduplicação.
- `integracoes_noticias_resumos`: notícia, idioma, versão de prompt/modelo, hash de entrada, texto e data de geração.
- Opcional para MVP ampliado: `integracoes_noticias_execucoes` para cursor, última tentativa, sucesso/erro sanitizado e contagem; nunca guardar chave ou payload sensível.

Índices únicos para ID do provedor quando presente e chave canônica; índices por `publicadoEm`, fonte e tipo. Usar retenção definida pela licença e requisito de produto; até essa definição, armazenar só metadados/trecho permitido. Cache de leitura de 15 minutos como ponto inicial do escopo, com `fetchedAt` e `asOf`; não confundir com frequência de coleta. Atualização manual respeita limites, timeout e cooldown.

## 9. API e fronteiras

- Expor no módulo `integracoes` os DTOs e funções públicas; rotas em `src/app/api` devem importar apenas `@/modules/integracoes`.
- `GET /api/dashboard/news`: retorna até três itens, `asOf`, `fetchedAt`, `status` (`fresh`, `stale`, `unavailable`), fontes e indicação de cobertura parcial. Aplicar autorização de assessor no servidor quando a camada de identidade estiver disponível; não confiar no seletor de perfil do protótipo.
- `POST /api/dashboard/refresh`: atualizar cache sob autenticação, limite de frequência e escopo definido; o contrato já é proposto no documento de módulos e precisa ser combinado com M2. A rotina agendada é evolução, não requisito para demonstrar MVP.
- Não fazer join direto com tabelas de carteira/cliente. O consumidor fornece símbolos/termos não sensíveis por interface pública; o M5 devolve candidatos e evidências. Evitar identificador de cliente no cache compartilhado.

## 10. Experiência no protótipo

Adicionar ao dashboard do assessor o painel **Radar do mercado**, com três cartões compactos. Cada cartão mostra manchete, resumo factual, categoria, fonte e horário de publicação, link externo seguro e selo “gerado por IA” ou “resumo indisponível”. Cabeçalho indica “Atualizado às …” e ação “Atualizar”; estado stale informa o horário da última atualização. Estado vazio explica que não há itens disponíveis; erro isolado de fonte mostra cobertura parcial sem apagar dados válidos. Não apresentar “impacto alto/médio/baixo” sem metodologia aprovada e evidência legível.

O protótipo é estático e não contém esse painel. Alinhar também a navegação entre as duas versões de layout presentes em `prototipo.html`; a implementação deve seguir o shell efetivamente integrado no app, não duplicar telas demonstrativas.

## 11. Fases de implementação

### Fase 0 — Decisões e PoC

- Confirmar provedor(es), termos/licença, conteúdo permitido, cobertura, custo e limite de uso.
- Definir taxa de coleta, retenção, política de cache, janela de recência e fontes prioritárias.
- Escolher se M5 retorna apenas notícias ou também eventos oficiais estruturados; para MVP, usar uma taxonomia comum com `tipoEvento`.
- Produzir 10–20 amostras sintéticas ou licenciadas para validar deduplicação e ordenação.

### Fase 1 — Contratos e persistência

- Substituir `NoticiasSchema` vazio por DTOs de fonte, notícia normalizada, resumo, resposta e filtros.
- Criar tabelas e índices Drizzle, migração/push segundo fluxo SQLite atual, seed determinístico fictício e exports públicos.
- Definir interfaces de conector e relógio/caching de modo testável.

### Fase 2 — Ingestão e seleção

- Implementar conector escolhido com timeout, retry limitado, rate limit, Zod e logs sanitizados.
- Normalizar, deduplicar, classificar e ordenar; persistir status e metadados.
- Devolver três candidatos e estados fresh/stale/unavailable.

### Fase 3 — Resumo e associação

- Implementar resumo opcional com LLM, validação, cache versionado e fallback seguro.
- Identificar ativo/tema apenas quando suportado por evidência textual; expor confiança/método sem recomendar ação.

### Fase 4 — API e painel

- Implementar GET de notícias e refresh protegido, integrar com dashboard do assessor e estados de carregamento, vazio, parcial, stale e erro.
- Seguir o protótipo e a camada de UI já usada no app.

### Fase 5 — Operação e validação

- Exercitar payload inválido, duplicata, atraso, indisponibilidade da fonte, limite de cota, falha do LLM, conteúdo insuficiente, atualização manual repetida e autorização.
- Confirmar atribuição/link, origem e timestamps; validar que nenhuma resposta induz recomendação personalizada.
- Registrar custo por execução, latência, taxa de erro e quantidade de itens utilizáveis sem guardar dados sensíveis.

## 12. Critérios de aceite

- GET retorna zero a três itens únicos, com fonte verificável, URL, publicação e coleta claramente identificadas.
- Itens são selecionados por regra documentada de recência + relevância e eventos semelhantes não ocupam todas as posições.
- Texto de resumo está apoiado apenas pelo material recebido; saída inválida/falha de IA usa fallback sem inventar conteúdo.
- Resposta externa e LLM são validadas; erro ou timeout de uma fonte não derruba a seção inteira.
- Cache mostra fresh/stale/unavailable e horário; botão de atualizar respeita limite e não duplica ingestão.
- Associação com ativo mostra evidência ou omite a associação; nenhuma recomendação ou impacto quantitativo automático aparece.
- Painel é exclusivo da experiência do assessor no MVP, responsivo e apresenta estados de erro/vazio/cobertura parcial.
- Segredos não aparecem no cliente ou logs; conteúdo e dados obedecem aos termos da fonte.

## 13. Riscos e decisões pendentes

| Decisão | Responsável sugerido | Consequência se não definida |
|---|---|---|
| Provedor e licença de redistribuição/resumo | M5 + produto/jurídico | Não persistir texto integral nem publicar resumo do feed |
| Escopo de “ações/medidas/acontecimentos” e fontes oficiais | Produto + M5 | Manter categorias genéricas e limitar itens a notícias autorizadas |
| Ativos cobertos e vínculo com carteiras | M2/M3/M4 + M5 | Relação apenas por entidades explícitas, sem visão por cliente |
| Modelo LLM, orçamento e limite de chamadas | M5 + equipe | Resumo opcional; operar com título/trecho permitido |
| Retenção, cronograma de coleta e atualização manual | Produto/infra | Cache mínimo com política conservadora |
| Autorização real por perfil | M1 + M5 | Não liberar rota antes do contrato de autenticação/autorização |
| Peso de relevância e janela temporal | M5 + M2 | Usar ranking determinístico documentado, sem alegar impacto |

## 14. Mapeamento para o código existente

| Código atual | Entrega planejada |
|---|---|
| `src/modules/integracoes/noticias/schema.ts` | DTOs Zod de ingestão, item, filtro e resposta |
| `src/modules/integracoes/noticias/db.ts` | tabelas Drizzle e índices `integracoes_*` |
| `src/modules/integracoes/noticias/service.ts` | ingestão, cache, seleção, resumos e consulta |
| `src/modules/integracoes/agents/noticias-agent.ts` | associação explicável de ativos/eventos; substituir assinatura `void` por retorno tipado |
| `src/modules/integracoes/index.ts` | superfície pública estável para API/app |
| `src/core/env.ts` e `.env.example` | variáveis do provedor escolhido, timeout/configuração não secreta e limites |
| `src/app/api/dashboard/news` | route handler fino com autorização e DTO público |
| Dashboard do assessor | painel Radar do mercado alinhado ao protótipo |

Este plano mantém o MVP do M5 e deixa crawler multi-site e análise de impacto quantitativa como evolução sujeita a licença, evidência e validação de produto.

---

## 15. Requisitos ampliados: triagem de impacto e alerta ao assessor

Esta seção incorpora o requisito de identificar cedo acontecimentos relevantes, cruzá-los com investimentos e apresentar as ocorrências mais críticas na primeira tela do assessor. O assessor usa esse contexto para priorizar contato e análise junto ao cliente; o cliente usa a plataforma para acompanhar e administrar seus investimentos. A automação deve apoiar essa relação, sem substituir a avaliação do assessor nem enviar uma recomendação automática ao cliente.

### Jornada-alvo

```text
Fontes licenciadas e oficiais
  → coleta incremental contínua/agendada
  → validação, normalização, deduplicação e proveniência
  → OpenAI: extrair fatos, evento, horizonte e ativos/temas candidatos
  → validar estrutura + evidências + confiança; regras de criticidade
  → cruzar candidatos com posições e vínculos via interfaces internas
  → criar ocorrências assessor ↔ ativo/carteira ↔ cliente
  → persistir ocorrência e e-mail em outbox transacional
       ├→ dashboard inicial do assessor, ordenado por criticidade
       └→ worker de e-mail imediato para P1/crítico
  → assessor abre a ocorrência, confere fonte/exposição e decide a ação
```

### O que a OpenAI fará e o que fica no domínio

- A OpenAI API analisará somente material permitido da notícia/evento e uma lista limitada de instrumentos/entidades de referência não pessoais. Extrairá: fatos com trechos/evidências, natureza do evento, direção possível (`positivo`, `negativo`, `misto`, `incerto`), horizonte provável, símbolos/entidades explicitamente relacionados, justificativa, confiança e criticidade sugerida. Isso é triagem, não previsão de preço.
- A aplicação valida a saída estruturada, confere citações/trechos contra o texto da fonte e aplica regras determinísticas versionadas. A IA não escolhe destinatário de e-mail nem consulta diretamente a base de clientes.
- O módulo obtém, pelo contrato público do módulo dono da carteira/relacionamento, exposições agregadas e vínculos assessor-cliente. O código cruza a lista de candidatos com posições elegíveis e cria alvos individuais apenas quando há exposição correspondente. Nunca compartilhar nome, e-mail, CPF, suitability, saldo total ou identificador de cliente com a OpenAI.
- Direção positiva ou negativa não reduz criticidade por si só. “Crítico” quer dizer necessidade de revisão rápida por potencial materialidade/exposição/incerteza/urgência, não certeza de perda ou ganho.
- Se a análise falhar, for inconsistente, sem evidência ou com baixa confiança, marcar como `revisao_manual`/`indeterminado`; não enviar alerta crítico baseado somente na resposta do modelo. Eventos oficiais de alto risco podem também acionar regras diretas, sem esperar LLM.

### Níveis de criticidade (proposta a validar com produto/compliance)

| Nível | Critério inicial | Tela inicial | E-mail |
|---|---|---|---|
| P1 — Crítico | Evento confirmado por fonte oficial ou corroborado; potencial materialidade alta; há ativo em carteira; urgência imediata/curto prazo; confiança mínima e evidência rastreável | Faixa prioritária no topo, badge, horário e clientes/posições expostos; exige confirmação/triagem do assessor | Envio imediato ao assessor responsável, deduplicado por ocorrência; retry com backoff e registro de entrega |
| P2 — Alto | Relação plausível com ativo/carteira e relevância alta, mas sem combinação suficiente para P1 ou com incerteza maior | Lista logo abaixo de P1 | Sem e-mail automático no primeiro corte; configurável após medir ruído |
| P3 — Acompanhar | Contexto de mercado/setor ou impacto indireto, não individualizado | Feed/radar abaixo dos casos de ação rápida | Não |
| Informativo | Sem exposição conhecida ou relevância insuficiente | Busca/histórico do radar | Não |

Os thresholds de urgência, materialidade, confiança, repetição e confirmação de fonte são parâmetros de produto/compliance a calibrar com exemplos. Não mostrar uma probabilidade numérica de perda/ganho. O assessor precisa ver a razão do nível e poder marcar `revisado`, `em_acompanhamento`, `descartado` (com motivo) ou `resolvido`; guardar responsável e timestamps para auditoria.

### Relação de evento com investimento e cliente

Manter duas classes de ocorrência:

1. **Evento de instrumento/carteira:** ativo ou classe elegível afetada, agregado por assessor e instrumento. A tela apresenta exposição agregada/quantidade de clientes afetados, quando disponível, sem misturar saldos de outras carteiras.
2. **Evento com exposição singular:** cada relação com cliente é uma ocorrência vinculada ao instrumento em sua carteira e ao assessor responsável. Só criar se o vínculo e a posição forem atuais e autorizados. Exibir nome do cliente apenas ao assessor autorizado para aquele vínculo; não inferir que todos os clientes detêm aquele ativo.

Uma ocorrência guarda o evento original, evidência e método de associação, identificadores internos necessários, snapshot/versão da exposição e `matchedAt`. Revalidar posição/vínculo antes de abrir detalhe e antes de enviar e-mail. Evitar expor saldos em e-mail: incluir resumo mínimo, quantidade/identificação interna permitida e link autenticado para o dashboard.

## 16. Pesquisa de APIs e fontes candidatas

Pesquisa web consultada em 10/10/2026. A existência de endpoint não garante cobertura brasileira, tempo real, direito de armazenamento, reexibição ou resumo. Fazer PoC e revisão de termos antes de integrar. Proposta de portfólio de fontes: uma API de descoberta de notícias, fontes oficiais brasileiras e fontes oficiais/mercado internacionais, reduzindo dependência de um único fornecedor.

| Fonte/API | Cobertura e utilidade indicada pela documentação | Papel sugerido / ressalvas |
|---|---|---|
| [NewsAPI — Everything](https://newsapi.org/docs/endpoints/everything) | Busca em fontes/blogs, por domínio, idioma, data e ordenação; documentação informa snippets de conteúdo truncados | Candidata de descoberta jornalística global/pt-BR. Não assumir texto integral nem uso comercial/republicação; validar plano, atraso, direitos e lista de veículos. |
| [TRF1 ? API P?blica de not?cias institucionais](https://www.trf1.jus.br/trf1/api-noticias-institucionais) | API HTTP/JSON para metadados e conte?do de not?cias institucionais. Consulta por `view=institucional` e `id`. | Fonte p?blica prim?ria institucional, n?o especializada em finan?as. Documenta??o consultada n?o fornece endpoint de listagem/descoberta; IDs devem ser configurados. Sem associa??o autom?tica a ticker. |
| [Banco Central — Dados Abertos](https://dadosabertos.bcb.gov.br/) | Catálogo oficial com conjuntos em API/OData/JSON, incluindo câmbio e séries/indicadores; periodicidade depende do dataset | Fonte primária para indicadores e séries macro. Não confundir observação estatística com notícia ou evento intradiário; usar periodicidade declarada por dataset. |
| [SEC — Developer Resources / data.sec.gov](https://www.sec.gov/about/developer-resources) | APIs REST JSON de submissões EDGAR e dados XBRL; SEC declara atualização ao longo do dia conforme submissões são públicas | Fonte primária global para filings de emissores dos EUA. Aplicar regras de acesso/identificação do SEC e abrir filing oficial; XBRL auxilia extração, mas o filing oficial prevalece. |
| [B3 — Portal de desenvolvedores](https://developers.b3.com.br/) | Portal de produtos e integrações de dados de mercado | Avaliar para dados/avisos oficiais brasileiros e cobertura de instrumentos. Condições de acesso, autenticação e licenciamento podem exigir contratação; não assumir API gratuita aberta para notícias. |

**Implementation adopted:** TRF1 public institutional API as the HTTP/JSON consumption source. Integration queries IDs configured in `NEWS_TRF1_IDS`; the available documentation does not describe an endpoint to list recent news, and the source has no broad financial coverage or reliable ticker mapping. Do not use this source alone for market monitoring or claims about portfolio impact.

## 17. Stack e configuração propostas

### Aplicação e análise

- **Next.js App Router + TypeScript** mantidos; route handlers finos e serviços do domínio no monólito modular.
- **Drizzle + SQLite** para a demo local atual. Para multiusuário e execução distribuída/produção, migrar para **PostgreSQL gerenciado**, porque SQLite local não dá durabilidade/concorrência adequada para worker, outbox e fila distribuída; o plano do projeto já registra hospedagem como pendência.
- Adicionar dependência oficial `openai` com versão exata fixada no `package.json` quando a implementação começar. Centralizar cliente server-only em `src/core/openai.ts`; usar **Responses API** e **Structured Outputs (JSON Schema strict)** para classificação/resumo tipados, com Zod como validação adicional. Especificar `store: false` se a resposta não precisar ser armazenada pela OpenAI; persistir internamente apenas os campos necessários e respeitar a política de retenção.
- `OPENAI_API_KEY` somente no servidor via `.env` local/secret manager; acrescentar ao `.env.example` sem valor. Nunca prefixar com `NEXT_PUBLIC_`, nunca commitar `.env`, nunca enviar a chave ao browser. Configurar também `OPENAI_MODEL` em variável server-side, com modelo escolhido após benchmark de qualidade/custo/latência e acesso da conta. Remover/substituir `ANTHROPIC_API_KEY`/cliente apenas após decisão de migração; não manter provedores duplicados sem propósito.
- Conteúdo de artigos é entrada não confiável: prompt-injection guard, nenhum tool access para o modelo, instruções delimitadas como dado e saída validada. Incluir só título, trecho permitido, metadados, entidades e IDs de referência opacos. Não usar OpenAI para buscar a internet; a coleta é feita nos conectores de fonte definidos.

### Execução assíncrona e e-mail

- Criar interface de fila e workers separados das requisições da UI. **Demo single-process:** rotina agendada/worker simples apenas se o deploy for um processo persistente; não prometer execução confiável em serverless com cron improvisado. **Produção:** fila durável (ex.: Redis gerenciado + BullMQ ou serviço gerenciado de filas), workers idempotentes e scheduler; escolher após definir hospedagem.
- Para garantir que o alerta não se perca entre salvar ocorrência e enviar mensagem, usar padrão **transactional outbox** no banco: gravar ocorrência e tarefa de notificação na mesma transação; worker entrega, registra tentativa/ID do provedor e atualiza status. Chave idempotente por `occurrenceId + recipient + channel`; retries exponenciais, fila de falhas e alerta operacional para e-mail que não entrega. Não duplicar envio quando o job rodar novamente.
- Definir um `EmailProvider` adapter (provedor transacional aprovado pelo time; opções de PoC: AWS SES ou Resend) com remetente verificado, templates de texto/HTML, link autenticado, timeout, rate limit e status de entrega. Credenciais em `.env` local e secret manager em produção. Não incluir recomendação, saldo, CPF, carteira detalhada ou informação privilegiada no assunto/corpo.
- Para **P1 crítico**: e-mail assim que a ocorrência P1 for persistida e validada, sem aguardar o assessor abrir a plataforma. Se indisponível, ocorrência permanece no dashboard e status da notificação mostra falha/retry. O dashboard nunca depende da entrega do e-mail.

Variáveis a preparar em `.env.example` na fase de código (placeholders vazios apenas): `OPENAI_API_KEY`, `OPENAI_MODEL`, credenciais/URL do provedor escolhido, `NEWS_PROVIDER_*`, `EMAIL_PROVIDER`, `EMAIL_FROM`, `EMAIL_API_KEY` ou configuração SMTP, `QUEUE_URL`, `NEWS_POLL_INTERVAL_SECONDS`, limites, janela de dedupe e cooldown. `src/core/env.ts` deve validar tipos/defaults e falhar de forma clara se uma integração obrigatória estiver habilitada sem chave; chaves vazias podem manter mock/seed em desenvolvimento.

## 18. Modelo de dados ampliado

Além das tabelas da seção 8, criar tabelas sob propriedade do M5 com prefixo `integracoes_`:

- `integracoes_eventos_analises`: notícia/evento, versão do prompt/modelo/taxonomia, classe de evento, viés possível, horizonte, criticidade sugerida, confiança, fatos/evidências, estado de validação, `analisadoEm` e erro sanitizado.
- `integracoes_eventos_alvos`: análise, tipo de alvo (`ativo`, `carteira`, `cliente`), ID opaco do domínio de origem, assessor responsável, evidência/método, snapshot de exposição/versão e timestamps. Não copiar toda a carteira para o módulo de integração.
- `integracoes_alertas`: alvo/ocorrência, severidade final, motivo legível, estado do assessor, dedupe key, criado/revisado/resolvido por e quando.
- `integracoes_notificacoes_outbox`: alerta, canal, destinatário, payload mínimo, chave idempotente, tentativas, `nextAttemptAt`, status e ID de entrega do provedor.

Declarar índices para `severity + status + createdAt`, `assessorId + status`, `sourceEventId`, `dedupeKey` única e outbox pendente. Definir retenção para texto da fonte, análise e trilha de auditoria segundo licenças e política de dados. Aplicar autorização por assessor em todas as consultas; a arquitetura atual precisa consolidar autenticação antes de expor alvos por cliente.

## 19. Contratos internos e endpoints

- `GET /api/dashboard/alerts`: alertas não resolvidos do assessor autenticado, ordenados P1→P2→P3, incluindo resumo, razão, evidências, ativos, clientes que ele pode acessar, fonte, timestamps, estado e cobertura. Paginar; não restringir o dashboard aos três itens de notícias.
- `GET /api/dashboard/news`: feed informativo, independente dos alertas já correlacionados.
- `POST /api/dashboard/alerts/:id/status`: atualizar estado/notas estruturadas do assessor após checar autorização e vínculo. Não permitir mutação de severidade/model output pelo cliente.
- `POST /api/dashboard/refresh`: pedir coleta/triagem com rate limit; responder `202` com ID de execução, sem bloquear pela OpenAI ou provedor de notícia.
- `POST /api/internal/jobs/news-ingest` ou worker privado: endpoint assinado somente se infraestrutura exigir; preferir fila interna sem rota pública.
- Exportar métodos públicos pelo `src/modules/integracoes/index.ts`. Contratos de leitura de exposições/relacionamentos devem ser publicados por `assessor`/módulos proprietários e retornam somente dados mínimos necessários. Se não houver vínculo/autorização confiáveis, criar alerta apenas para o ativo agregado do assessor, sem nomear clientes.

## 20. Primeira tela do assessor e interação

Ao entrar em `/assessor`, carregar no topo um bloco **Atenção prioritária** antes dos cards de métricas. Incluir todos os P1 abertos e os P2 mais recentes, contagem de clientes/ativos expostos e estado da última sincronização. P1 não pode ser ocultado por ordenação de recência comum. Para cada caso mostrar: o que aconteceu, quando, fonte/link, por que a IA/regras consideraram relevante, instrumento e tipo de exposição confirmada, clientes autorizados afetados, nível de confiança/incerteza e prazo/horizonte quando a fonte suportar. Incluir ações rápidas `Abrir análise`, `Marcar revisado`, `Acompanhar` e `Descartar com motivo`.

Dar feedback visual distinto para negativo, positivo, misto e desconhecido, mantendo severidade independente do sinal. Agrupar duplicatas do mesmo fato; não agrupar fatos distintos da mesma empresa. Após atualização, avisar sem interromper navegação. Mostrar banner de fonte desatualizada/serviço degradado, não estado “sem alertas” quando ingestão está indisponível. O cliente segue com área para administrar/acompanhar os investimentos; nenhum alerta individual é enviado diretamente ao cliente neste escopo sem aprovação explícita de produto, consentimento e conteúdo revisado.

## 21. Ordenação, correlação e controles contra falso positivo

1. Detectar evento e fatos no texto original; manter trecho citável e URL canônica. O modelo não pode inventar símbolos, data, causa, magnitude ou direção.
2. Resolver entidade com cadastro/tabela de mapeamento validada (ticker, ISIN quando houver, CNPJ/CIK, aliases e classe). Homônimos ambíguos não geram alvo individual.
3. Mapear exposição em código usando holdings atuais e vínculos autorizados. Diferenciar posição direta, fundo/ETF com subjacente conhecido, classe/setor e mera correlação macro; só as duas primeiras podem qualificar P1 no MVP, salvo regra manual aprovada.
4. Determinar severidade por combinação versionada: autoridade/verificação da fonte, tipo e materialidade do fato, exposição real e atual, urgência temporal, confiança/evidência e duplicidade. O LLM fornece extração e parecer sugerido; regras e fontes decidem o encaminhamento.
5. Requerer corroborar notícias de terceiros para P1 sempre que possível. Fonte oficial primária, fonte licenciada e fonte secundária têm níveis de confiança distintos.
6. Evitar repetição: evento canônico + alvo + mudança material atualiza alerta existente; reenvio só se severidade subir ou conteúdo materialmente mudar e respeitar cooldown. Manter trilha para correções/retrações da fonte.
7. Medir precisão/recall em conjunto de avaliação revisado por assessores, falsos P1 por 100 alertas, latência ingestão→dashboard/e-mail, cobertura de ativos e sucesso de entrega. Ajustar thresholds antes de habilitar disparo automático amplo.

## 22. Plano de entrega revisado

1. **PoC de fontes e direito de uso:** amostrar Brasil e global; confirmar API key, latência real, tickers/entidades B3, termos comerciais, limites, storage e atribuição. Selecionar uma fonte agregadora e ao menos duas primárias oficiais.
2. **Contratos de holdings e identidade:** com M1/M3/M4, fechar autorização, IDs opacos, frescor de posição e assessor titular. É bloqueador para alertas singulares; sem isso, limitar ao nível de ativo/setor.
3. **Integração OpenAI:** adicionar SDK e `.env` server-only; schema estrito de análise; testes com corpus sintético/anotado; fallback sem chave e sem LLM; avaliação de custo/latência.
4. **Persistência e ingestão:** conectores, fila/cursor, dedupe, tabela de análise, retenção/licença e telemetria sanitizada.
5. **Correlação e severidade:** endpoint público de exposição mínima, regras de associação e criticidade, auditoria e idempotência.
6. **Dashboard inicial:** painel prioritário, ações de revisão, estados degradados e escopo de autorização.
7. **E-mail P1:** transactional outbox, worker, template mínimo, retries, idempotência, monitoramento e endereço de teste verificado. Só ativar envio real após definir provedor e validar destinatário/remetente.
8. **Hardening e aceite:** replay de eventos, duplicatas, correção, falsa associação, baixa confiança, exposição encerrada, assessor sem acesso, falha de cada fonte, timeout OpenAI, banco indisponível, queue indisponível e bounce de e-mail.

## 23. Critérios de aceite adicionais

- Coleta atualiza automaticamente na frequência aprovada e salva fonte, horários e versão; execução manual retorna sem bloquear o navegador.
- Cada classificação relevante contém evidência citável, fonte clicável, direção possível e incerteza; saídas inválidas não avançam para criticidade automática.
- Ao abrir o dashboard, o assessor vê todos os P1 abertos primeiro e ocorrências P2 ordenadas, com exposição cliente/instrumento correta e autorizada.
- Evento sem posição atual não é apresentado como impacto singular; evento ligado a fundo ou classe explica que a exposição é indireta.
- Um P1 validado e novo produz exatamente uma notificação por destinatário/canal, enviada sem aguardar login; retries não duplicam. Falha do e-mail não remove o alerta da tela.
- Um assessor não consulta alerta de cliente fora de seu vínculo; cliente não vê alertas internos/nomes de outros clientes.
- OpenAI recebe apenas conteúdo permitido e referências instrumentais mínimas; API key permanece server-side; não há envio de dados pessoais/financeiros do cliente.
- UI comunica que o alerta é triagem para revisão do assessor, não recomendação nem previsão.

## 24. Fontes consultadas e nota de escopo

- OpenAI Docs: [Responses API — criação de resposta](https://developers.openai.com/api/reference/resources/responses/methods/create), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). A documentação sustenta o uso de Responses com formato estruturado por JSON Schema; o desenho de limitar dados e validar evidências é requisito de arquitetura deste projeto.
- [Cias Abertas: Documentos Periódicos e Eventuais (IPE)](https://dados.cvm.gov.br/dataset/cia_aberta-doc-ipe): categorias de documentos, arquivo anual ZIP e atualização semanal do ano corrente/anterior.
- [Plano de Dados Abertos CVM 2026–2028](https://www.gov.br/cvm/pt-br/acesso-a-informacao-cvm/dados-abertos/pda-cvm-2026-2028.pdf): previsão de implantação de API pública no portal.
- [Portal de Dados Abertos do Banco Central](https://dadosabertos.bcb.gov.br/): catálogo oficial com datasets e APIs; revisar metadados de cada série antes de definir polling.
- [SEC Developer Resources](https://www.sec.gov/about/developer-resources): disponibilidade declarada de APIs REST de submissions e XBRL para filings EDGAR.
- [B3 Developers](https://developers.b3.com.br/): portal de acesso a produtos e APIs; disponibilidade contratual precisa ser confirmada.
