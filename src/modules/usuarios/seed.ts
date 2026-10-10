import "server-only";

import { env } from "@/core/env";
import type { Aleatorio } from "@/shared/aleatorio";

import type { Papel } from "./perfis/schema";
import { criarUsuario } from "./perfis/service";

const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabi", "Hugo"] as const;
const SOBRENOMES = ["Souza", "Lima", "Costa", "Rocha", "Alves", "Martins", "Pereira"] as const;

// E-mails fixos para facilitar o login; domínio .test é reservado e nunca é real.
const CONTAS: readonly { email: string; papel: Papel }[] = [
  { email: "assessor@hubxp.test", papel: "assessor" },
  { email: "usuario1@hubxp.test", papel: "usuario" },
  { email: "usuario2@hubxp.test", papel: "usuario" },
];

/**
 * Dados sintéticos do módulo usuarios para desenvolvimento e demo (npm run db:seed).
 * Só dados fictícios (LGPD). Use `aleatorio` em vez de Math.random para que o
 * banco gerado seja igual para toda a equipe. Assume tabelas vazias.
 */
export async function semearUsuarios(aleatorio: Aleatorio): Promise<void> {
  if (!env.SENHA_DEMO) {
    throw new Error("Defina SENHA_DEMO no .env (veja .env.example).");
  }

  for (const { email, papel } of CONTAS) {
    await criarUsuario({
      id: aleatorio.uuid(),
      nome: `${aleatorio.escolher(NOMES)} ${aleatorio.escolher(SOBRENOMES)}`,
      email,
      senha: env.SENHA_DEMO,
      papel,
    });
  }
}
