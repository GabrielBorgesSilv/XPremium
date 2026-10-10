import "server-only";

import { carregarDadosCarteiras } from "../ativos/carregar";
import {
  type CarteiraCliente,
  evolucaoCarteira,
  type EvolucaoCarteira,
  pontosDeAtencao,
  type PontoDeAtencao,
  resumirCarteiraCliente,
} from "../ativos/carteira-cliente";
import type { OrigemDado } from "../ativos/schema";
import {
  type CadastroCliente,
  type ClienteVinculado,
  type FiltrosClientes,
  FiltrosClientesSchema,
} from "./schema";
import { assessorAtual, buscarClienteDoAssessor, listarClientesDoAssessor } from "./vinculo";

export type LinhaCliente = ClienteVinculado & {
  patrimonio: number;
  numAtivos: number;
  pontos: { alta: number; media: number; info: number };
  /** Frase do ponto de atenção mais grave (alta ou média), para a linha da lista. */
  principal: string | null;
};

export type ListaClientes = {
  origem: OrigemDado;
  asOf: string;
  filtros: FiltrosClientes;
  /** Total de clientes vinculados, antes dos filtros. */
  totalClientes: number;
  /** Clientes com algum ponto de atenção alto ou médio, antes dos filtros. */
  comAtencao: number;
  linhas: LinhaCliente[];
};

export type DashCliente = {
  origem: OrigemDado;
  asOf: string;
  cliente: ClienteVinculado;
  cadastro: CadastroCliente & { idade: number };
  carteira: CarteiraCliente;
  evolucao: EvolucaoCarteira;
  pontos: PontoDeAtencao[];
};

/** "João" e "joao" ficam iguais na busca. */
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

/** Idade completa na data de referência (não "hoje"), para o resultado ser reproduzível. */
function idadeEm(nascimento: string, referencia: string): number {
  const [an, mn, dn] = nascimento.split("-").map(Number);
  const [ar, mr, dr] = referencia.slice(0, 10).split("-").map(Number);
  return ar - an - (mr < mn || (mr === mn && dr < dn) ? 1 : 0);
}

function contarPontos(pontos: PontoDeAtencao[]) {
  return {
    alta: pontos.filter((p) => p.severidade === "ALTA").length,
    media: pontos.filter((p) => p.severidade === "MEDIA").length,
    info: pontos.filter((p) => p.severidade === "INFO").length,
  };
}

/** Lista dos clientes vinculados ao assessor, em ordem alfabética, com os pontos de atenção resumidos. */
export async function listarClientes(parametros: Record<string, string | string[] | undefined>): Promise<ListaClientes> {
  const filtros = FiltrosClientesSchema.parse(parametros);
  const clientes = listarClientesDoAssessor(assessorAtual());
  const carregado = carregarDadosCarteiras(new Set(clientes.map((c) => c.id)));
  const titulo = (id: string) => carregado.noticias.get(id)?.titulo ?? "Notícia sem título";

  const todas: LinhaCliente[] = clientes.map((cliente) => {
    const carteira = resumirCarteiraCliente(cliente.id, carregado.dados);
    const pontos = pontosDeAtencao(cliente.id, carteira, carregado.alertas, carregado.exposicoesFGC, titulo);
    const relevante = pontos.find((p) => p.severidade !== "INFO");
    return {
      ...cliente,
      patrimonio: carteira.total,
      numAtivos: carteira.posicoes.length,
      pontos: contarPontos(pontos),
      principal: relevante?.titulo ?? null,
    };
  });

  const temAtencao = (l: LinhaCliente) => l.pontos.alta + l.pontos.media > 0;
  const busca = filtros.busca ? normalizar(filtros.busca) : "";

  return {
    origem: carregado.origem,
    asOf: carregado.asOf,
    filtros,
    totalClientes: todas.length,
    comAtencao: todas.filter(temAtencao).length,
    linhas: todas.filter((l) => (!busca || normalizar(l.nome).includes(busca)) && (!filtros.atencao || temAtencao(l))),
  };
}

/** Dash de um cliente; null se o cliente não existe ou não é vinculado a este assessor. */
export async function obterDashCliente(clienteId: string): Promise<DashCliente | null> {
  const cliente = buscarClienteDoAssessor(assessorAtual(), clienteId);
  if (!cliente) return null;

  const carregado = carregarDadosCarteiras(new Set([cliente.id]));
  const carteira = resumirCarteiraCliente(cliente.id, carregado.dados);
  const titulo = (id: string) => carregado.noticias.get(id)?.titulo ?? "Notícia sem título";

  return {
    origem: carregado.origem,
    asOf: carregado.asOf,
    cliente: { id: cliente.id, nome: cliente.nome },
    cadastro: { ...cliente.cadastro, idade: idadeEm(cliente.cadastro.nascimento, carregado.asOf) },
    carteira,
    evolucao: evolucaoCarteira(carteira.posicoes, carregado.serieDe, carregado.dados.cambio),
    pontos: pontosDeAtencao(cliente.id, carteira, carregado.alertas, carregado.exposicoesFGC, titulo),
  };
}
