import "server-only";

import { randomUUID } from "node:crypto";

import { eq, or } from "drizzle-orm";

import { db } from "@/core/db";

import { agendaReunioes } from "./db";
import { conflitos, instanteDe, ladoDe, podeCancelar, podeResponder, somarMinutos } from "./regras";
import { JustificativaSchema, type Lado, NovaReuniaoSchema, type Reuniao } from "./schema";

/**
 * Operações da agenda com o banco. Recebem explicitamente QUEM está agindo (já autenticado
 * pelo service) e com QUEM ele pode marcar (vínculo). Testáveis com banco em memória.
 */

export type ResultadoAcao = { ok: true; id: string } | { ok: false; erro: string; campos?: Record<string, string> };

/** Quem age: o id da conta e o lado dele (assessor ou cliente). */
export type Ator = { id: string; lado: Lado };

const falha = (erro: string, campos?: Record<string, string>): ResultadoAcao => ({ ok: false, erro, campos });

/** Todas as reuniões em que o usuário participa, da mais cedo para a mais tarde. */
export async function reunioesDe(usuarioId: string): Promise<Reuniao[]> {
  const linhas = await db
    .select()
    .from(agendaReunioes)
    .where(or(eq(agendaReunioes.assessorId, usuarioId), eq(agendaReunioes.clienteId, usuarioId)));
  return linhas.sort((a, b) => a.inicio.localeCompare(b.inicio));
}

/** Reuniões do assessor OU do cliente (para checar conflito dos dois lados). */
async function reunioesDosDois(assessorId: string, clienteId: string): Promise<Reuniao[]> {
  return db
    .select()
    .from(agendaReunioes)
    .where(or(eq(agendaReunioes.assessorId, assessorId), eq(agendaReunioes.clienteId, clienteId)));
}

/** Cria a reunião como PENDENTE: quem convocou não precisa aceitar. */
export async function criar(
  ator: Ator,
  participantesPermitidos: ReadonlySet<string>,
  entrada: unknown,
  agora: string = new Date().toISOString(),
): Promise<ResultadoAcao> {
  const lido = NovaReuniaoSchema.safeParse(entrada);
  if (!lido.success) {
    const campos: Record<string, string> = {};
    for (const issue of lido.error.issues) campos[issue.path.join(".")] ??= issue.message;
    return falha("Revise os campos destacados.", campos);
  }
  const dados = lido.data;

  if (!participantesPermitidos.has(dados.participanteId)) {
    return falha("Você só pode marcar reunião com quem é vinculado a você.", { participanteId: "Escolha alguém da lista." });
  }

  const inicio = instanteDe(dados.data, dados.hora);
  if (Date.parse(inicio) <= Date.parse(agora)) {
    return falha("Escolha um horário no futuro.", { hora: "Esse horário já passou." });
  }
  const fim = somarMinutos(inicio, dados.duracaoMin);

  const assessorId = ator.lado === "ASSESSOR" ? ator.id : dados.participanteId;
  const clienteId = ator.lado === "CLIENTE" ? ator.id : dados.participanteId;

  if (conflitos({ assessorId, clienteId, inicio, fim }, await reunioesDosDois(assessorId, clienteId)).length > 0) {
    return falha("Já existe uma reunião pendente ou confirmada nesse horário para você ou para a outra pessoa.", {
      hora: "Horário ocupado.",
    });
  }

  const id = randomUUID();
  await db.insert(agendaReunioes).values({
    id,
    assessorId,
    clienteId,
    convocante: ator.lado,
    inicio,
    fim,
    motivoCategoria: dados.motivoCategoria,
    motivoDescricao: dados.motivoDescricao,
    modalidade: dados.modalidade,
    local: dados.modalidade === "PRESENCIAL" ? (dados.local ?? null) : null,
    status: "PENDENTE",
    justificativa: null,
    respondidaEm: null,
    criadoEm: agora,
  });
  return { ok: true, id };
}

async function buscar(id: string): Promise<Reuniao | null> {
  const [r] = await db.select().from(agendaReunioes).where(eq(agendaReunioes.id, id));
  return r ?? null;
}

/** Aceitar ou recusar: só o convidado. Ao aceitar, checa de novo o conflito de horário. */
export async function responder(
  ator: Ator,
  reuniaoId: string,
  aceitar: boolean,
  justificativa: unknown,
  agora: string = new Date().toISOString(),
): Promise<ResultadoAcao> {
  const r = await buscar(reuniaoId);
  // Reunião de outras pessoas: mesma resposta de "não encontrada", para não revelar que existe.
  if (!r || ladoDe(r, ator.id) === null) return falha("Reunião não encontrada.");
  if (!podeResponder(r, ator.id, agora)) return falha("Esta reunião não está aguardando a sua resposta.");

  if (aceitar) {
    const ocupado = conflitos(r, await reunioesDosDois(r.assessorId, r.clienteId), r.id);
    if (ocupado.length > 0) return falha("Você ou a outra pessoa já tem outra reunião nesse horário.");
    await db.update(agendaReunioes).set({ status: "ACEITA", respondidaEm: agora }).where(eq(agendaReunioes.id, r.id));
    return { ok: true, id: r.id };
  }

  const motivo = JustificativaSchema.safeParse(justificativa);
  if (!motivo.success) return falha(motivo.error.issues[0]?.message ?? "Motivo inválido.");
  await db
    .update(agendaReunioes)
    .set({ status: "RECUSADA", respondidaEm: agora, justificativa: motivo.data ?? null })
    .where(eq(agendaReunioes.id, r.id));
  return { ok: true, id: r.id };
}

/** Cancelar: pendente, só quem convocou; confirmada, qualquer participante. */
export async function cancelar(
  ator: Ator,
  reuniaoId: string,
  justificativa: unknown,
  agora: string = new Date().toISOString(),
): Promise<ResultadoAcao> {
  const r = await buscar(reuniaoId);
  if (!r || ladoDe(r, ator.id) === null) return falha("Reunião não encontrada.");
  if (!podeCancelar(r, ator.id, agora)) return falha("Você não pode cancelar esta reunião.");

  const motivo = JustificativaSchema.safeParse(justificativa);
  if (!motivo.success) return falha(motivo.error.issues[0]?.message ?? "Motivo inválido.");
  await db
    .update(agendaReunioes)
    .set({ status: "CANCELADA", respondidaEm: agora, justificativa: motivo.data ?? null })
    .where(eq(agendaReunioes.id, r.id));
  return { ok: true, id: r.id };
}
