/** Cenários de referência do painel do cliente. Não são recomendação de investimento. */

export const PATRIMONIO_REFERENCIA = 1_240_000;

export const CENARIOS = [
  { id: "conservador", nome: "Conservador", probabilidade: 0.25, rendimento: 0.062 },
  { id: "base", nome: "Moderado", probabilidade: 0.55, rendimento: 0.091 },
  { id: "favoravel", nome: "Arrojado", probabilidade: 0.2, rendimento: 0.128 },
] as const;

export const INVESTIMENTOS_FUTUROS = [
  { nome: "Aporte mensal", quando: "Todo mês", valor: 4_500, destino: "Reserva e renda" },
  { nome: "Vencimento do título 2027", quando: "Em 14 meses", valor: 85_000, destino: "Reinvestir com liquidez" },
  { nome: "Previdência complementar", quando: "A partir de janeiro", valor: 1_200, destino: "Aposentadoria" },
] as const;

/** Divisão demonstrativa do patrimônio deste cliente. As frações somam 1. */
export const DIVISAO_PATRIMONIO = [
  { id: "cdi", nome: "CDI", icone: "%", fracao: 0.42 },
  { id: "imovel", nome: "Imóvel", icone: "⌂", fracao: 0.28 },
  { id: "acoes", nome: "Ações", icone: "↗", fracao: 0.15 },
  { id: "exterior", nome: "Exterior", icone: "◈", fracao: 0.1 },
  { id: "previdencia", nome: "Previdência", icone: "◉", fracao: 0.05 },
] as const;

export const REUNIOES = [
  { data: "14 out", hora: "10:30", titulo: "Revisão da carteira", detalhe: "Online, com a sua assessoria", status: "Confirmada" },
  { data: "21 out", hora: "14:00", titulo: "Planejamento dos próximos aportes", detalhe: "Online, investimentos futuros", status: "A confirmar" },
] as const;

/** Valor projetado em 12 meses no cenário informado. */
export function projetar(patrimonio: number, rendimento: number): number {
  return patrimonio * (1 + rendimento);
}

/** Rendimento esperado, ponderado pela probabilidade de cada cenário. */
export function rendimentoEsperado(): number {
  return CENARIOS.reduce((soma, cenario) => soma + cenario.probabilidade * cenario.rendimento, 0);
}
