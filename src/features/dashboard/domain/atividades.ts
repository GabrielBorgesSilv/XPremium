/**
 * Prioridade do dia do assessor.
 * Cada sinal nasce de um parâmetro patrimonial. A criticidade é a pior condição
 * daquele sinal; a lista sai do mais crítico para o de menor criticidade.
 */

export const LIMITE_FGC_REAIS = 250_000;

export const LIMITES = {
  reservaCriticaMeses: 3,
  reservaAtencaoMeses: 6,
  endividamentoCritico: 0.5,
  comprometimentoCritico: 0.35,
  comprometimentoAtencao: 0.25,
  poupancaAtencao: 0.1,
  fgcAlerta: 0.9,
  concentracaoEmissorCritica: 0.25,
  creditoPrivadoAtencao: 0.4,
  creditoPrivadoCritico: 0.55,
  desagioAtencao: 0.03,
  imobiliarioAtencao: 0.6,
  coberturaCritica: 0.7,
  coberturaAtencao: 1,
  prazoObjetivoCriticoMeses: 24,
  prazoObjetivoAtencaoMeses: 36,
} as const;

export type Criticidade = "CRITICO" | "ATENCAO" | "MENOR";

export type Dimensao =
  | "PERFIL"
  | "FLUXO"
  | "PATRIMONIO"
  | "IMOBILIARIO"
  | "PASSIVOS"
  | "TRIBUTACAO"
  | "OBJETIVOS"
  | "RELACIONAMENTO"
  | "CARTEIRA";

export const DIMENSAO_ROTULO: Record<Dimensao, string> = {
  PERFIL: "Perfil",
  FLUXO: "Fluxo",
  PATRIMONIO: "Patrimônio",
  IMOBILIARIO: "Imóveis",
  PASSIVOS: "Passivos",
  TRIBUTACAO: "Tributação",
  OBJETIVOS: "Objetivos",
  RELACIONAMENTO: "Relacionamento",
  CARTEIRA: "Carteira",
};

export const CRITICIDADE_ROTULO: Record<Criticidade, string> = {
  CRITICO: "Crítico",
  ATENCAO: "Atenção",
  MENOR: "Menor criticidade",
};

const ORDEM_CRITICIDADE: Record<Criticidade, number> = {
  CRITICO: 0,
  ATENCAO: 1,
  MENOR: 2,
};

export const PERIODOS_AGENDA = [
  { id: "HOJE", dias: 0, rotulo: "Hoje" },
  { id: "D7", dias: 7, rotulo: "7 dias" },
  { id: "D15", dias: 15, rotulo: "15 dias" },
  { id: "D30", dias: 30, rotulo: "30 dias" },
] as const;

export type PeriodoAgenda = (typeof PERIODOS_AGENDA)[number]["id"];

export type ClienteDoDia = {
  id: string;
  nome: string;
  /** Dias a partir de hoje. 0 entra só em Hoje; os demais períodos incluem o que veio antes. */
  emDias: number;
  horario: string;
  compromisso: string;
  suitabilityDesalinhado: boolean;
  reservaMeses: number;
  taxaPoupanca: number;
  endividamento: number;
  comprometimentoRenda: number;
  fgcCobertoReais: number;
  concentracaoEmissor: number;
  creditoPrivado: number;
  desagio: number;
  concentracaoImobiliaria: number;
  coberturaObjetivos: number;
  prazoObjetivoMeses: number;
  prejuizoCompensavel: boolean;
  realizacaoPrevista: boolean;
  eventoFamiliarAutorizado: boolean;
};

export type Atividade = {
  id: string;
  clienteId: string;
  cliente: string;
  emDias: number;
  horario: string;
  compromisso: string;
  dimensao: Dimensao;
  dimensaoRotulo: string;
  criticidade: Criticidade;
  criticidadeRotulo: string;
  titulo: string;
  detalhe: string;
  acao: string;
  peso: number;
};

type Sinal = {
  dimensao: Dimensao;
  criticidade: Exclude<Criticidade, "MENOR">;
  peso: number;
  titulo: string;
  detalhe: string;
  acao: string;
};

function reais(value: number): string {
  const [whole, fraction = "00"] = Math.abs(value).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${grouped},${fraction}`;
}

function pontos(value: number): string {
  return `${(value * 100).toFixed(1).replace(".", ",")}%`;
}

function sinaisDe(cliente: ClienteDoDia): Sinal[] {
  const sinais: Sinal[] = [];
  const descoberto = Math.max(0, cliente.fgcCobertoReais - LIMITE_FGC_REAIS);

  if (cliente.suitabilityDesalinhado) {
    sinais.push({
      dimensao: "PERFIL",
      criticidade: "CRITICO",
      peso: 90,
      titulo: "Carteira fora do perfil declarado",
      detalhe: "A tolerância a risco mudou e a alocação atual não acompanha o novo suitability.",
      acao: "Atualizar o suitability e revisar a carteira antes da conversa.",
    });
  }

  if (cliente.reservaMeses < LIMITES.reservaCriticaMeses) {
    sinais.push({
      dimensao: "FLUXO",
      criticidade: "CRITICO",
      peso: 100 - cliente.reservaMeses,
      titulo: "Reserva abaixo das despesas essenciais",
      detalhe: `A liquidez cobre ${cliente.reservaMeses.toFixed(1).replace(".", ",")} meses de despesas. O piso deste painel é ${LIMITES.reservaCriticaMeses} meses.`,
      acao: "Rever o caixa e separar a reserva antes de qualquer realocação.",
    });
  } else if (cliente.reservaMeses < LIMITES.reservaAtencaoMeses) {
    sinais.push({
      dimensao: "FLUXO",
      criticidade: "ATENCAO",
      peso: 40,
      titulo: "Reserva curta para o padrão da casa",
      detalhe: `A liquidez cobre ${cliente.reservaMeses.toFixed(1).replace(".", ",")} meses. A faixa de atenção vai até ${LIMITES.reservaAtencaoMeses} meses.`,
      acao: "Confirmar despesas essenciais e o prazo para recompor a reserva.",
    });
  }

  if (cliente.taxaPoupanca < LIMITES.poupancaAtencao && cliente.taxaPoupanca >= 0) {
    sinais.push({
      dimensao: "FLUXO",
      criticidade: "ATENCAO",
      peso: 25,
      titulo: "Poupança mensal baixa",
      detalhe: `A poupança líquida é ${pontos(cliente.taxaPoupanca)} da renda líquida.`,
      acao: "Olhar receitas, despesas e sazonalidade antes de propor novo aporte.",
    });
  }

  if (cliente.endividamento > LIMITES.endividamentoCritico) {
    sinais.push({
      dimensao: "PASSIVOS",
      criticidade: "CRITICO",
      peso: 80 + cliente.endividamento * 10,
      titulo: "Endividamento alto sobre os ativos",
      detalhe: `Passivos ÷ ativos = ${pontos(cliente.endividamento)}.`,
      acao: "Mapear taxas, indexadores, garantias e vencimentos antes de alongar risco.",
    });
  }

  if (cliente.comprometimentoRenda > LIMITES.comprometimentoCritico) {
    sinais.push({
      dimensao: "PASSIVOS",
      criticidade: "CRITICO",
      peso: 85,
      titulo: "Dívida consome boa parte da renda",
      detalhe: `O serviço mensal da dívida é ${pontos(cliente.comprometimentoRenda)} da renda.`,
      acao: "Comparar o custo da dívida com a liquidez disponível.",
    });
  } else if (cliente.comprometimentoRenda > LIMITES.comprometimentoAtencao) {
    sinais.push({
      dimensao: "PASSIVOS",
      criticidade: "ATENCAO",
      peso: 30,
      titulo: "Comprometimento de renda em observação",
      detalhe: `O serviço mensal da dívida é ${pontos(cliente.comprometimentoRenda)} da renda.`,
      acao: "Confirmar se o fluxo do mês cobre a parcela sem usar a reserva.",
    });
  }

  if (descoberto > 0) {
    sinais.push({
      dimensao: "CARTEIRA",
      criticidade: "CRITICO",
      peso: 95,
      titulo: "Parcela sem cobertura do FGC",
      detalhe: `${reais(cliente.fgcCobertoReais)} no mesmo emissor. A referência deste painel é ${reais(LIMITE_FGC_REAIS)} por CPF e instituição; ${reais(descoberto)} ficam descobertos.`,
      acao: "Revisar concentração e alternativas de reinvestimento em outro emissor.",
    });
  } else if (cliente.fgcCobertoReais >= LIMITE_FGC_REAIS * LIMITES.fgcAlerta) {
    sinais.push({
      dimensao: "CARTEIRA",
      criticidade: "ATENCAO",
      peso: 45,
      titulo: "FGC perto do limite do emissor",
      detalhe: `${reais(cliente.fgcCobertoReais)} de ${reais(LIMITE_FGC_REAIS)} na referência usada aqui.`,
      acao: "Evitar novo aporte neste emissor até recalcular principal e rendimentos.",
    });
  }

  if (cliente.concentracaoEmissor > LIMITES.concentracaoEmissorCritica) {
    sinais.push({
      dimensao: "CARTEIRA",
      criticidade: "CRITICO",
      peso: 70 + cliente.concentracaoEmissor * 20,
      titulo: "Concentração excessiva em um emissor",
      detalhe: `Um emissor representa ${pontos(cliente.concentracaoEmissor)} da carteira.`,
      acao: "Medir a exposição patrimonial e a parcela fora do FGC.",
    });
  }

  if (cliente.creditoPrivado > LIMITES.creditoPrivadoCritico) {
    sinais.push({
      dimensao: "CARTEIRA",
      criticidade: "CRITICO",
      peso: 75,
      titulo: "Sobre-exposição a crédito privado",
      detalhe: `Crédito privado é ${pontos(cliente.creditoPrivado)} da carteira. Over CP, neste painel, significa concentração acima do teto de atenção — a definição operacional ainda precisa ser confirmada.`,
      acao: "Olhar spread, garantia, subordinação, liquidez e risco de calote.",
    });
  } else if (cliente.creditoPrivado > LIMITES.creditoPrivadoAtencao) {
    sinais.push({
      dimensao: "CARTEIRA",
      criticidade: "ATENCAO",
      peso: 35,
      titulo: "Crédito privado acima da faixa de atenção",
      detalhe: `Crédito privado é ${pontos(cliente.creditoPrivado)} da carteira.`,
      acao: "Revisar qualidade de crédito e liquidez antes de manter a posição.",
    });
  }

  if (cliente.desagio >= LIMITES.desagioAtencao) {
    sinais.push({
      dimensao: "CARTEIRA",
      criticidade: "ATENCAO",
      peso: 38,
      titulo: "Deságio relevante em título",
      detalhe: `O preço de mercado está ${pontos(cliente.desagio)} abaixo da referência.`,
      acao: "Simular manter até o vencimento ou vender, com imposto e custo.",
    });
  }

  if (cliente.concentracaoImobiliaria > LIMITES.imobiliarioAtencao) {
    sinais.push({
      dimensao: "IMOBILIARIO",
      criticidade: "ATENCAO",
      peso: 32,
      titulo: "Patrimônio concentrado em imóveis",
      detalhe: `Imóveis líquidos representam ${pontos(cliente.concentracaoImobiliaria)} do patrimônio líquido.`,
      acao: "Conferir aluguel líquido, vacância, financiamento e custos.",
    });
  }

  if (
    cliente.coberturaObjetivos < LIMITES.coberturaCritica &&
    cliente.prazoObjetivoMeses <= LIMITES.prazoObjetivoCriticoMeses
  ) {
    sinais.push({
      dimensao: "OBJETIVOS",
      criticidade: "CRITICO",
      peso: 88,
      titulo: "Objetivo próximo sem capital suficiente",
      detalhe: `A cobertura é ${pontos(cliente.coberturaObjetivos)} e o prazo é ${cliente.prazoObjetivoMeses} meses.`,
      acao: "Revisar o caixa e o que pode ser liquidado sem penalidade relevante.",
    });
  } else if (
    cliente.coberturaObjetivos < LIMITES.coberturaAtencao &&
    cliente.prazoObjetivoMeses <= LIMITES.prazoObjetivoAtencaoMeses
  ) {
    sinais.push({
      dimensao: "OBJETIVOS",
      criticidade: "ATENCAO",
      peso: 36,
      titulo: "Objetivo ainda não coberto",
      detalhe: `A cobertura é ${pontos(cliente.coberturaObjetivos)} em ${cliente.prazoObjetivoMeses} meses.`,
      acao: "Ajustar o plano de aporte ou o prazo com o cliente.",
    });
  }

  if (cliente.prejuizoCompensavel && cliente.realizacaoPrevista) {
    sinais.push({
      dimensao: "TRIBUTACAO",
      criticidade: "ATENCAO",
      peso: 28,
      titulo: "Realização com prejuízo compensável",
      detalhe: "Há prejuízo compensável e uma venda prevista no horizonte da conversa.",
      acao: "Estimar o imposto e o custo de realizar antes de sugerir a troca.",
    });
  }

  if (cliente.eventoFamiliarAutorizado) {
    sinais.push({
      dimensao: "RELACIONAMENTO",
      criticidade: "ATENCAO",
      peso: 34,
      titulo: "Evento familiar autorizado para a conversa",
      detalhe: "O cliente autorizou tratar um evento familiar no planejamento.",
      acao: "Preparar a conversa de caixa e sucessão só com o que foi autorizado.",
    });
  }

  return sinais;
}

function atividadeMenor(cliente: ClienteDoDia): Atividade {
  return {
    id: `${cliente.id}-rotina`,
    clienteId: cliente.id,
    cliente: cliente.nome,
    emDias: cliente.emDias,
    horario: cliente.horario,
    compromisso: cliente.compromisso,
    dimensao: "RELACIONAMENTO",
    dimensaoRotulo: DIMENSAO_ROTULO.RELACIONAMENTO,
    criticidade: "MENOR",
    criticidadeRotulo: CRITICIDADE_ROTULO.MENOR,
    titulo: "Acompanhamento em dia",
    detalhe: "Reserva, dívida, FGC, objetivos e perfil não dispararam alerta neste cenário.",
    acao: "Conduzir a revisão combinada e registrar o próximo passo.",
    peso: 1,
  };
}

export function atividadesDoCliente(cliente: ClienteDoDia): Atividade[] {
  const sinais = sinaisDe(cliente);
  if (sinais.length === 0) return [atividadeMenor(cliente)];

  return sinais.map((sinal) => ({
    id: `${cliente.id}-${sinal.dimensao}-${sinal.titulo}`,
    clienteId: cliente.id,
    cliente: cliente.nome,
    emDias: cliente.emDias,
    horario: cliente.horario,
    compromisso: cliente.compromisso,
    dimensao: sinal.dimensao,
    dimensaoRotulo: DIMENSAO_ROTULO[sinal.dimensao],
    criticidade: sinal.criticidade,
    criticidadeRotulo: CRITICIDADE_ROTULO[sinal.criticidade],
    titulo: sinal.titulo,
    detalhe: sinal.detalhe,
    acao: sinal.acao,
    peso: sinal.peso,
  }));
}

export function atividadesDoDia(clientes: readonly ClienteDoDia[]): Atividade[] {
  return clientes
    .flatMap(atividadesDoCliente)
    .sort(
      (esquerda, direita) =>
        ORDEM_CRITICIDADE[esquerda.criticidade] - ORDEM_CRITICIDADE[direita.criticidade] ||
        direita.peso - esquerda.peso ||
        esquerda.cliente.localeCompare(direita.cliente, "pt") ||
        esquerda.titulo.localeCompare(direita.titulo, "pt"),
    );
}

export function filtrarPorPeriodo(atividades: readonly Atividade[], dias: number): Atividade[] {
  return atividades.filter((atividade) => atividade.emDias <= dias);
}

export function filtrarAtividades(
  atividades: readonly Atividade[],
  criticidade: Criticidade | "TODAS",
  dimensao: Dimensao | "TODAS",
): Atividade[] {
  return atividades.filter((atividade) => {
    const criticidadeOk = criticidade === "TODAS" || atividade.criticidade === criticidade;
    const dimensaoOk = dimensao === "TODAS" || atividade.dimensao === dimensao;
    return criticidadeOk && dimensaoOk;
  });
}
