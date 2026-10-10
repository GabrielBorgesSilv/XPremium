/**
 * Clientes FICTÍCIOS de demonstração e o vínculo com o assessor, usados enquanto as contas (M1)
 * e o vínculo assessor ↔ cliente (M1/M3) não estão na develop. Nenhum dado é real (LGPD).
 */
import type { CadastroCliente, ClienteVinculado } from "./schema";

/** Assessor usado enquanto não há login (M1). */
export const ASSESSOR_DEMO_ID = "assessor-demo";

export const CLIENTES_DEMO: (ClienteVinculado & { assessorId: string; cadastro: CadastroCliente })[] = [
  {
    id: "cli-1",
    nome: "Ana Martins",
    assessorId: ASSESSOR_DEMO_ID,
    cadastro: { nascimento: "1968-03-14", profissao: "Médica", estadoCivil: "casado", rendaFaixa: "acima-50k" },
  },
  {
    id: "cli-2",
    nome: "Bruno Lima",
    assessorId: ASSESSOR_DEMO_ID,
    cadastro: { nascimento: "1985-11-02", profissao: "Engenheiro de software", estadoCivil: "uniao-estavel", rendaFaixa: "15k-50k" },
  },
  {
    id: "cli-3",
    nome: "Carla Souza",
    assessorId: ASSESSOR_DEMO_ID,
    cadastro: { nascimento: "1992-07-21", profissao: "Designer", estadoCivil: "solteiro", rendaFaixa: "5k-15k" },
  },
  {
    id: "cli-4",
    nome: "Diego Rocha",
    assessorId: ASSESSOR_DEMO_ID,
    cadastro: { nascimento: "1979-01-30", profissao: "Empresário", estadoCivil: "divorciado", rendaFaixa: "acima-50k" },
  },
];
