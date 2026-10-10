// Tabelas Drizzle do submódulo usuarios/auth. Prefixe as tabelas com "usuarios_".
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { usuariosContas } from "../perfis/db";

/** Sessões ativas. O cookie guarda o token; aqui fica só o hash SHA-256 dele. */
export const usuariosSessoes = sqliteTable("usuarios_sessoes", {
  tokenHash: text("token_hash").primaryKey(),
  usuarioId: text("usuario_id")
    .notNull()
    .references(() => usuariosContas.id, { onDelete: "cascade" }),
  expiraEm: text("expira_em").notNull(),
  criadoEm: text("criado_em").notNull(),
});
