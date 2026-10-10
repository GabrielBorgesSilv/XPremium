import Link from "next/link";

import { CabecalhoPerfil, CardConta, CardDadosPessoais, CardSeguranca } from "@/app/_components/perfil";
import { buscarDadosPessoais, exigirPapel } from "@/modules/usuarios";

export default async function PerfilClientePage() {
  // O layout já exige login; aqui pegamos os dados do usuário logado.
  const usuario = await exigirPapel("usuario");
  const dados = await buscarDadosPessoais(usuario.id);

  return (
    <>
      <CabecalhoPerfil usuario={usuario} />

      <div className="xp-columns">
        <CardConta usuario={usuario} />
        <CardDadosPessoais dados={dados} mostrarRenda />
      </div>

      <section className="xp-card xp-section">
        <h2>Perfil de investidor</h2>
        <p className="xp-desc">
          Questionário sobre objetivos, prazo e tolerância a risco, usado pela sua assessoria para conhecer você.
        </p>
        <div className="xp-actions">
          <Link className="xp-btn" href="/cliente/anamnese">Ver questionário</Link>
        </div>
      </section>

      <CardSeguranca />
    </>
  );
}
