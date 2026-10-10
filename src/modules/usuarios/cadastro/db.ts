// Tabelas Drizzle do submódulo usuarios/cadastro. Prefixe as tabelas com "usuarios_".
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { usuariosContas } from "../perfis/db";

/** Dados pessoais da conta (1 por conta), separados das credenciais. */
export const usuariosDadosPessoais = sqliteTable("usuarios_dados_pessoais", {
  usuarioId: text("usuario_id")
    .primaryKey()
    .references(() => usuariosContas.id, { onDelete: "cascade" }),
  /** AAAA-MM-DD */
  nascimento: text("nascimento").notNull(),
  /** Só dígitos. Opcional no banco: o db:exportar não leva celular para o git. */
  celular: text("celular"),
  profissao: text("profissao").notNull(),
  estadoCivil: text("estado_civil", {
    enum: ["solteiro", "casado", "uniao-estavel", "divorciado"],
  }).notNull(),
  rendaFaixa: text("renda_faixa", { enum: ["ate-5k", "5k-15k", "15k-50k", "acima-50k"] }).notNull(),
  /** Quando aceitou o termo e qual versão (evidência de consentimento, LGPD). */
  consentimentoEm: text("consentimento_em").notNull(),
  consentimentoVersao: text("consentimento_versao").notNull(),
});
