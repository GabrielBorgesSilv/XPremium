# Análise de negócio: viabilidade e mercado do Hub XP (XPremium)

- **Data:** 10/10/2026
- **Autor:** Márcio (M1), com apoio do Claude Code
- **Status:** versão para o hackathon. Números de mercado com fonte no final; o que é hipótese está marcado como **hipótese**.
- **Foco:** a dor do **assessor** que atende **clientes XP**. Prospects e clientes de fora da XP **não** fazem parte do produto (mudança de 10/10/2026; ver `docs/context.md`).

---

## Resumo para o pitch (cerca de 1 minuto)

1. **Problema.** O assessor gasta tempo demais preparando cada reunião, não enxerga o patrimônio que o cliente tem fora da XP, não sabe quem priorizar numa carteira grande e precisa cruzar o mercado com dezenas de carteiras na mão.
2. **Solução.** O Hub XP é a **ferramenta de trabalho do assessor**, da XP ou de escritório credenciado. Ele traz cada cliente pronto para a conversa, mostra o **patrimônio de fora via Open Finance** (com consentimento do cliente), aponta **quem precisa de contato agora** e liga **notícias de mercado às carteiras afetadas**.
3. **Por que agora.** A XP chegou a **R$ 2,2 trilhões** em ativos de clientes (+17% em 12 meses), mas os **assessores cresceram só 1%** (18,4 mil) e a base de clientes também (4,77 milhões). Crescer agora depende de **cada assessor render mais** e de **captar o patrimônio que os clientes atuais mantêm fora**.
4. **Oportunidade.** Pessoas físicas têm **R$ 9,1 trilhões** investidos no Brasil. Parte relevante do dinheiro dos clientes XP está em outras instituições, e o Open Finance (cerca de **209 milhões de consentimentos ativos**; **4,9 bilhões** de chamadas às APIs de investimentos em um mês) torna essa parte visível.
5. **Para o cliente.** Visão consolidada e atendimento mais personalizado, **sem custo**.
6. **Diferencial.** Ferramentas como o Gorila consolidam dados para escritórios, mas ficam fora da plataforma XP. O Hub fica **dentro do ecossistema XP**: dados de custódia XP, Open Finance, priorização e mercado num só lugar, a serviço da conversa do assessor.
7. **Como medimos.** Captação líquida do patrimônio que estava fora, produtividade do assessor, tempo de preparação de reunião, adesão ao Open Finance, cross-sell e ticket médio.

---

## 1. Objetivo do produto

O Hub XP é a **ferramenta de trabalho do assessor** que atende clientes XP, seja assessor da XP ou de escritório credenciado. Ele resolve quatro dores do dia a dia:

1. **Tempo preparando reuniões:** carteira, perfil, histórico e notícias de cada cliente reunidos num só lugar, prontos antes da conversa.
2. **Não enxergar o patrimônio fora da XP:** com consentimento via **Open Finance**, o assessor vê o que o cliente tem em outras instituições.
3. **Não saber quem priorizar:** alertas de quem precisa de contato (vencimentos, concentração, oportunidades de captação).
4. **Acompanhar o mercado contra as carteiras:** o agent de notícias mostra qual movimento afeta quais clientes.

**Resultado para a XP:** captação do patrimônio que os clientes mantêm fora, mais cross-sell e assessores atendendo mais clientes com mais qualidade.

**Para o cliente:** visão consolidada e um atendimento mais personalizado, sem custo.

## 2. As dores do assessor e como o Hub responde

| Dor | Como é hoje (hipótese a validar com assessores) | O que o Hub entrega | Módulo |
|---|---|---|---|
| **Tempo preparando reuniões** | Junta carteira, perfil, histórico e notícias de várias telas e planilhas, cliente por cliente | Ficha do cliente pronta: carteira XP + patrimônio externo + perfil (anamnese) + notícias relevantes | `assessor/clientes`, `cliente/patrimonio`, `cliente/anamnese` |
| **Não enxergar o patrimônio fora da XP** | Pergunta ao cliente ou estima; recomenda sem visão completa | Patrimônio externo via Open Finance, normalizado pelo agent bancário | `cliente/open-finance`, `integracoes/agents` |
| **Não saber quem priorizar** | Agenda reativa; clientes grandes ou com evento importante passam despercebidos | Lista de quem contatar agora: vencimentos, concentração, desenquadramento, patrimônio externo relevante | `assessor/metricas`, agenda (M6) |
| **Mercado contra as carteiras** | Lê notícias e cruza na memória com os clientes | Agent de notícias relaciona eventos aos ativos e aos clientes afetados | `integracoes/noticias`, dashboard de mercado (M2) |

## 3. Quem usa e quem ganha

| Quem | O que ganha |
|---|---|
| **Assessor da XP** | Menos tempo de preparação, visão completa do cliente, priorização e contexto de mercado |
| **Assessor de escritório credenciado** | O mesmo, dentro da plataforma XP (ver seção 7 sobre os dados) |
| **Cliente XP** | Visão consolidada (XP + outras instituições) e atendimento mais personalizado; sem custo |
| **XP** | Captação do patrimônio que está fora (share of wallet), cross-sell e produtividade da rede de assessores |

Não fazem parte do produto: prospects (não clientes XP) e prospecção com benchmark.

## 4. Como funciona o ciclo

```
Cliente XP ──consente (Open Finance)──▶ patrimônio externo consolidado com a custódia XP
                                                   │
       mercado e notícias ──▶ agent de notícias ───┤
                                                   ▼
             Hub do assessor: ficha pronta + quem priorizar + clientes afetados pelo mercado
                                                   │
                                                   ▼
        conversa personalizada ──▶ portabilidade / novas aplicações ──▶ captação e cross-sell
```

No MVP do hackathon, a integração bancária real está fora de escopo (documento da equipe). Os dados do Open Finance são simulados.

## 5. Modelo de negócio

- **Ninguém paga pelo Hub:** nem o cliente nem o assessor. É investimento da XP em produtividade e captação.
- **Lógica de retorno:**

```
Receita incremental ≈ (patrimônio externo captado) × (receita anual da XP por real sob custódia)
                    + (receita do cross-sell gerado)
Ganho de produtividade ≈ (horas de preparação economizadas por assessor) × (nº de assessores)
                         → mais clientes atendidos ou mais tempo em conversa por assessor
Custo ≈ desenvolvimento e operação + Open Finance (infraestrutura) + adoção pelos assessores
```

- **Funil a medir (hipótese a validar no piloto):**

| Etapa | Pergunta |
|---|---|
| Assessor ativo no Hub | Os assessores adotam a ferramenta no dia a dia? |
| Cliente → consentimento Open Finance | Quantos clientes aceitam conectar? |
| Patrimônio externo identificado | Quanto dinheiro dos clientes está fora? |
| Contato priorizado → conversa | O assessor age sobre os alertas? |
| Conversa → captação | Quanto do patrimônio externo vem para a XP em 90 e 180 dias? |

Os valores de conversão, de patrimônio externo médio e de receita por real sob custódia **não foram levantados** nesta análise. Devem vir dos dados internos da XP (release trimestral e base de clientes) ou de um piloto.

## 6. Mercado e oportunidade (dados atuais)

| Indicador | Valor | Fonte |
|---|---|---|
| XP: ativos de clientes | **R$ 2,2 tri** (+17% a/a); captação líquida de cerca de R$ 28 bi no 2T26 | Release 2T26 |
| XP: assessores | **18,4 mil** (+1% a/a): a rede não cresce, então a produtividade vira a alavanca | Release 2T26 |
| XP: clientes ativos | **4,77 mi** (+1% a/a): o crescimento vem dos clientes atuais | Release 2T26 |
| Investimentos de pessoas físicas no Brasil | **R$ 9,1 tri** (jun/26), +6,4% no semestre | ANBIMA |
| Varejo alta renda / private | **R$ 3,4 tri** (maior crescimento, +7,8%) / **R$ 2,8 tri** (contas +22% no semestre) | ANBIMA |
| Open Finance: consentimentos ativos | cerca de **209 milhões** (jul/26) | Dashboard Open Finance (via Let's Money) |
| Open Finance: APIs de investimentos | **4,9 bilhões** de chamadas bem-sucedidas (mai/26) | ABBC |

**Leitura:** com rede e base estáveis, o crescimento da XP depende de dois movimentos que o Hub atende diretamente: **trazer o patrimônio que os clientes mantêm fora** e **fazer cada assessor atender mais e melhor**.

**Onde focar primeiro:** clientes do varejo alta renda, o segmento que mais cresce, onde a diversificação entre instituições é comum (**hipótese**) e onde a conversa com o assessor pesa na decisão.

## 7. Concorrência e posicionamento

| Tipo | Exemplos | Pontos fortes | Posição do Hub |
|---|---|---|---|
| **Consolidação para assessores e escritórios** | Gorila (para advisors), Kinvo, Smartbrain, ComDinheiro | Consolidação madura, integração com Open Finance e corretoras; o Gorila investe em escritórios | O Hub fica **dentro da plataforma XP**, com custódia XP, Open Finance, priorização e mercado juntos, sem o escritório precisar de outra ferramenta |
| **Bancos e plataformas** | BTG Pactual, Itaú | Assessoria e base grande | Concorrem pelo mesmo cliente; o Hub ajuda o assessor XP a reter e captar |
| **Ferramentas internas da XP** | Open Finance no app (2022), Planejamento Financeiro no HUB (2024), Fliper (consolidação, 2020) | Já existem e são da XP | **Atenção à sobreposição e ao nome:** a XP já tem uma plataforma chamada "HUB". O Hub XP deve ser apresentado como **evolução centrada no assessor** que reaproveita o que já existe, não como uma ferramenta paralela. |

**Diferencial:** **assessor humano + dados**. O Hub transforma dados da custódia XP, do Open Finance e do mercado em uma **lista de ações e conversas prontas** para o assessor.

## 8. Regulação e LGPD

**O que vale hoje (fontes no final):**
- **Finalidade e escopo.** O cliente consente para uma **finalidade específica**, com os dados especificados, e a instituição só pode usá-los para isso.
- **Prazo.** O limite de 12 meses deixou de existir (Resolução Conjunta nº 7/2023). O prazo pode ser maior se for compatível com a finalidade, e a renovação ficou mais simples.
- **Revogação.** O cliente pode revogar a qualquer momento.
- **Venda e repasse.** Vender dados é proibido. Perfilamento por desvio de finalidade exige cautela.
- **Proposta do BC em 2026.** Prevê vedar o repasse de dados transacionais "puros" a empresas não reguladas e criar o modelo integradora + parceira, com consentimento 1x1x1. O status final não foi confirmado.
- **XP.** Já usa o Open Finance para "personalizar ofertas" (Forbes, 2022). O termo vigente não pôde ser lido (acesso bloqueado) e precisa ser revisado pelo jurídico.

**Avaliação para o novo foco:**

| Aspecto | Avaliação |
|---|---|
| Consentimento único | **Viável e mais simples que antes.** Só clientes XP e uma finalidade clara: "consolidar meu patrimônio e permitir que meu assessor me atenda com base nele". |
| Clareza | Deixar explícito na tela: quais dados, por quanto tempo e que **o assessor vai usá-los para recomendar e entrar em contato**. |
| Minimização | Investimentos, contas, cartão, crédito e cadastro: usar só o que serve à assessoria (por exemplo, crédito para diagnóstico, não para listas de ofertas genéricas). |
| **Escritórios credenciados (ponto de atenção)** | O cliente é XP, mas o escritório é outra empresa. **Recomendação:** o assessor do escritório usa os dados **dentro da plataforma XP** (sem exportar), e o consentimento informa que o atendimento pode ser feito pelo escritório que atende o cliente. Validar com o jurídico, considerando a proposta do BC. |
| Não pode | Usar os dados para campanhas de marketing em massa, para outras empresas ou para revenda. |

## 9. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Baixa adoção pelos assessores | Ferramenta sem uso | Resolver as 4 dores no fluxo que o assessor já tem; piloto com assessores reais; medir tempo economizado |
| Cliente não consente com o Open Finance | Dor 2 fica sem dados | Valor claro para o cliente (visão consolidada), pedido feito pelo próprio assessor, revogação fácil |
| Percepção de "isca" comercial | Confiança e marca | Transparência; contato baseado em necessidade real (alertas), não em volume |
| Regulatório (finalidade, escritórios, proposta do BC) | Bloqueio ou multa | Finalidade bem escrita; dados ficam na plataforma; revisão jurídica |
| Sobreposição com ferramentas XP existentes (inclusive o nome "HUB") | Esforço duplicado, confusão | Integrar e posicionar como evolução; definir o nome com o produto da XP |
| Qualidade e cobertura dos dados externos | Recomendação errada | Normalização pelo agent bancário; aviso de cobertura parcial e de data |
| Excesso de alertas | Assessor ignora a priorização | Poucos alertas, ranqueados por impacto; o assessor pode marcar como resolvido |

## 10. Veredito de viabilidade

| Dimensão | Avaliação | Por quê |
|---|---|---|
| Estratégica | **Alta** | Rede de assessores e base estáveis: produtividade e share of wallet são as alavancas de crescimento |
| Mercado | **Alta** | R$ 9,1 tri em PF; alta renda é o segmento que mais cresce |
| Técnica | **Alta** | Open Finance maduro e XP já participante; o MVP já tem login, papéis e módulos do assessor |
| Regulatória | **Média-alta** | Mais simples que no recorte anterior (só clientes XP); atenção aos escritórios credenciados |
| Adoção | **A validar** | Depende de os assessores usarem no dia a dia e de os clientes consentirem |

**Recomendação:** seguir com um **piloto com assessores da XP** atendendo clientes do varejo alta renda, medindo o funil da seção 5 e o tempo de preparação antes e depois. Escritórios credenciados entram depois de validado o desenho de dados (na plataforma, sem exportação).

## 11. Métricas de sucesso

| Métrica | Como medir |
|---|---|
| Captação líquida do patrimônio externo | Quanto do patrimônio identificado fora veio para a XP (90 e 180 dias) |
| Produtividade do assessor | Clientes atendidos e captação por assessor, antes e depois |
| Tempo de preparação de reunião | Minutos por reunião, antes e depois (amostra de assessores) |
| Adesão ao Open Finance | % dos clientes da carteira com consentimento ativo |
| Cross-sell e ticket médio | Produtos por cliente e valor médio por cliente |

Saiu: conversão de leads, porque não há prospects no produto.

## 12. Perguntas em aberto

- Qual é a receita da XP por real sob custódia e o patrimônio externo médio dos clientes-alvo? Necessários para estimar o retorno.
- Quanto tempo um assessor gasta hoje preparando uma reunião? (entrevista ou amostra)
- Texto final do consentimento e revisão jurídica, incluindo o termo atual da XP e o atendimento por escritórios credenciados.
- Status da proposta do BC sobre parceiros (1x1x1).
- Relação com as ferramentas internas da XP, incluindo o nome "HUB".
- Metas do piloto.

---

## Fontes

- ANBIMA: [Investimentos das pessoas físicas crescem 6,4% e somam R$ 9,1 trilhões no 1º semestre de 2026](https://www.anbima.com.br/pt_br/imprensa/investimentos-das-pessoas-fisicas-crescem-6-4-e-somam-r-9-1-trilhoes-no-1-semestre-de-2026.htm)
- XP Inc., resultados 2T26: [release (Poder360)](https://static.poder360.com.br/uploads/2026/08/balanco-xp-2o-tri-2026.pdf); [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/xp-inc-reports-second-quarter-200500550.html); [Economic News Brasil](https://economicnewsbrasil.com.br/2026/08/18/xp-r-2-2-trilhoes-clientes-crescem-1/); [Brasil Inovador](https://brasilinovador.com.br/xp-inc-registra-receita-de-r-51-bi-e-lucro-ajustado-de-r-14-bi-no-segundo-trimestre-de-2026/)
- Open Finance, números: [ABBC: 211 milhões de consentimentos](https://abbc.org.br/open-finance-chega-a-211-milhoes-de-consentimentos-ativos/); [Let's Money: 208 milhões e governança](https://www.letsmoney.com.br/noticias/open-finance-208-milhoes-consentimentos-governanca/)
- Open Finance, regras: [Mattos Filho: renovação de consentimento](https://www.mattosfilho.com.br/unico/bcb-renovacao-open-finance/); [Finsiders: fim do limite de 12 meses](https://finsidersbrasil.com.br/regulamentacao/bc-acaba-com-limite-de-12-meses-para-compartilhamento-de-dados-no-open-finance); [Agência Gov](https://agenciagov.ebc.com.br/noticias/202310/bc-simplifica-renovacao-de-consentimentos-no-open-finance-e-amplia-prazo-de-validade-do-compartilhamento); [Voto BCB 94/2024](https://normativos.bcb.gov.br/Votos/BCB/202494/Voto_do_BC_94_2024.pdf); [InfoMoney: 6 mitos](https://www.infomoney.com.br/?p=1935017); [Revista PGBC](https://revistapgbc.bcb.gov.br/revista/issue/download/38/213); [Let's Money: BC quer proibir venda de dados](https://www.letsmoney.com.br/noticias/bc-proibir-venda-dados-open-finance/)
- Open Finance, investimentos: [Contábeis: 4ª fase](https://www.contabeis.com.br/noticias/61743/4a-fase-do-open-finance-inclui-compartilhamento-de-investimentos/); [InfoMoney: investimentos e seguros](https://www.infomoney.com.br/?p=1864084)
- XP e Open Finance: [Forbes (2022)](https://forbes.com.br/forbes-money/2022/10/xp-entra-no-open-finance-para-personalizar-investimentos-dos-clientes/); [BP Money: Open Investments (2024)](https://bpmoney.com.br/mercado/open-investiments-entra-em-vigor-em-maio-xp-se-prepara); [Startupi: Fliper (2020)](https://startupi.com.br/xp-compra-participacao-na-fintech-fliper-e-se-antecipa-ao-movimento-de-open-banking-no-brasil/)
- Concorrência: [Gorila para advisors](https://gorila.com.br/para-advisors); [NeoFeed: Gorila capta R$ 100 milhões e quer virar sócia de escritórios](https://neofeed.com.br/startups/gorila-capta-r-100-milhoes-e-quer-virar-socia-de-escritorios-de-investimentos); [B3 Bora Investir: apps que consolidam carteira](https://borainvestir.b3.com.br/objetivos-financeiros/investir-melhor/organize-seus-investimentos-4-apps-que-consolidam-sua-carteira/)

**Ressalvas dos dados:**
- As fontes divergem no total de consentimentos do Open Finance: 211 milhões em mai/26 pela ABBC e 208,79 milhões em jul/26 pelo dashboard oficial. Usamos o número oficial mais recente.
- A definição de "ativos de clientes" varia entre os releases da XP.
- As dores do assessor descritas na seção 2 são hipóteses: validar com entrevistas.
