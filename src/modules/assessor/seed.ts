import "server-only";

import { db } from "@/core/db";
import type { Aleatorio } from "@/shared/aleatorio";
import type { ContextoSeed } from "@/shared/contexto-seed";

import { assessorPosicoes } from "./ativos/db";
import { CARTEIRAS_DEMO } from "./ativos/demo";
import { assessorVinculos } from "./clientes/db";

// Data fixa: o banco gerado (e o db:exportar) não muda a cada reset.
const CRIADO_EM_SEED = "2026-10-10T00:00:00.000Z";

/**
 * Dados sintéticos do módulo assessor para desenvolvimento e demo (npm run db:seed).
 * Só dados fictícios (LGPD). Assume tabelas vazias.
 *
 * Usa as contas já criadas pelo M1 (contexto): vincula todos os clientes de demo ao assessor de demo
 * e entrega as carteiras-modelo em ordem de e-mail (carteira-1 → usuario1, carteira-2 → usuario2...).
 */
export async function semearAssessor(aleatorio: Aleatorio, contexto: ContextoSeed): Promise<void> {
  void aleatorio; // nada sorteado aqui: as carteiras-modelo já são fixas
  const assessor = contexto.contas.find((c) => c.papel === "assessor");
  const clientes = contexto.contas.filter((c) => c.papel === "usuario");
  if (!assessor || clientes.length === 0) return;

  await db
    .insert(assessorVinculos)
    .values(clientes.map((c) => ({ clienteId: c.id, assessorId: assessor.id, criadoEm: CRIADO_EM_SEED })));

  const modelos = [...new Set(CARTEIRAS_DEMO.posicoes.map((p) => p.clienteId))];
  const dono = new Map(modelos.map((modelo, i) => [modelo, clientes[i]?.id]));
  const posicoes = CARTEIRAS_DEMO.posicoes.flatMap((p) => {
    const clienteId = dono.get(p.clienteId);
    return clienteId ? [{ clienteId, ticker: p.ticker, quantidade: p.quantidade }] : [];
  });
  if (posicoes.length > 0) await db.insert(assessorPosicoes).values(posicoes);
}
