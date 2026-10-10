import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clientePatrimonio = sqliteTable("cliente_patrimonio", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuarioId: text("usuario_id").notNull(),
  instituicao: text("instituicao").notNull(),
  categoria: text("categoria", {
    enum: ["renda_fixa", "renda_variavel", "fundos", "imoveis", "outros"],
  }).notNull(),
  valorAtual: real("valor_atual").notNull(),
  moeda: text("moeda").notNull().default("BRL"),
  atualizadoEm: text("atualizado_em")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});
