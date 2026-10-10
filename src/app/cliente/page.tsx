import { listarAnamnese } from "@/modules/cliente";
import { buscarDadosPessoais, exigirPapel } from "@/modules/usuarios";

import { PainelCliente } from "./_components/painel-cliente";

export default async function ClientePage() {
  const usuario = await exigirPapel("usuario");
  const [dados, anamnese] = await Promise.all([buscarDadosPessoais(usuario.id), listarAnamnese()]);
  return (
    <PainelCliente
      nome={usuario.nome}
      email={usuario.email}
      dados={dados}
      questionarioPreenchido={anamnese.length > 0}
    />
  );
}
