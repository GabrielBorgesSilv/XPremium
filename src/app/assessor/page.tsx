import { AgendaDoDia } from "@/features/dashboard/components/AgendaDoDia";
import { atividadesDaAgenda } from "@/features/dashboard/fixtures/atividades.fixture";
import { exigirPapel } from "@/modules/usuarios";

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export default async function AssessorPage() {
  const usuario = await exigirPapel("assessor");
  return <AgendaDoDia atividades={atividadesDaAgenda} nome={primeiroNome(usuario.nome)} />;
}
