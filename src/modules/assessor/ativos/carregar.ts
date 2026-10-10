/**
 * Carrega os dados das carteiras de UM assessor, usados pela tela de ativos e pelo dash do cliente.
 * Ponto único para: restringir aos clientes vinculados, validar os impactos da IA e avaliar o FGC.
 */
import type { DadosCarteiras } from "./calculos";
import {
  CARTEIRAS_DEMO,
  DEMO_AS_OF,
  NOTICIAS_DEMO,
  type NoticiaDemo,
  REFERENCIA_SERIE_DEMO,
  RESPOSTA_IA_DEMO,
} from "./demo";
import { avaliarFGC, type ExposicaoFGC } from "./fgc";
import { type AlertaAtivo, filtrarImpactos, resumirAlertas } from "./impactos";
import type { Ativo, OrigemDado, SeriePrecos } from "./schema";
import { gerarSerieSimulada } from "./serie";

export type DadosCarregados = {
  /** Só as posições dos clientes permitidos. */
  dados: DadosCarteiras;
  origem: OrigemDado;
  asOf: string;
  alertas: Map<string, AlertaAtivo>;
  impactosDescartados: number;
  exposicoesFGC: ExposicaoFGC[];
  noticias: Map<string, NoticiaDemo>;
  /** Série para o gráfico; null quando o ativo não tem referência de preço/taxa. */
  serieDe: (ativo: Ativo) => SeriePrecos | null;
};

export function carregarDadosCarteiras(clientesPermitidos: ReadonlySet<string>): DadosCarregados {
  // TODO(banco): ler posições do banco; TODO(M2): cotações e histórico reais.
  const dados: DadosCarteiras = {
    ...CARTEIRAS_DEMO,
    posicoes: CARTEIRAS_DEMO.posicoes.filter((p) => clientesPermitidos.has(p.clienteId)),
  };

  // A IA só pode alertar ativos que estes clientes têm.
  const tickersDosClientes = new Set(dados.posicoes.map((p) => p.ticker));
  // TODO(M5): trocar a resposta fixa pela chamada ao agente de notícias.
  const { validos, descartados } = filtrarImpactos(RESPOSTA_IA_DEMO, tickersDosClientes);

  const ate = DEMO_AS_OF.slice(0, 10);
  const serieDe = (ativo: Ativo): SeriePrecos | null => {
    const referencia =
      REFERENCIA_SERIE_DEMO[ativo.ticker] ?? dados.cotacoes.find((c) => c.ticker === ativo.ticker)?.preco;
    return referencia === undefined ? null : gerarSerieSimulada(ativo, referencia, ate);
  };

  return {
    dados,
    origem: "SIMULADO",
    asOf: DEMO_AS_OF,
    alertas: resumirAlertas(validos),
    impactosDescartados: descartados,
    exposicoesFGC: avaliarFGC(dados),
    noticias: new Map(NOTICIAS_DEMO.map((n) => [n.id, n])),
    serieDe,
  };
}
