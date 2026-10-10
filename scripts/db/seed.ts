/**
 * Popula o banco: npm run db:seed [-- <semente>]
 * Usa os dados exportados em dados/seed/ e, onde não houver, os geradores
 * sintéticos de cada módulo. Assume tabelas vazias; para recomeçar use db:reset.
 */
import { SEMENTE_PADRAO, semearBanco } from "./comum";

const argumento = process.argv[2];
const semente = argumento === undefined ? SEMENTE_PADRAO : Number(argumento);
if (!Number.isInteger(semente)) {
  console.error(`Semente inválida: "${argumento}". Use um número inteiro.`);
  process.exit(1);
}

semearBanco(semente)
  .then(() => console.log(`Seed concluído (semente ${semente}).`))
  .catch((erro: unknown) => {
    console.error("Falha no seed:", erro);
    process.exit(1);
  });
