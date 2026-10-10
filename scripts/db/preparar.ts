/**
 * Roda antes do npm run dev / npm start (depois do drizzle-kit push):
 * se o banco estiver vazio, popula com o seed. Se já tiver dados, não mexe.
 */
import { SEMENTE_PADRAO, bancoVazio, semearBanco } from "./comum";

async function main() {
  if (!(await bancoVazio())) {
    console.log("✔ banco já tem dados; seed não executado (use db:reset para recomeçar)");
    return;
  }
  await semearBanco(SEMENTE_PADRAO);
  console.log("✔ banco criado e populado");
}

main().catch((erro: unknown) => {
  console.error("Falha ao preparar o banco:", erro);
  process.exit(1);
});
