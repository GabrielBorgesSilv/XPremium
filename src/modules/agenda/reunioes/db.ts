// Tabelas Drizzle do submódulo agenda/reunioes. Prefixe as tabelas com "agenda_".
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { CATEGORIAS_MOTIVO, type CategoriaMotivo, STATUS_REUNIAO } from "./schema";

/**
 * Reuniões entre um assessor e um cliente vinculados. Os ids são de contas do M1, sem chave
 * estrangeira entre módulos. Horários em ISO UTC.
 */
export const agendaReunioes = sqliteTable(
  "agenda_reunioes",
  {
    id: text("id").primaryKey(),
    assessorId: text("assessor_id").notNull(),
    clienteId: text("cliente_id").notNull(),
    convocante: text("convocante", { enum: ["ASSESSOR", "CLIENTE"] }).notNull(),
    inicio: text("inicio").notNull(),
    fim: text("fim").notNull(),
    motivoCategoria: text("motivo_categoria", {
      enum: Object.keys(CATEGORIAS_MOTIVO) as [CategoriaMotivo, ...CategoriaMotivo[]],
    }).notNull(),
    motivoDescricao: text("motivo_descricao").notNull(),
    modalidade: text("modalidade", { enum: ["ONLINE", "PRESENCIAL"] }).notNull(),
    local: text("local"),
    status: text("status", { enum: STATUS_REUNIAO }).notNull(),
    justificativa: text("justificativa"),
    respondidaEm: text("respondida_em"),
    criadoEm: text("criado_em").notNull(),
  },
  (t) => [
    index("agenda_reunioes_assessor_inicio").on(t.assessorId, t.inicio),
    index("agenda_reunioes_cliente_inicio").on(t.clienteId, t.inicio),
  ],
);
