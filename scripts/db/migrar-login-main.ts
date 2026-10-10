import { createClient } from "@libsql/client";

import { env } from "@/core/env";

type ContaLegada = {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: "cliente" | "usuario" | "assessor" | "admin";
  ativo: number;
  criado_em: string;
  id_externo: string | null;
  assessor_externo_id: string | null;
  cargo: string | null;
};

function converterPapel(perfil: ContaLegada["perfil"]): "usuario" | "assessor" | "admin" {
  return perfil === "cliente" ? "usuario" : perfil;
}

const tabelasCliente = [
  {
    nome: "cliente_anamnese",
    criacao: `CREATE TABLE cliente_anamnese_migracao (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      usuario_id TEXT NOT NULL,
      objetivo TEXT NOT NULL,
      horizonte TEXT NOT NULL,
      perfil_investidor TEXT DEFAULT 'moderado' NOT NULL,
      tolerancia_risco TEXT NOT NULL,
      idade INTEGER DEFAULT 0 NOT NULL,
      profissao TEXT DEFAULT '' NOT NULL,
      experiencia_mercado TEXT DEFAULT '' NOT NULL,
      tolerancia_risco_detalhada TEXT DEFAULT '' NOT NULL,
      objetivo_detalhado TEXT DEFAULT '' NOT NULL,
      alocacao_renda_fixa REAL DEFAULT 0 NOT NULL,
      alocacao_multimercado REAL DEFAULT 0 NOT NULL,
      alocacao_fiis REAL DEFAULT 0 NOT NULL,
      alocacao_renda_variavel REAL DEFAULT 0 NOT NULL,
      alocacao_internacional REAL DEFAULT 0 NOT NULL,
      situacao_financeira TEXT NOT NULL,
      renda_mensal REAL NOT NULL,
      patrimonio_atual REAL NOT NULL,
      atualizado_em TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    )`,
    colunas: [
      "id", "objetivo", "horizonte", "perfil_investidor", "tolerancia_risco", "idade",
      "profissao", "experiencia_mercado", "tolerancia_risco_detalhada", "objetivo_detalhado",
      "alocacao_renda_fixa", "alocacao_multimercado", "alocacao_fiis",
      "alocacao_renda_variavel", "alocacao_internacional", "situacao_financeira",
      "renda_mensal", "patrimonio_atual", "atualizado_em",
    ],
  },
  {
    nome: "cliente_open_finance",
    criacao: `CREATE TABLE cliente_open_finance_migracao (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      usuario_id TEXT NOT NULL,
      instituicao TEXT NOT NULL,
      tipo_conta TEXT DEFAULT '' NOT NULL,
      saldo_disponivel REAL DEFAULT 0 NOT NULL,
      fatura_atual REAL DEFAULT 0 NOT NULL,
      score_credito INTEGER DEFAULT 0 NOT NULL,
      data_autorizacao TEXT DEFAULT '' NOT NULL,
      portabilidade_em_andamento INTEGER DEFAULT false NOT NULL,
      detalhes_portabilidade TEXT,
      status TEXT NOT NULL,
      consentimento INTEGER DEFAULT false NOT NULL,
      ultimo_sync_em TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    )`,
    colunas: [
      "id", "instituicao", "tipo_conta", "saldo_disponivel", "fatura_atual",
      "score_credito", "data_autorizacao", "portabilidade_em_andamento",
      "detalhes_portabilidade", "status", "consentimento", "ultimo_sync_em",
    ],
  },
  {
    nome: "cliente_patrimonio",
    criacao: `CREATE TABLE cliente_patrimonio_migracao (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      usuario_id TEXT NOT NULL,
      instituicao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      valor_atual REAL NOT NULL,
      moeda TEXT DEFAULT 'BRL' NOT NULL,
      atualizado_em TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    )`,
    colunas: ["id", "instituicao", "categoria", "valor_atual", "moeda", "atualizado_em"],
  },
] as const;

function converterHashSenha(hash: string): string {
  const partes = /^(?:scrypt:)?([a-f\d]{32}):([a-f\d]{128})$/i.exec(hash);
  if (!partes) {
    throw new Error("Há uma conta com hash de senha incompatível; migração cancelada.");
  }
  return `scrypt$${partes[1].toLowerCase()}$${partes[2].toLowerCase()}`;
}

async function main(): Promise<void> {
  if (!env.DATABASE_URL.startsWith("file:")) {
    throw new Error("A migração só aceita DATABASE_URL local no formato file:.");
  }

  const db = createClient({ url: env.DATABASE_URL });
  const transaction = await db.transaction("write");
  let committed = false;
  try {
    const tables = await transaction.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('usuarios_auth', 'usuarios_contas')",
    );
    const tableNames = new Set(tables.rows.map((row) => String(row.name)));
    if (!tableNames.has("usuarios_auth")) {
      throw new Error("Tabela usuarios_auth não encontrada; nada foi migrado.");
    }
    if (tableNames.has("usuarios_contas")) {
      throw new Error("usuarios_contas já existe; migração interrompida sem alterar dados.");
    }

    const contasResult = await transaction.execute(
      `SELECT id, nome, email, senha_hash, perfil, ativo, criado_em,
              id_externo, assessor_externo_id, cargo
       FROM usuarios_auth ORDER BY id`,
    );
    const contas = contasResult.rows as unknown as ContaLegada[];
    if (contas.length === 0) {
      throw new Error("Nenhuma conta encontrada em usuarios_auth; nada foi migrado.");
    }
    const idsContas = new Set(contas.map((conta) => String(conta.id)));
    const registrosSemConta: Record<string, number> = {};

    for (const { nome } of tabelasCliente) {
      const found = await transaction.execute({
        sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        args: [nome],
      });
      if (found.rows.length !== 1) {
        throw new Error(`Tabela ${nome} não encontrada; migração cancelada.`);
      }
      const rows = await transaction.execute(`SELECT DISTINCT usuario_id FROM ${nome}`);
      registrosSemConta[nome] = rows.rows.filter(
        (row) => !idsContas.has(String(row.usuario_id)),
      ).length;
    }

    await transaction.execute(`CREATE TABLE usuarios_contas (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      id_externo TEXT,
      assessor_externo_id TEXT,
      cargo TEXT,
      ativo INTEGER NOT NULL DEFAULT true
    )`);
    await transaction.execute(`CREATE TABLE usuarios_sessoes (
      token_hash TEXT PRIMARY KEY NOT NULL,
      usuario_id TEXT NOT NULL REFERENCES usuarios_contas(id) ON DELETE CASCADE,
      expira_em TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )`);
    await transaction.execute(`CREATE TABLE usuarios_dados_pessoais (
      usuario_id TEXT PRIMARY KEY NOT NULL REFERENCES usuarios_contas(id) ON DELETE CASCADE,
      nascimento TEXT NOT NULL,
      celular TEXT,
      profissao TEXT NOT NULL,
      estado_civil TEXT NOT NULL,
      renda_faixa TEXT NOT NULL,
      consentimento_em TEXT NOT NULL,
      consentimento_versao TEXT NOT NULL
    )`);
    await transaction.execute(`CREATE TABLE usuarios_recuperacoes_senha (
      token_hash TEXT PRIMARY KEY NOT NULL,
      usuario_id TEXT NOT NULL REFERENCES usuarios_contas(id) ON DELETE CASCADE,
      expira_em TEXT NOT NULL,
      criado_em TEXT NOT NULL
    )`);

    for (const conta of contas) {
      await transaction.execute({
        sql: `INSERT INTO usuarios_contas
          (id, nome, email, senha_hash, papel, criado_em, id_externo,
           assessor_externo_id, cargo, ativo)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          String(conta.id),
          conta.nome,
          conta.email.trim().toLowerCase(),
          converterHashSenha(conta.senha_hash),
          converterPapel(conta.perfil),
          conta.criado_em,
          conta.id_externo,
          conta.assessor_externo_id,
          conta.cargo,
          conta.ativo,
        ],
      });
    }

    for (const tabela of tabelasCliente) {
      const colunas = tabela.colunas.join(", ");
      await transaction.execute(tabela.criacao);
      await transaction.execute(
        `INSERT INTO ${tabela.nome}_migracao (id, usuario_id, ${colunas.slice(4)})
         SELECT id, CAST(usuario_id AS TEXT), ${colunas.slice(4)}
         FROM ${tabela.nome}`,
      );
      await transaction.execute(`DROP TABLE ${tabela.nome}`);
      await transaction.execute(
        `ALTER TABLE ${tabela.nome}_migracao RENAME TO ${tabela.nome}`,
      );
    }

    await transaction.commit();
    committed = true;
    const integrity = await db.execute("PRAGMA integrity_check");
    if (integrity.rows.length !== 1 || integrity.rows[0][Object.keys(integrity.rows[0])[0]] !== "ok") {
      throw new Error("Migração concluída, mas a verificação de integridade do SQLite falhou.");
    }
    const registrosSemContaTotal = Object.values(registrosSemConta).reduce(
      (soma, quantidade) => soma + quantidade,
      0,
    );
    console.log(JSON.stringify({
      status: "ok",
      contasMigradas: contas.length,
      sessoesCriadas: true,
      dadosPessoaisCriados: true,
      registrosClienteSemContaCorrespondentePreservados: registrosSemContaTotal,
    }));
  } catch (error) {
    if (!committed) {
      await transaction.rollback();
    }
    throw error;
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error("Falha na migração de autenticação:", error);
  process.exitCode = 1;
});
