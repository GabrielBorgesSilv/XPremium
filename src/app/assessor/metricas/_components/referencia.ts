export type ParametrosPainel = {
  reservaCriticaMeses: number;
  reservaAtencaoMeses: number;
  endividamentoPercent: number;
  comprometimentoPercent: number;
  poupancaPercent: number;
  imobiliarioPercent: number;
  coberturaPercent: number;
  emissorPercent: number;
  creditoAtencaoPercent: number;
  creditoCriticoPercent: number;
  desagioPercent: number;
  fgcPorInstituicao: number;
  fgcTetoQuatroAnos: number;
  fgcAlertaPercent: number;
  choqueJurosBp: number;
  quedaBolsaPercent: number;
};

export const PARAMETROS_INICIAIS: ParametrosPainel = {
  reservaCriticaMeses: 3,
  reservaAtencaoMeses: 6,
  endividamentoPercent: 50,
  comprometimentoPercent: 35,
  poupancaPercent: 10,
  imobiliarioPercent: 60,
  coberturaPercent: 70,
  emissorPercent: 25,
  creditoAtencaoPercent: 40,
  creditoCriticoPercent: 55,
  desagioPercent: 3,
  fgcPorInstituicao: 250_000,
  fgcTetoQuatroAnos: 1_000_000,
  fgcAlertaPercent: 90,
  choqueJurosBp: 200,
  quedaBolsaPercent: 20,
};

export const DIMENSOES_INVESTIDOR = [
  ["Perfil do investidor", "Idade, residência fiscal, profissão, dependentes, experiência financeira, tolerância e capacidade de assumir riscos"],
  ["Fluxo financeiro", "Receitas, despesas, poupança mensal, sazonalidade, reservas e compromissos"],
  ["Patrimônio financeiro", "Saldos, posições, ativos, custódias, instituições, preço de aquisição e movimentações"],
  ["Patrimônio imobiliário", "Valor de mercado, custo de aquisição, aluguel líquido, vacância, financiamento, IPTU e custos de manutenção"],
  ["Bens móveis", "Veículos, participações e outros bens relevantes, valor estimado e custos"],
  ["Passivos", "Financiamentos, empréstimos, taxas efetivas, indexadores, garantias e vencimentos"],
  ["Tributação", "Regime aplicável, IR, IOF, prejuízos compensáveis, custos fiscais e impactos sucessórios"],
  ["Objetivos", "Aposentadoria, educação, aquisição de bens, sucessão, renda passiva e necessidades de liquidez"],
  ["Relacionamento", "Preferências de contato, histórico de reuniões, eventos relevantes autorizados e próximos compromissos"],
] as const;

export const INDICADORES_PATRIMONIAIS = [
  ["Patrimônio líquido", "Ativos totais − passivos totais"],
  ["Liquidez imediata", "Recursos disponíveis sem perda material ou penalidade relevante"],
  ["Reserva financeira", "Recursos líquidos ÷ despesas essenciais mensais"],
  ["Índice de endividamento", "Passivos totais ÷ ativos totais"],
  ["Comprometimento de renda", "Serviço mensal da dívida ÷ renda mensal"],
  ["Taxa de poupança", "Poupança líquida mensal ÷ renda líquida mensal"],
  ["Concentração imobiliária", "Patrimônio imobiliário líquido ÷ patrimônio líquido total"],
  ["Yield imobiliário líquido", "Renda anual líquida do imóvel ÷ valor de mercado"],
  ["Cobertura de objetivos", "Patrimônio projetado disponível ÷ capital necessário para os objetivos"],
] as const;

export const METRICAS_CARTEIRA = [
  ["Rentabilidade", "Retorno nominal, real, líquido de impostos, acumulado, anualizado, TWR e XIRR"],
  ["Benchmarks", "Percentual do CDI, diferença para IPCA, Ibovespa, IMA-B e benchmarks internacionais adequados"],
  ["Risco", "Volatilidade, drawdown máximo, VaR, Expected Shortfall, beta e tracking error"],
  ["Eficiência", "Sharpe, Sortino, índice de informação e retorno por unidade de risco"],
  ["Diversificação", "Correlação, concentração por emissor, HHI e distribuição por classe, moeda e setor"],
  ["Renda fixa", "Duration, duration modificada, convexidade, spread de crédito, marcação a mercado, taxa contratada e taxa de mercado"],
  ["Liquidez", "Prazo de resgate, prazo de liquidação, liquidez sob estresse e percentual disponível em D+0 e D+1"],
  ["Tributação", "Impostos estimados, rentabilidade líquida, custo de realização, diferimento e compensações aplicáveis"],
  ["Exposição", "Prefixado, CDI/Selic, IPCA, câmbio, crédito privado, renda variável e exterior"],
] as const;

export const ALOCACAO_EXEMPLO = [
  { classe: "Pós-fixado", atual: 42, proposta: 28 },
  { classe: "Inflação", atual: 18, proposta: 22 },
  { classe: "Prefixado", atual: 12, proposta: 10 },
  { classe: "Crédito privado", atual: 15, proposta: 8 },
  { classe: "Renda variável", atual: 8, proposta: 18 },
  { classe: "Exterior", atual: 5, proposta: 14 },
] as const;

export const CALCULOS_SIMULACAO = [
  "Retorno esperado e distribuição de resultados, com premissas explícitas",
  "Matriz de correlação e covariância entre ativos",
  "Fronteira eficiente e otimização com restrições",
  "Risco de liquidez, crédito, mercado e concentração",
  "Impacto fiscal e custos de rebalanceamento",
  "Probabilidade estimada de atingir objetivos financeiros",
  "Comparação de cenários antes e depois de impostos e custos",
] as const;

export const FONTES_DADOS = [
  ["Fontes", "XP, Open Finance, B3, extratos externos, CRM, dados de mercado e informações patrimoniais"],
  ["Integração", "APIs, consentimentos, identificação de ativos, deduplicação, reconciliação e linhagem dos dados"],
  ["Motor", "Cálculos determinísticos, simulações, regras de risco, IA generativa e priorização de oportunidades"],
  ["Entrega", "Dashboard do assessor e relatório do investidor"],
] as const;

export const CAMPOS_REGISTRO = [
  "Instituição de origem",
  "Identificador do ativo",
  "Data de referência",
  "Moeda",
  "Quantidade",
  "Preço",
  "Valor",
  "Titularidade",
  "Status de conciliação",
  "Qualidade da informação",
] as const;

export const EVENTOS_RELACIONAMENTO = [
  ["Vencimento de CDB em 30 dias", "Reinvestimento alinhado à liquidez e aos objetivos", "Preparar alternativas comparáveis"],
  ["Concentração excessiva em emissor", "Exposição patrimonial e eventual parcela sem cobertura do FGC", "Revisar concentração"],
  ["Deságio relevante em título", "Avaliação de preço, taxa e retorno até o vencimento", "Simular manutenção versus venda"],
  ["Mudança de perfil de risco", "Possível desalinhamento da carteira", "Atualizar suitability"],
  ["Objetivo financeiro próximo", "Insuficiência potencial de recursos líquidos", "Revisar planejamento de caixa"],
  ["Evento familiar autorizado", "Necessidade de planejamento financeiro ou sucessório", "Preparar conversa contextualizada"],
] as const;

export const KPIS_SUCESSO = [
  ["Cobertura patrimonial", "Patrimônio consolidado ÷ patrimônio identificado"],
  ["Qualidade da conciliação", "Posições reconciliadas ÷ posições importadas"],
  ["Atualização dos dados", "Tempo desde a última atualização válida"],
  ["Tempo de preparação", "Minutos gastos antes de cada reunião"],
  ["Automação", "Tarefas concluídas automaticamente ÷ tarefas elegíveis"],
  ["Insights úteis", "Insights validados pelo assessor ÷ insights gerados"],
  ["Aderência ao perfil", "Carteiras conformes ao suitability ÷ carteiras avaliadas"],
  ["Resolução de alertas", "Alertas tratados dentro do prazo ÷ alertas gerados"],
  ["Engajamento", "Reuniões, retornos e planos acompanhados"],
  ["Qualidade das recomendações", "Recomendações aceitas, rejeitadas e justificadas, com acompanhamento posterior"],
] as const;

export const FASES = [
  ["1. Diagnóstico", "Mapeamento de dados, processos, fontes, indicadores e lacunas"],
  ["2. Consolidação", "Visão patrimonial com conciliação de posições"],
  ["3. Inteligência financeira", "Cálculo de métricas, FGC, concentração, ágio, deságio e break-even"],
  ["4. Simulação", "Comparação de carteiras e cenários de risco"],
  ["5. Copiloto do assessor", "Relatórios, preparação de reuniões, insights e CRM"],
  ["6. Governança e escala", "Monitoramento, auditoria, qualidade, segurança e indicadores operacionais"],
] as const;
