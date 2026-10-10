// Tabelas Drizzle do submódulo assessor/ativos. Prefixe as tabelas com "assessor_".
import { primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Quanto cada cliente tem de cada ativo. O cliente é uma conta do M1 (sem chave estrangeira entre módulos);
 * o ativo é o ticker do cadastro de ativos (hoje de demonstração, depois do M2).
 */
export const assessorPosicoes = sqliteTable(
  "assessor_posicoes",
  {
    clienteId: text("cliente_id").notNull(),
    ticker: text("ticker").notNull(),
    quantidade: real("quantidade").notNull(),
  },
  (t) => [primaryKey({ columns: [t.clienteId, t.ticker] })],
);
