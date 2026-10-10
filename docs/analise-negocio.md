# Análise de negócio: viabilidade e mercado do Hub XP (XPremium)

- **Data:** 10/10/2026
- **Autor:** Márcio (M1), com apoio do Claude Code
- **Status:** versão para o hackathon. Números de mercado com fonte no final; o que é hipótese está marcado como **hipótese**.

---

## Resumo para o pitch (cerca de 1 minuto)

1. **Problema.** O patrimônio do investidor está espalhado por vários bancos e corretoras. A XP enxerga só a parte que está com ela, e o assessor aborda o cliente sem saber onde está o resto do dinheiro.
2. **Solução.** O Hub XP é **gratuito para o investidor**: ele conecta as outras instituições pelo **Open Finance**, com consentimento, e recebe **uma visão consolidada do patrimônio** e **um assessor que já conhece a situação dele**.
3. **Para a XP.** Cada conexão **enriquece a base de dados** com consentimento e vira um contato qualificado: o assessor sabe o que o cliente tem, onde tem e o que oferecer.
4. **Por que agora.** A XP chegou a **R$ 2,2 trilhões** em ativos de clientes (+17% em 12 meses), mas a **base de clientes ativos cresceu só 1%** (4,77 milhões) e o número de assessores também (18,4 mil). O crescimento vem de mais patrimônio por cliente, não de clientes novos. O Hub ataca os três pontos: **clientes novos, patrimônio que está fora e produtividade do assessor**.
5. **Mercado.** Pessoas físicas têm **R$ 9,1 trilhões** investidos no Brasil. O varejo alta renda (**R$ 3,4 tri**) é o segmento que mais cresce, e o private soma **R$ 2,8 tri**. O Open Finance já tem cerca de **209 milhões de consentimentos ativos**, e as APIs de investimentos tiveram **4,9 bilhões de chamadas em um mês**.
6. **Diferencial.** Agregadores (Gorila, Kinvo) mostram os dados, mas não têm assessor para converter. Bancos têm assessor, mas não enxergam a carteira que está nos concorrentes. O Hub junta **assessor humano e dados** e usa a **prospecção com benchmark**: compara o prospect com clientes de perfil parecido para abordar melhor.
7. **Como medimos.** Captação líquida e AuC, conversão de leads, produtividade do assessor, cross-sell e ticket médio.

---

## 1. Objetivo do produto

O Hub XP aumenta a base de clientes e o patrimônio sob custódia da XP. Investidores de dentro e de fora da XP conectam suas outras instituições pelo **Open Finance**, com consentimento explícito, e recebem em troca **uma visão consolidada do patrimônio** e **um atendimento de assessor que já conhece a situação deles**.

Para a XP, esses dados (investimentos, contas, cartão, crédito e cadastro) **enriquecem a base** e qualificam cada contato. O assessor chega à conversa sabendo onde está o patrimônio, qual é o perfil e o que oferecer. O resultado esperado é mais conversão, captação, cross-sell e produtividade.

## 2. Problema e oportunidade

| Para quem | Problema hoje | O que o Hub muda |
|---|---|---|
| Investidor | Patrimônio em várias instituições, sem visão única; atendimento genérico | Visão consolidada gratuita e assessor que já conhece a carteira |
| Assessor | Aborda prospects e clientes sem saber o patrimônio de fora; muito tempo levantando informação | Chega à reunião com o diagnóstico pronto e um perfil de comparação (benchmark) |
| XP | Base de clientes estagnada (+1% a/a) enquanto o AuC cresce 17%; a parte do patrimônio que está fora é invisível | Novos leads qualificados, captação do patrimônio de fora, base enriquecida com consentimento |

**Leitura dos números da XP (2T26):** o crescimento recente vem de mais patrimônio por cliente e de captação dos clientes atuais. Crescer a base de clientes e a produtividade de 18,4 mil assessores, que também ficou estável, é o espaço onde o Hub atua.

## 3. Público e proposta de valor

| Segmento | Quem é | O que ganha | O que a XP ganha | Dono do relacionamento |
|---|---|---|---|---|
| **Prospect** | Investidor que ainda não é cliente XP | Visão consolidada e diagnóstico, sem precisar abrir conta | Lead qualificado com patrimônio conhecido | XP (assessor XP) |
| **Cliente XP** | Já investe na XP e tem patrimônio em outros lugares | Tudo em um só lugar, assessor com visão completa | Captação do que está fora (share of wallet) e cross-sell | XP ou escritório, conforme quem já atende |
| **Cliente de assessor parceiro** | Atendido por escritório credenciado (AAI) | O mesmo atendimento personalizado | AuC na plataforma e dados agregados | **Do escritório** se o assessor é terceiro; **da XP** se o assessor é da XP |

**Proposta de valor para o investidor:** visão consolidada e atendimento personalizado. **O cliente não paga nada.**

## 4. Como funciona o ciclo

```
Investidor ──consente (Open Finance)──▶ Hub consolida o patrimônio ──▶ visão única para o investidor
                                              │
                                              ▼
                     base XP enriquecida (perfil, onde está o dinheiro, crédito, renda)
                                              │
                                              ▼
       assessor recebe: diagnóstico + benchmark (clientes de perfil parecido) + notícias relevantes
                                              │
                                              ▼
              abordagem personalizada ──▶ conta aberta / portabilidade ──▶ captação (AuC) e cross-sell
```

- **Agent bancário:** importa e normaliza os dados das instituições.
- **Agent de notícias:** relaciona o mercado com a carteira para embasar a conversa.
- **Prospecção com benchmark:** compara o prospect com perfis de clientes existentes.

No MVP do hackathon, a integração bancária real está fora de escopo (documento da equipe). Os dados do Open Finance são simulados.

## 5. Modelo de negócio

- **O investidor não paga.** A receita vem do que a XP já ganha sobre o patrimônio e os produtos: taxas de administração e de distribuição de fundos, corretagem, spread de renda fixa, previdência, crédito e câmbio.
- **Lógica de retorno:**

```
Receita incremental ≈ (patrimônio captado pelo Hub) × (receita anual da XP por real sob custódia)
Custo                ≈ desenvolvimento e operação + tempo de assessor + aquisição de usuários
```

- **Funil a medir (hipótese a validar no piloto):**

| Etapa | Pergunta |
|---|---|
| Visitante → conexão Open Finance | Quantos aceitam conectar? |
| Conexão → lead qualificado | Quantos têm patrimônio e perfil relevantes? |
| Lead → reunião | O assessor consegue conversar? |
| Reunião → conta aberta / portabilidade | Quantos trazem dinheiro? |
| Conta → AuC captado em 90 dias | Quanto trazem? |

Os valores de conversão e de receita por real sob custódia **não foram levantados** nesta análise. Devem vir dos dados internos da XP (o release trimestral traz receita e ativos de clientes) ou de um piloto.

## 6. Mercado (dados atuais)

| Indicador | Valor | Fonte |
|---|---|---|
| Investimentos de pessoas físicas | **R$ 9,1 tri** (jun/26), +6,4% no semestre | ANBIMA |
| Varejo alta renda | **R$ 3,4 tri** (36,9%), maior crescimento: +7,8% | ANBIMA |
| Private (acima de R$ 5 mi) | **R$ 2,8 tri** (30,3%), +5,2%; contas de 166,8 mil para 203,5 mil (+22%) | ANBIMA |
| Varejo tradicional | **R$ 3,0 tri**, +6,1% | ANBIMA |
| Brasileiros com algum investimento | **60,6 milhões** (36% dos adultos); 8,7 milhões de novos investidores previstos em 2026 | ANBIMA / Datafolha (Raio X 2026) |
| Open Finance: consentimentos ativos | cerca de **209 milhões** (jul/26); cerca de 126 milhões de clientes únicos (mai/26) | Dashboard Open Finance (via Let's Money); ABBC |
| Open Finance: APIs de investimentos | **4,9 bilhões** de chamadas bem-sucedidas (mai/26) | ABBC |
| XP: ativos de clientes | **R$ 2,2 tri** (+17% a/a); captação líquida de cerca de R$ 28 bi no 2T26 | Release 2T26 |
| XP: clientes ativos / assessores | **4,77 mi** (+1% a/a) / **18,4 mil** (+1% a/a) | Release 2T26 |

**Onde focar primeiro:** varejo alta renda. É o maior segmento, o que mais cresce e onde o atendimento de assessor faz mais diferença na decisão.

## 7. Concorrência

| Tipo | Exemplos | Pontos fortes | Lacuna que o Hub explora |
|---|---|---|---|
| **Agregadores** | Gorila, Kinvo (grupo Gorila), Kokpyt, Smartbrain | Consolidação madura, integração com Open Finance e corretoras; o Gorila também atende escritórios | Mostram dados, mas não têm assessor nem produtos para fechar a venda |
| **Bancos e plataformas** | BTG Pactual, Itaú, Nubank | Base grande, assessoria (BTG, Itaú), portabilidade via B3 | Atendimento centrado na própria custódia; pouca visão do patrimônio que está nos concorrentes |
| **A própria XP** | Open Finance no app (desde 2022), Planejamento Financeiro no HUB (2024), Fliper (consolidação, 2020) | Já é participante do Open Finance e já tem peças de consolidação | **Cuidado com sobreposição.** O Hub deve se posicionar como evolução centrada no assessor e na prospecção, reaproveitando o que já existe, e não como um app paralelo. |

**Diferenciais definidos pela equipe:**
1. **Assessor humano + dados.** O dado vira conversa e venda, não só um gráfico.
2. **Prospecção com benchmark.** O assessor aborda o prospect com base em clientes de perfil parecido.

## 8. Regulação e LGPD: viabilidade do consentimento único

**O que vale hoje (fontes no final):**
- **Finalidade e escopo.** No Open Finance, o cliente consente para uma **finalidade específica**, com os dados especificados. A instituição só pode usar os dados para essa finalidade.
- **Prazo.** O limite de 12 meses deixou de existir (Resolução Conjunta nº 7/2023). O prazo pode ser maior desde que compatível com a finalidade, e a renovação ficou mais simples.
- **Revogação.** O cliente pode revogar a qualquer momento.
- **Venda e repasse.** Vender dados a terceiros é proibido. Perfilamento por desvio de finalidade exige cautela, segundo parecer jurídico do BC.
- **Proposta do BC em 2026.** Prevê vedar o repasse de dados transacionais "puros" a empresas não reguladas e criar o modelo "instituição integradora + entidade parceira", com consentimento 1x1x1. O status final não foi confirmado nesta análise.
- **XP.** Já usa o Open Finance para "personalizar ofertas" (Forbes, 2022). O termo vigente da XP não pôde ser lido (acesso bloqueado) e precisa ser revisado pelo jurídico.

**Avaliação do consentimento único ("consolidar o patrimônio **e** receber atendimento de um assessor com base nesses dados"):**

| Aspecto | Avaliação |
|---|---|
| Coerência da finalidade | **Viável.** O valor que o cliente busca é o atendimento personalizado, então "consolidação + assessoria personalizada" pode ser uma finalidade única e honesta. |
| Clareza | Obrigatório deixar explícito, na tela de consentimento, que **um assessor vai entrar em contato com base nesses dados**, quais dados e por quanto tempo. |
| Limite | O consentimento único **não cobre** campanhas de marketing em massa, uso por outras empresas nem repasse. Isso exige consentimento separado ou não é permitido. |
| Minimização | Cartão, crédito e dados cadastrais aumentam o valor comercial, mas também o risco. Use só o que serve à finalidade declarada; por exemplo, crédito para diagnóstico e não para listas de ofertas genéricas. |
| **Escritórios parceiros (ponto de atenção)** | Se o assessor é de um escritório terceiro, **enviar dados brutos ao escritório** pode ser tratado como repasse a terceiro, ainda mais se a proposta de 2026 do BC estiver vigente. **Recomendação:** o escritório usa os dados **dentro da plataforma XP** (insights e diagnóstico, sem exportar), e o consentimento **nomeia o escritório** quando ele for o responsável pelo atendimento. |

**Conclusão:** o consentimento único é viável para o atendimento por assessor XP, desde que seja claro e restrito à assessoria. Para escritórios parceiros, é viável com dados mantidos na plataforma e o escritório identificado no consentimento. **Validar com o jurídico** antes de produção.

## 9. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Baixa adesão: o investidor não quer "entregar" os dados a uma corretora | Funil curto | Valor imediato antes de qualquer contato (visão consolidada e diagnóstico); linguagem clara; revogação fácil e visível |
| Percepção de "isca" comercial | Confiança e marca | Transparência no consentimento; frequência de contato limitada; o cliente escolhe o canal |
| Regulatório (finalidade, repasse a parceiros, proposta do BC) | Bloqueio ou multa | Finalidade bem escrita; dados ficam na plataforma; revisão jurídica; acompanhar o BC |
| Sobreposição com o que a XP já tem | Duplicação de esforço | Integrar com o Open Finance e o HUB existentes; foco no assessor |
| Qualidade e cobertura dos dados entre instituições | Diagnóstico errado | Normalização (agent bancário), aviso de cobertura parcial e de data dos dados |
| Capacidade dos assessores | Leads sem atendimento | Priorização por potencial (benchmark); distribuição para escritórios |
| Reação dos concorrentes (retenção, condições melhores) | Conversão menor | Diferencial em atendimento e produtos, não só em preço |

## 10. Veredito de viabilidade

| Dimensão | Avaliação | Por quê |
|---|---|---|
| Estratégica | **Alta** | Ataca o ponto fraco atual da XP: base e assessores estáveis, enquanto o AuC cresce |
| Mercado | **Alta** | R$ 9,1 tri em PF; alta renda é o segmento que mais cresce |
| Técnica | **Alta** | O Open Finance está maduro (cerca de 209 mi de consentimentos; APIs de investimentos em uso) e a XP já é participante |
| Regulatória | **Média** | Viável com consentimento claro; atenção a escritórios parceiros e à proposta do BC |
| Comercial (conversão) | **A validar** | Depende de dados de funil que só um piloto ou a base interna fornecem |

**Recomendação:** seguir, começando por um **piloto com assessores XP no varejo alta renda**, medindo o funil da seção 5. Os escritórios parceiros entram depois de validado o desenho de dados (na plataforma, sem exportação).

## 11. Métricas de sucesso

| Métrica | Como medir |
|---|---|
| Captação líquida / AuC | Patrimônio trazido por clientes que passaram pelo Hub (90 e 180 dias) |
| Conversão de leads | Conexões → contas abertas ou portabilidades |
| Produtividade do assessor | Reuniões qualificadas e captação por assessor, antes e depois |
| Cross-sell e ticket médio | Produtos por cliente e valor médio por cliente do Hub |
| Saúde do consentimento | Taxa de consentimento, revogações e renovações |

## 12. Perguntas em aberto

- Qual é a receita da XP por real sob custódia no segmento-alvo? Necessária para estimar o retorno.
- Texto final do consentimento e revisão jurídica, incluindo o termo atual da XP.
- Status da proposta do BC sobre parceiros (consentimento 1x1x1) e enquadramento dos escritórios AAI.
- Como integrar com o Open Finance e o HUB que a XP já tem.
- Metas do piloto (conversão e captação mínimas para escalar).

---

## Fontes

- ANBIMA: [Investimentos das pessoas físicas crescem 6,4% e somam R$ 9,1 trilhões no 1º semestre de 2026](https://www.anbima.com.br/pt_br/imprensa/investimentos-das-pessoas-fisicas-crescem-6-4-e-somam-r-9-1-trilhoes-no-1-semestre-de-2026.htm)
- ANBIMA / Datafolha, Raio X do Investidor 2026: [Safra, O Especialista](https://oespecialista.safra.com.br/anbima-investidor-brasileiro-2026/); [Viva](https://viva.com.br/dinheiro/pais-deve-ganhar-87-milhoes-de-novos-investidores-em-2026-calcula-anbima.html)
- XP Inc., resultados 2T26: [release (Poder360)](https://static.poder360.com.br/uploads/2026/08/balanco-xp-2o-tri-2026.pdf); [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/xp-inc-reports-second-quarter-200500550.html); [Economic News Brasil](https://economicnewsbrasil.com.br/2026/08/18/xp-r-2-2-trilhoes-clientes-crescem-1/); [Brasil Inovador](https://brasilinovador.com.br/xp-inc-registra-receita-de-r-51-bi-e-lucro-ajustado-de-r-14-bi-no-segundo-trimestre-de-2026/)
- Open Finance, números: [ABBC: 211 milhões de consentimentos](https://abbc.org.br/open-finance-chega-a-211-milhoes-de-consentimentos-ativos/); [Let's Money: 208 milhões e governança](https://www.letsmoney.com.br/noticias/open-finance-208-milhoes-consentimentos-governanca/); [Finsiders: 100 milhões de clientes](https://finsidersbrasil.com.br/economia-open/brasil-lidera-open-finance-no-mundo-com-100-milhoes-de-clientes/)
- Open Finance, regras: [Mattos Filho: renovação de consentimento](https://www.mattosfilho.com.br/unico/bcb-renovacao-open-finance/); [Finsiders: fim do limite de 12 meses](https://finsidersbrasil.com.br/regulamentacao/bc-acaba-com-limite-de-12-meses-para-compartilhamento-de-dados-no-open-finance); [Agência Gov](https://agenciagov.ebc.com.br/noticias/202310/bc-simplifica-renovacao-de-consentimentos-no-open-finance-e-amplia-prazo-de-validade-do-compartilhamento); [Voto BCB 94/2024](https://normativos.bcb.gov.br/Votos/BCB/202494/Voto_do_BC_94_2024.pdf); [InfoMoney: 6 mitos](https://www.infomoney.com.br/?p=1935017); [Revista PGBC](https://revistapgbc.bcb.gov.br/revista/issue/download/38/213); [Let's Money: BC quer proibir venda de dados](https://www.letsmoney.com.br/noticias/bc-proibir-venda-dados-open-finance/)
- Open Finance, investimentos: [Contábeis: 4ª fase](https://www.contabeis.com.br/noticias/61743/4a-fase-do-open-finance-inclui-compartilhamento-de-investimentos/); [InfoMoney: investimentos e seguros](https://www.infomoney.com.br/?p=1864084)
- XP e Open Finance: [Forbes (2022)](https://forbes.com.br/forbes-money/2022/10/xp-entra-no-open-finance-para-personalizar-investimentos-dos-clientes/); [BP Money: Open Investments (2024)](https://bpmoney.com.br/mercado/open-investiments-entra-em-vigor-em-maio-xp-se-prepara); [Startupi: Fliper (2020)](https://startupi.com.br/xp-compra-participacao-na-fintech-fliper-e-se-antecipa-ao-movimento-de-open-banking-no-brasil/)
- Concorrência: [B3 Bora Investir: apps que consolidam carteira](https://borainvestir.b3.com.br/objetivos-financeiros/investir-melhor/organize-seus-investimentos-4-apps-que-consolidam-sua-carteira/); [NeoFeed: Gorila capta R$ 100 milhões](https://neofeed.com.br/startups/gorila-capta-r-100-milhoes-e-quer-virar-socia-de-escritorios-de-investimentos); [Gorila para advisors](https://gorila.com.br/para-advisors); [B3: portabilidade de investimentos](https://www.b3.com.br/pt_br/produtos-e-servicos/central-depositaria/canal-com-investidores/portabilidade-de-investimentos/)

**Ressalvas dos dados:**
- As fontes divergem no total de consentimentos do Open Finance: 211 milhões em mai/26 pela ABBC e 208,79 milhões em jul/26 pelo dashboard oficial. Usamos o número oficial mais recente.
- Os números de usuários de Gorila e Kinvo encontrados são antigos (2022–2024) e não foram usados.
- A definição de "ativos de clientes" varia entre os releases da XP.
