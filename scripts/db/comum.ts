/**
 * Funções compartilhadas pelos scripts de banco (seed, preparar, exportar).
 *
 * Importa o seed.ts de cada módulo direto, e não o index.ts: o index carrega
 * código do Next (next/headers etc.), que não roda fora do servidor Next.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/core/db";
import { semearAgenda } from "@/modules/agenda/seed";
import { semearAssessor } from "@/modules/assessor/seed";
import { semearCliente } from "@/modules/cliente/seed";
import { semearIntegracoes } from "@/modules/integracoes/seed";
import { semearUsuarios } from "@/modules/usuarios/seed";
import { type Aleatorio, criarAleatorio } from "@/shared/aleatorio";
import type { ContextoSeed } from "@/shared/contexto-seed";

export const SEMENTE_PADRAO = 42;

/** Onde ficam os dados exportados (um arquivo JSON por tabela, versionado no git). */
export const PASTA_DADOS = path.join(process.cwd(), "dados", "seed");

/** Tabelas que nunca vão para o seed exportado (dados transitórios ou sensíveis). */
export const TABELAS_NAO_EXPORTADAS = new Set(["usuarios_sessoes", "usuarios_recuperacoes_senha"]);

/** Colunas exportadas vazias (null): dados pessoais que nunca vão para o git (LGPD). */
export const COLUNAS_APAGADAS_NA_EXPORTACAO: Record<string, readonly string[]> = {
  usuarios_dados_pessoais: ["celular"],
};

// Ordem importa: módulos que referenciam dados de outros vêm depois.
const MODULOS: readonly { nome: string; semear: (aleatorio: Aleatorio, contexto: ContextoSeed) => Promise<void> }[] = [
  { nome: "usuarios", semear: semearUsuarios },
  { nome: "cliente", semear: semearCliente },
  { nome: "assessor", semear: semearAssessor },
  { nome: "agenda", semear: semearAgenda },
  { nome: "integracoes", semear: semearIntegracoes },
];

type Registro = Record<string, unknown>;

export const cliente = db.$client;

/** Tabelas da aplicação (ignora as internas do SQLite e do Drizzle). */
export async function listarTabelas(): Promise<string[]> {
  const r = await cliente.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' " +
      "AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name",
  );
  return r.rows.map((linha) => String(linha.name));
}

export async function colunasDaTabela(tabela: string): Promise<{ nome: string; pk: number }[]> {
  const r = await cliente.execute(`PRAGMA table_info("${tabela}")`);
  return r.rows.map((linha) => ({ nome: String(linha.name), pk: Number(linha.pk) }));
}

export function arquivoDaTabela(tabela: string): string {
  return path.join(PASTA_DADOS, `${tabela}.json`);
}

/** Banco vazio = nenhuma tabela da aplicação tem registros. */
export async function bancoVazio(): Promise<boolean> {
  for (const tabela of await listarTabelas()) {
    const r = await cliente.execute(`SELECT 1 FROM "${tabela}" LIMIT 1`);
    if (r.rows.length > 0) return false;
  }
  return true;
}

async function carregarTabela(tabela: string): Promise<number> {
  const registros = JSON.parse(await readFile(arquivoDaTabela(tabela), "utf8")) as Registro[];
  if (registros.length === 0) return 0;

  const existentes = new Set((await colunasDaTabela(tabela)).map((c) => c.nome));
  const colunas = Object.keys(registros[0]).filter((c) => existentes.has(c));
  const ignoradas = Object.keys(registros[0]).filter((c) => !existentes.has(c));
  if (ignoradas.length > 0) {
    console.warn(`  ⚠ ${tabela}: colunas que não existem mais foram ignoradas: ${ignoradas.join(", ")}`);
  }

  const sql =
    `INSERT INTO "${tabela}" (${colunas.map((c) => `"${c}"`).join(", ")}) ` +
    `VALUES (${colunas.map(() => "?").join(", ")})`;
  await cliente.batch(
    registros.map((r) => ({ sql, args: colunas.map((c) => (r[c] ?? null) as never) })),
    "write",
  );
  return registros.length;
}

/** Contas já gravadas (geradas ou carregadas de dados/seed), para os seeds seguintes se ligarem a elas. */
async function contextoSeed(tabelas: readonly string[]): Promise<ContextoSeed> {
  if (!tabelas.includes("usuarios_contas")) return { contas: [] };
  const r = await cliente.execute("SELECT id, email, papel FROM usuarios_contas ORDER BY email");
  return { contas: r.rows.map((l) => ({ id: String(l.id), email: String(l.email), papel: String(l.papel) })) };
}

/**
 * Popula o banco (assume tabelas vazias). Para cada módulo: se houver dados
 * exportados de alguma tabela dele em dados/seed/, carrega o exportado; senão,
 * roda o gerador sintético do módulo (src/modules/<modulo>/seed.ts).
 */
export async function semearBanco(semente: number): Promise<void> {
  const tabelas = await listarTabelas();
  const aleatorio = criarAleatorio(semente);

  // Chaves estrangeiras desligadas durante a carga: a ordem dos arquivos não importa.
  await cliente.execute("PRAGMA foreign_keys = OFF");
  try {
    for (const { nome, semear } of MODULOS) {
      const doModulo = tabelas.filter(
        (t) => t.startsWith(`${nome}_`) && !TABELAS_NAO_EXPORTADAS.has(t),
      );
      const exportadas = doModulo.filter((t) => existsSync(arquivoDaTabela(t)));

      if (exportadas.length === 0) {
        await semear(aleatorio, await contextoSeed(tabelas));
        console.log(`✔ ${nome}: gerado (sintético)`);
        continue;
      }

      for (const tabela of exportadas) {
        const total = await carregarTabela(tabela);
        console.log(`✔ ${nome}: ${tabela} carregada de dados/seed (${total} registros)`);
      }
      for (const tabela of doModulo.filter((t) => !exportadas.includes(t))) {
        console.warn(`  ⚠ ${tabela}: sem dados exportados, ficou vazia (rode db:exportar depois de popular)`);
      }
    }
  } finally {
    await cliente.execute("PRAGMA foreign_keys = ON");
  }
}
