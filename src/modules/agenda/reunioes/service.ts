import "server-only";

import { buscarAssessorDoCliente, listarClientesDoAssessor } from "@/modules/assessor";
import { buscarUsuarioPorId, exigirPapel } from "@/modules/usuarios";

import { type Ator, cancelar, criar, reunioesDe, responder, type ResultadoAcao } from "./acoes";
import { podeCancelar, podeResponder, situacaoPara, type Situacao } from "./regras";
import type { Reuniao } from "./schema";

/**
 * Regras de negócio da agenda, do ponto de vista de quem está logado.
 * A área (assessor ou cliente) define o lado do usuário; o vínculo vem do módulo assessor.
 */

export type AreaAgenda = "assessor" | "cliente";

export type Pessoa = { id: string; nome: string };

export type ReuniaoVista = Reuniao & {
  comQuem: Pessoa;
  situacao: Situacao;
  convocadaPorVoce: boolean;
  podeResponder: boolean;
  podeCancelar: boolean;
};

export type Agenda = {
  area: AreaAgenda;
  /** Instante (ISO) usado para classificar passado/futuro; a tela usa este, não o relógio. */
  agora: string;
  /** Com quem o usuário pode marcar: os clientes (assessor) ou o próprio assessor (cliente). */
  participantes: Pessoa[];
  reunioes: ReuniaoVista[];
};

async function atorDaArea(area: AreaAgenda): Promise<Ator> {
  // Sem login → /login; sem o papel → área do próprio usuário (regras do M1).
  const usuario = await exigirPapel(area === "assessor" ? "assessor" : "usuario");
  return { id: usuario.id, lado: area === "assessor" ? "ASSESSOR" : "CLIENTE" };
}

async function participantesDe(ator: Ator): Promise<Pessoa[]> {
  if (ator.lado === "ASSESSOR") return listarClientesDoAssessor(ator.id);
  const assessor = await buscarAssessorDoCliente(ator.id);
  return assessor ? [assessor] : [];
}

/** Agenda completa do usuário logado, com o que ele pode fazer em cada reunião. */
export async function obterAgenda(area: AreaAgenda): Promise<Agenda> {
  const ator = await atorDaArea(area);
  const [participantes, reunioes] = await Promise.all([participantesDe(ator), reunioesDe(ator.id)]);
  const agora = new Date().toISOString();

  // Nome de quem está do outro lado (inclui ex-vínculos, para o histórico não perder o nome).
  const nomes = new Map(participantes.map((p) => [p.id, p.nome]));
  const outros = [...new Set(reunioes.map((r) => (ator.lado === "ASSESSOR" ? r.clienteId : r.assessorId)))];
  await Promise.all(
    outros
      .filter((id) => !nomes.has(id))
      .map(async (id) => nomes.set(id, (await buscarUsuarioPorId(id))?.nome ?? "Conta removida")),
  );

  return {
    area,
    agora,
    participantes,
    reunioes: reunioes.map((r) => {
      const outroId = ator.lado === "ASSESSOR" ? r.clienteId : r.assessorId;
      return {
        ...r,
        comQuem: { id: outroId, nome: nomes.get(outroId) ?? "Conta removida" },
        situacao: situacaoPara(r, ator.id),
        convocadaPorVoce: r.convocante === ator.lado,
        podeResponder: podeResponder(r, ator.id, agora),
        podeCancelar: podeCancelar(r, ator.id, agora),
      };
    }),
  };
}

export async function criarReuniao(area: AreaAgenda, entrada: unknown): Promise<ResultadoAcao> {
  const ator = await atorDaArea(area);
  const permitidos = new Set((await participantesDe(ator)).map((p) => p.id));
  return criar(ator, permitidos, entrada);
}

export async function responderReuniao(
  area: AreaAgenda,
  reuniaoId: string,
  aceitar: boolean,
  justificativa: unknown,
): Promise<ResultadoAcao> {
  return responder(await atorDaArea(area), reuniaoId, aceitar, justificativa);
}

export async function cancelarReuniao(area: AreaAgenda, reuniaoId: string, justificativa: unknown): Promise<ResultadoAcao> {
  return cancelar(await atorDaArea(area), reuniaoId, justificativa);
}

/** Quantos convites esperam a resposta do usuário (para o menu). */
export async function contarPendentesParaMim(area: AreaAgenda): Promise<number> {
  const ator = await atorDaArea(area);
  const agora = new Date().toISOString();
  return (await reunioesDe(ator.id)).filter((r) => podeResponder(r, ator.id, agora)).length;
}
