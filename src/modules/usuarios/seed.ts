import "server-only";

import { env } from "@/core/env";
import type { Aleatorio } from "@/shared/aleatorio";

import type { Papel } from "./perfis/schema";
import { criarUsuario } from "./perfis/service";

// Valor do .env.example: usado em desenvolvimento quando o .env não tem SENHA_DEMO.
const SENHA_DEMO_PADRAO = "demo-hubxp";
// Data fixa de criação: o banco gerado (e o db:exportar) não muda a cada reset.
const CRIADO_EM_SEED = "2026-10-10T00:00:00.000Z";

const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabi", "Hugo"] as const;
const SOBRENOMES = ["Souza", "Lima", "Costa", "Rocha", "Alves", "Martins", "Pereira"] as const;

// E-mails fixos para facilitar o login; domínio .test é reservado e nunca é real.
const CONTAS: readonly { email: string; papel: Papel }[] = [
  { email: "assessor@hubxp.test", papel: "assessor" },
  { email: "usuario1@hubxp.test", papel: "usuario" },
  { email: "usuario2@hubxp.test", papel: "usuario" },
  // usuario3 e usuario4: completam as 4 carteiras de demonstração do M4 (clientes do assessor).
  { email: "usuario3@hubxp.test", papel: "usuario" },
  { email: "usuario4@hubxp.test", papel: "usuario" },
];

/**
 * Dados sintéticos do módulo usuarios para desenvolvimento e demo (npm run db:seed).
 * Só dados fictícios (LGPD). Use `aleatorio` em vez de Math.random para que o
 * banco gerado seja igual para toda a equipe. Assume tabelas vazias.
 */
export async function semearUsuarios(aleatorio: Aleatorio): Promise<void> {
  const senha = senhaDemo();
  for (const { email, papel } of CONTAS) {
    await criarUsuario({
      id: aleatorio.uuid(),
      nome: `${aleatorio.escolher(NOMES)} ${aleatorio.escolher(SOBRENOMES)}`,
      email,
      senha,
      papel,
      criadoEm: CRIADO_EM_SEED,
      // Sal vindo do gerador com semente: mesmo hash a cada reset.
      salSenha: Buffer.from(aleatorio.uuid().replaceAll("-", ""), "hex"),
    });
  }
}

/** SENHA_DEMO do .env; em desenvolvimento, sem ela, usa o valor do .env.example e avisa. */
function senhaDemo(): string {
  if (env.SENHA_DEMO) return env.SENHA_DEMO;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Defina SENHA_DEMO no .env (obrigatória com NODE_ENV=production).");
  }
  console.warn(`  ⚠ SENHA_DEMO não definida no .env; usando "${SENHA_DEMO_PADRAO}" (valor do .env.example).`);
  return SENHA_DEMO_PADRAO;
}
