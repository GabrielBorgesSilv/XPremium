/**
 * Regras puras da agenda: horários, conflitos e quem pode fazer o quê.
 * Sem banco: recebem as reuniões prontas, então são testáveis e reproduzíveis.
 */
import type { Lado, Reuniao } from "./schema";

/** Brasil sem horário de verão desde 2019: o horário de Brasília é sempre UTC−3. */
const OFFSET_BRASILIA = "-03:00";

/** Data e hora digitadas no horário de Brasília → instante ISO UTC. */
export function instanteDe(data: string, hora: string): string {
  return new Date(`${data}T${hora}:00${OFFSET_BRASILIA}`).toISOString();
}

export function somarMinutos(iso: string, minutos: number): string {
  return new Date(Date.parse(iso) + minutos * 60_000).toISOString();
}

/** Intervalos [início, fim) se cruzam? Encostar (uma acaba quando a outra começa) não conta. */
export function sobrepoe(a: { inicio: string; fim: string }, b: { inicio: string; fim: string }): boolean {
  return Date.parse(a.inicio) < Date.parse(b.fim) && Date.parse(b.inicio) < Date.parse(a.fim);
}

/** Reuniões que ocupam o horário: pendentes ou confirmadas. */
const ocupaHorario = (r: Reuniao) => r.status === "PENDENTE" || r.status === "ACEITA";

/**
 * Reuniões que conflitam com o horário pedido, para o assessor OU para o cliente.
 * `ignorarId`: a própria reunião, quando a checagem é feita ao aceitar.
 */
export function conflitos(
  pedido: { assessorId: string; clienteId: string; inicio: string; fim: string },
  existentes: readonly Reuniao[],
  ignorarId?: string,
): Reuniao[] {
  return existentes.filter(
    (r) =>
      r.id !== ignorarId &&
      ocupaHorario(r) &&
      (r.assessorId === pedido.assessorId || r.clienteId === pedido.clienteId) &&
      sobrepoe(r, pedido),
  );
}

/** Lado do usuário na reunião, ou null se ele não participa. */
export function ladoDe(r: Reuniao, usuarioId: string): Lado | null {
  if (r.assessorId === usuarioId) return "ASSESSOR";
  if (r.clienteId === usuarioId) return "CLIENTE";
  return null;
}

/** Quem foi convidado (não convocou) é quem precisa aceitar. */
export function ehConvidado(r: Reuniao, usuarioId: string): boolean {
  const lado = ladoDe(r, usuarioId);
  return lado !== null && lado !== r.convocante;
}

const jaComecou = (r: Reuniao, agora: string) => Date.parse(r.inicio) <= Date.parse(agora);

/** Só o convidado aceita ou recusa, e só enquanto pendente e antes do início. */
export function podeResponder(r: Reuniao, usuarioId: string, agora: string): boolean {
  return r.status === "PENDENTE" && ehConvidado(r, usuarioId) && !jaComecou(r, agora);
}

/** Pendente: só quem convocou cancela (o convidado recusa). Confirmada: qualquer participante. */
export function podeCancelar(r: Reuniao, usuarioId: string, agora: string): boolean {
  if (ladoDe(r, usuarioId) === null || jaComecou(r, agora)) return false;
  if (r.status === "PENDENTE") return !ehConvidado(r, usuarioId);
  return r.status === "ACEITA";
}

/** Como a reunião aparece para este usuário. */
export type Situacao = "AGUARDANDO_VOCE" | "AGUARDANDO_OUTRO" | "CONFIRMADA" | "RECUSADA" | "CANCELADA";

export function situacaoPara(r: Reuniao, usuarioId: string): Situacao {
  if (r.status === "PENDENTE") return ehConvidado(r, usuarioId) ? "AGUARDANDO_VOCE" : "AGUARDANDO_OUTRO";
  if (r.status === "ACEITA") return "CONFIRMADA";
  return r.status === "RECUSADA" ? "RECUSADA" : "CANCELADA";
}
