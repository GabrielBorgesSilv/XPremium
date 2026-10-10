import { createClient } from "@libsql/client";

import { env } from "@/core/env";

async function main(): Promise<void> {
  if (!env.DATABASE_URL.startsWith("file:")) {
    throw new Error("A correção só aceita DATABASE_URL local no formato file:.");
  }

  const db = createClient({ url: env.DATABASE_URL });
  try {
    const invalidRoles = await db.execute(
      "SELECT papel FROM usuarios_contas WHERE papel NOT IN ('usuario', 'assessor', 'admin', 'cliente') LIMIT 1",
    );
    if (invalidRoles.rows.length > 0) {
      throw new Error("Há um papel desconhecido; nenhuma conta foi alterada.");
    }

    const result = await db.execute(
      "UPDATE usuarios_contas SET papel = 'usuario' WHERE papel = 'cliente'",
    );
    const remainingInvalid = await db.execute(
      "SELECT COUNT(*) AS total FROM usuarios_contas WHERE papel NOT IN ('usuario', 'assessor', 'admin')",
    );
    if (Number(remainingInvalid.rows[0].total) !== 0) {
      throw new Error("Ainda há papéis inválidos após a atualização.");
    }

    console.log(
      JSON.stringify({ status: "ok", contasClienteCorrigidas: Number(result.rowsAffected) }),
    );
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error("Falha ao corrigir papéis de login:", error);
  process.exitCode = 1;
});
