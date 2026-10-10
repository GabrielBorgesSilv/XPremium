/**
 * Apaga o arquivo do banco SQLite local (usado por npm run db:reset).
 * Só atua em DATABASE_URL do tipo file:, para nunca apagar um banco remoto.
 */
import { rm } from "node:fs/promises";

import { env } from "@/core/env";

const url = env.DATABASE_URL;
if (!url.startsWith("file:")) {
  console.error("DATABASE_URL não é um arquivo local (file:); nada foi apagado.");
  process.exit(1);
}

async function main() {
  const arquivo = url.slice("file:".length);
  // O SQLite pode deixar arquivos auxiliares ao lado do banco.
  for (const sufixo of ["", "-journal", "-wal", "-shm"]) {
    await rm(arquivo + sufixo, { force: true });
  }
  console.log(`✔ banco apagado (${arquivo})`);
}

main().catch((erro: unknown) => {
  console.error("Falha ao apagar o banco:", erro);
  process.exit(1);
});
