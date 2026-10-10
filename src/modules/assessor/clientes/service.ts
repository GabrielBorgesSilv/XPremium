import "server-only";

import type { DadosPessoais } from "@/modules/usuarios";

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
import { type ClienteVinculado, type FiltrosClientes, FiltrosClientesSchema } from "./schema";
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
  /** Cadastro pessoal do M1; null quando o cliente não preencheu. */
  cadastro: (DadosPessoais & { idade: number }) | null;
  carteira: CarteiraCliente;
  evolucao: EvolucaoCarteira;
  pontos: PontoDeAtencao[];
};

/** "João" e "joao" ficam iguais na busca. */
const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

/** Idade completa hoje (dado real do cadastro). */
function idade(nascimento: string): number {
  const [a, m, d] = nascimento.split("-").map(Number);
  const hoje = new Date();
  const aniversarioPassou = hoje.getMonth() + 1 > m || (hoje.getMonth() + 1 === m && hoje.getDate() >= d);
  return hoje.getFullYear() - a - (aniversarioPassou ? 0 : 1);
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
  const clientes = await listarClientesDoAssessor(await assessorAtual());
  const carregado = await carregarDadosCarteiras(new Set(clientes.map((c) => c.id)));
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

export type ResumoAssessor = {
  origem: OrigemDado;
  asOf: string;
  numClientes: number;
  /** Soma em reais das posições com cotação de todos os clientes vinculados. */
  patrimonioSobGestao: number;
  /** Clientes com algum ponto de atenção alto ou médio. */
  clientesComAtencao: number;
  ativosComAlerta: number;
  clientesAcimaFGC: number;
};

/** Números da carteira do assessor para o perfil, a partir dos mesmos cálculos das outras telas. */
export async function obterResumoAssessor(): Promise<ResumoAssessor> {
  const lista = await listarClientes({});
  const carregado = await carregarDadosCarteiras(new Set(lista.linhas.map((c) => c.id)));
  return {
    origem: lista.origem,
    asOf: lista.asOf,
    numClientes: lista.totalClientes,
    patrimonioSobGestao: lista.linhas.reduce((soma, c) => soma + c.patrimonio, 0),
    clientesComAtencao: lista.comAtencao,
    ativosComAlerta: carregado.alertas.size,
    clientesAcimaFGC: new Set(carregado.exposicoesFGC.filter((e) => e.situacao === "ACIMA").map((e) => e.clienteId)).size,
  };
}

/** Dash de um cliente; null se o cliente não existe ou não é vinculado a este assessor. */
export async function obterDashCliente(clienteId: string): Promise<DashCliente | null> {
  const cliente = await buscarClienteDoAssessor(await assessorAtual(), clienteId);
  if (!cliente) return null;

  const carregado = await carregarDadosCarteiras(new Set([cliente.id]));
  const carteira = resumirCarteiraCliente(cliente.id, carregado.dados);
  const titulo = (id: string) => carregado.noticias.get(id)?.titulo ?? "Notícia sem título";

  return {
    origem: carregado.origem,
    asOf: carregado.asOf,
    cliente: { id: cliente.id, nome: cliente.nome },
    cadastro: cliente.cadastro ? { ...cliente.cadastro, idade: idade(cliente.cadastro.nascimento) } : null,
    carteira,
    evolucao: evolucaoCarteira(carteira.posicoes, carregado.serieDe, carregado.dados.cambio),
    pontos: pontosDeAtencao(cliente.id, carteira, carregado.alertas, carregado.exposicoesFGC, titulo),
  };
}
