import { AgendaDoDia } from "@/features/dashboard/components/AgendaDoDia";
import { atividadesDaAgenda } from "@/features/dashboard/fixtures/atividades.fixture";

export default function AssessorPage() {
  return <AgendaDoDia atividades={atividadesDaAgenda} />;
}
