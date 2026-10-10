/**
 * Popula o banco com dados sintéticos: npm run db:seed [-- <semente>]
 * Cada módulo gera os próprios dados em src/modules/<modulo>/seed.ts.
 * Assume tabelas vazias; para recomeçar do zero use npm run db:reset.
 */
import { criarAleatorio } from "@/shared/aleatorio";

import { semearAssessor } from "@/modules/assessor/seed";
import { semearCliente } from "@/modules/cliente/seed";
import { semearIntegracoes } from "@/modules/integracoes/seed";
import { semearUsuarios } from "@/modules/usuarios/seed";

const SEMENTE_PADRAO = 42;

const argumento = process.argv[2];
const semente = argumento === undefined ? SEMENTE_PADRAO : Number(argumento);
if (!Number.isInteger(semente)) {
  console.error(`Semente inválida: "${argumento}". Use um número inteiro.`);
  process.exit(1);
}

// Ordem importa: módulos que referenciam dados de outros vêm depois.
const etapas = [
  ["usuarios", semearUsuarios],
  ["cliente", semearCliente],
  ["assessor", semearAssessor],
  ["integracoes", semearIntegracoes],
] as const;

async function main() {
  const aleatorio = criarAleatorio(semente);
  for (const [modulo, semear] of etapas) {
    await semear(aleatorio);
    console.log(`✔ ${modulo}`);
  }
  console.log(`Seed concluído (semente ${semente}).`);
}

main().catch((erro: unknown) => {
  console.error("Falha no seed:", erro);
  process.exit(1);
});
