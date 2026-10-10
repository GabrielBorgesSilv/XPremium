import { exigirPapel } from "@/modules/usuarios";
import { Dashboard } from "@/shared/ui/dashboard";

export default async function ClientePage() {
  const usuario = await exigirPapel("usuario");
  return <Dashboard role="cliente" userName={usuario.nome} />;
}
