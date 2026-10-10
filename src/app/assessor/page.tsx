import { exigirPapel } from "@/modules/usuarios";
import { Dashboard } from "@/shared/ui/dashboard";

export default async function AssessorPage() {
  const usuario = await exigirPapel("assessor");
  return <Dashboard role="assessor" userName={usuario.nome} />;
}
