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

export type LinhaAtivo = ResumoAtivo & { alerta: AlertaAtivo | null };

export type NoticiaDoAtivo = { impacto: ImpactoNoticia; titulo: string; fonte: string };

export type DetalheAtivo = {
  linha: LinhaAtivo;
  cotacao: Cotacao | null;
  clientes: (ClienteDoAtivo & { nome: string })[];
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
  detalhe: DetalheAtivo | null;
};

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

  const todas: LinhaAtivo[] = resumo.ativos.map((a) => ({ ...a, alerta: alertas.get(a.ativo.ticker) ?? null }));
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
    detalhe: selecionada ? montarDetalhe(selecionada) : null,
  };
}

function montarDetalhe(linha: LinhaAtivo): DetalheAtivo {
  const { ticker } = linha.ativo;
  const cotacao = CARTEIRAS_DEMO.cotacoes.find((c) => c.ticker === ticker) ?? null;
  const nomes = new Map(CLIENTES_DEMO.map((c) => [c.id, c.nome]));
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
    clientes: clientesDoAtivo(ticker, CARTEIRAS_DEMO).map((c) => ({ ...c, nome: nomes.get(c.clienteId) ?? c.clienteId })),
    serie,
    variacoes: {
      "7D": serie ? calcularVariacao(serie, "7D") : null,
      "30D": serie ? calcularVariacao(serie, "30D") : null,
    },
    noticias: noticiasDoAtivo,
    marcadores,
  };
}
