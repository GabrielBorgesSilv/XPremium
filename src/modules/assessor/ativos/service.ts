import "server-only";

import { clientesDoAtivo, resumirCarteiras } from "./calculos";
import {
  CARTEIRAS_DEMO,
  CLIENTES_DEMO,
  DEMO_AS_OF,
  NOTICIAS_DEMO,
  REFERENCIA_SERIE_DEMO,
  RESPOSTA_IA_DEMO,
} from "./demo";
import { avaliarFGC, type ExposicaoFGC, LIMITE_FGC, type SituacaoFGC } from "./fgc";
import { type AlertaAtivo, filtrarImpactos, ordenarComAlertas, resumirAlertas } from "./impactos";
import {
  type ClienteDoAtivo,
  type Cotacao,
  type FiltrosVisao,
  FiltrosVisaoSchema,
  type ImpactoNoticia,
  type OrigemDado,
  type Periodo,
  type ResumoAtivo,
  type ResumoCarteiras,
  type SeriePrecos,
} from "./schema";
import { calcularVariacao, gerarSerieSimulada, type Variacao } from "./serie";

export type LinhaAtivo = ResumoAtivo & {
  alerta: AlertaAtivo | null;
  /** Pior situação de FGC entre os clientes que têm este título (null se não há aviso). */
  fgc: SituacaoFGC | null;
};

export type ExposicaoFGCCliente = ExposicaoFGC & { nome: string };

export type ResumoFGC = {
  limite: number;
  /** Casos acima ou perto do limite, do maior valor descoberto para o menor. */
  exposicoes: ExposicaoFGCCliente[];
  clientesAcima: number;
  clientesPerto: number;
  totalDescoberto: number;
};

export type NoticiaDoAtivo = { impacto: ImpactoNoticia; titulo: string; fonte: string };

export type DetalheAtivo = {
  linha: LinhaAtivo;
  cotacao: Cotacao | null;
  clientes: (ClienteDoAtivo & { nome: string; fgc: ExposicaoFGC | null })[];
  serie: SeriePrecos | null;
  variacoes: Record<Periodo, Variacao | null>;
  noticias: NoticiaDoAtivo[];
  /** Notícias posicionadas no gráfico, já encaixadas num dia que existe na série. */
  marcadores: { data: string; direcao: ImpactoNoticia["direcao"]; titulo: string }[];
};

/** Data (AAAA-MM-DD) de um instante no fuso de Brasília. */
function diaEmBrasilia(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}

/** Último dia da série que não passa de `dia` (ex.: notícia de sábado cai na sexta). */
function encaixarNaSerie(dia: string, serie: SeriePrecos): string | null {
  const anteriores = serie.pontos.filter((p) => p.data <= dia);
  return anteriores.at(-1)?.data ?? null;
}

export type VisaoAtivos = {
  /** Origem dos dados da tela inteira; hoje sempre SIMULADO (dados de demonstração). */
  origem: OrigemDado;
  asOf: string;
  filtros: FiltrosVisao;
  /** Totais de todas as carteiras, sem filtro. */
  resumo: ResumoCarteiras;
  /** Linhas já filtradas e ordenadas (alertas primeiro). */
  linhas: LinhaAtivo[];
  numAtivosComAlerta: number;
  /** Impactos devolvidos pela IA e recusados pelo filtro (ex.: ativo fora da carteira). */
  impactosDescartados: number;
  fgc: ResumoFGC;
  detalhe: DetalheAtivo | null;
};

const NOMES_CLIENTES = new Map(CLIENTES_DEMO.map((c) => [c.id, c.nome]));
const nomeDoCliente = (id: string) => NOMES_CLIENTES.get(id) ?? id;

function resumirFGC(exposicoes: ExposicaoFGC[]): ResumoFGC {
  const clientes = (situacao: SituacaoFGC) =>
    new Set(exposicoes.filter((e) => e.situacao === situacao).map((e) => e.clienteId)).size;
  return {
    limite: LIMITE_FGC,
    exposicoes: exposicoes.map((e) => ({ ...e, nome: nomeDoCliente(e.clienteId) })),
    clientesAcima: clientes("ACIMA"),
    clientesPerto: clientes("PERTO"),
    totalDescoberto: exposicoes.reduce((soma, e) => soma + e.descoberto, 0),
  };
}

/** Pior situação de FGC entre as exposições que envolvem o título. */
function situacaoFGCDoTitulo(ticker: string, exposicoes: ExposicaoFGC[]): SituacaoFGC | null {
  const doTitulo = exposicoes.filter((e) => e.tickers.includes(ticker));
  if (doTitulo.some((e) => e.situacao === "ACIMA")) return "ACIMA";
  return doTitulo.length > 0 ? "PERTO" : null;
}

/**
 * Regras de negócio: investimentos dos clientes do assessor, vistos por ativo.
 * Recebe os parâmetros crus da URL e devolve a tela pronta.
 */
export async function obterVisaoAtivos(parametros: Record<string, string | string[] | undefined>): Promise<VisaoAtivos> {
  // TODO(M1/M3): só assessor autenticado, e só os clientes vinculados a ele. Hoje usa dados de demonstração.
  const filtros = FiltrosVisaoSchema.parse(parametros);
  const dados = CARTEIRAS_DEMO;

  const resumo = resumirCarteiras(dados);
  const tickersDaCarteira = new Set(resumo.ativos.map((a) => a.ativo.ticker));
  // TODO(M5): trocar a resposta fixa pela chamada ao agente de notícias.
  const { validos, descartados } = filtrarImpactos(RESPOSTA_IA_DEMO, tickersDaCarteira);
  const alertas = resumirAlertas(validos);
  const exposicoesFGC = avaliarFGC(dados);

  const todas: LinhaAtivo[] = resumo.ativos.map((a) => ({
    ...a,
    alerta: alertas.get(a.ativo.ticker) ?? null,
    fgc: situacaoFGCDoTitulo(a.ativo.ticker, exposicoesFGC),
  }));
  const linhas = ordenarComAlertas(
    todas.filter(
      (l) => (!filtros.categoria || l.ativo.categoria === filtros.categoria) && (!filtros.alerta || l.alerta !== null),
    ),
    alertas,
  );

  const selecionada = filtros.ativo ? todas.find((l) => l.ativo.ticker === filtros.ativo) : undefined;

  return {
    origem: "SIMULADO",
    asOf: DEMO_AS_OF,
    filtros,
    resumo,
    linhas,
    numAtivosComAlerta: alertas.size,
    impactosDescartados: descartados,
    fgc: resumirFGC(exposicoesFGC),
    detalhe: selecionada ? montarDetalhe(selecionada, exposicoesFGC) : null,
  };
}

function montarDetalhe(linha: LinhaAtivo, exposicoesFGC: ExposicaoFGC[]): DetalheAtivo {
  const { ticker } = linha.ativo;
  const cotacao = CARTEIRAS_DEMO.cotacoes.find((c) => c.ticker === ticker) ?? null;
  const noticias = new Map(NOTICIAS_DEMO.map((n) => [n.id, n]));

  // TODO(M2): buscar o histórico real; a série simulada é o fallback rotulado.
  const referencia = REFERENCIA_SERIE_DEMO[ticker] ?? cotacao?.preco;
  const serie = referencia === undefined ? null : gerarSerieSimulada(linha.ativo, referencia, DEMO_AS_OF.slice(0, 10));

  const noticiasDoAtivo: NoticiaDoAtivo[] = (linha.alerta?.impactos ?? []).map((impacto) => {
    const noticia = noticias.get(impacto.noticiaId);
    return { impacto, titulo: noticia?.titulo ?? "Notícia sem título", fonte: noticia?.fonte ?? "Fonte não informada" };
  });

  const marcadores = serie
    ? noticiasDoAtivo.flatMap(({ impacto, titulo }) => {
        const data = encaixarNaSerie(diaEmBrasilia(impacto.publicadoEm), serie);
        return data ? [{ data, direcao: impacto.direcao, titulo }] : [];
      })
    : [];

  return {
    linha,
    cotacao,
clientes: clientesDoAtivo(ticker, CARTEIRAS_DEMO).map((c) => ({
      ...c,
      nome: nomeDoCliente(c.clienteId),
      // Situação do cliente no emissor deste título (a regra do FGC é por instituição).
      fgc: exposicoesFGC.find((e) => e.clienteId === c.clienteId && e.emissor === linha.ativo.emissor) ?? null,
    })),
    serie,
    variacoes: {
      "7D": serie ? calcularVariacao(serie, "7D") : null,
      "30D": serie ? calcularVariacao(serie, "30D") : null,
    },
    noticias: noticiasDoAtivo,
    marcadores,
  };
}
