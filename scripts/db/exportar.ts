/**
 * Exporta o banco atual para dados/seed/<tabela>.json: npm run db:exportar
 * O seed passa a carregar esses arquivos; commite-os para compartilhar com a equipe.
 *
 * LGPD: recusa exportar se alguma coluna de e-mail tiver domínio diferente de
 * .test (reservado, nunca real). Não imprime os valores, só tabela e coluna.
 * Colunas de COLUNAS_APAGADAS_NA_EXPORTACAO (ex.: celular) vão vazias.
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

import {
  COLUNAS_APAGADAS_NA_EXPORTACAO,
  PASTA_DADOS,
  TABELAS_NAO_EXPORTADAS,
  arquivoDaTabela,
  cliente,
  colunasDaTabela,
  listarTabelas,
} from "./comum";

async function main() {
  const tabelas = (await listarTabelas()).filter((t) => !TABELAS_NAO_EXPORTADAS.has(t));
  const exportacao = new Map<string, Record<string, unknown>[]>();
  const violacoes: string[] = [];

  for (const tabela of tabelas) {
    const colunas = await colunasDaTabela(tabela);
    const pks = colunas.filter((c) => c.pk > 0).sort((a, b) => a.pk - b.pk);
    const ordem = pks.length > 0 ? pks.map((c) => `"${c.nome}"`).join(", ") : "rowid";
    const r = await cliente.execute(`SELECT * FROM "${tabela}" ORDER BY ${ordem}`);
    const apagadas = new Set(COLUNAS_APAGADAS_NA_EXPORTACAO[tabela] ?? []);
    const registros = r.rows.map((linha) =>
      Object.fromEntries(colunas.map((c) => [c.nome, apagadas.has(c.nome) ? null : (linha[c.nome] ?? null)])),
    );

    for (const coluna of colunas.filter((c) => c.nome.toLowerCase().includes("email"))) {
      const fora = registros.filter((reg) => {
        const valor = reg[coluna.nome];
        return typeof valor === "string" && !valor.toLowerCase().endsWith(".test");
      }).length;
      if (fora > 0) violacoes.push(`${tabela}.${coluna.nome}: ${fora} e-mail(s) fora do domínio .test`);
    }
    exportacao.set(tabela, registros);
  }

  if (violacoes.length > 0) {
    console.error("Exportação recusada (LGPD): só e-mails fictícios @<algo>.test podem ir para o git.");
    for (const v of violacoes) console.error(`  ✖ ${v}`);
    console.error("Corrija ou apague esses registros e rode de novo.");
    process.exit(1);
  }

  // Exportação é um retrato completo: remove arquivos de tabelas que não existem mais.
  await mkdir(PASTA_DADOS, { recursive: true });
  for (const arquivo of await readdir(PASTA_DADOS)) {
    if (arquivo.endsWith(".json")) await rm(`${PASTA_DADOS}/${arquivo}`);
  }

  for (const [tabela, registros] of exportacao) {
    if (registros.length === 0) continue;
    // Um registro por linha: alterações de pessoas diferentes raramente conflitam no merge.
    const conteudo = `[\n${registros.map((r) => `  ${JSON.stringify(r)}`).join(",\n")}\n]\n`;
    await writeFile(arquivoDaTabela(tabela), conteudo);
    console.log(`✔ ${tabela}: ${registros.length} registros`);
  }
  console.log("Exportado para dados/seed/. Revise o diff e commite para compartilhar.");
}

main().catch((erro: unknown) => {
  console.error("Falha ao exportar:", erro);
  process.exit(1);
});
