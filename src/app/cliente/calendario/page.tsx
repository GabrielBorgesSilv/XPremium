import Link from "next/link";

import { buscarAssessorDoUsuario, exigirPapel } from "@/modules/usuarios";

import { CalendarioReuniao } from "./calendario-reuniao";

export default async function CalendarioPage() {
  const usuario = await exigirPapel("usuario");

  const assessor = await buscarAssessorDoUsuario(usuario.id);
  if (!assessor) {
    return (
      <>
        <div className="xp-head">
          <div>
            <div className="xp-kicker">RELACIONAMENTO</div>
            <h1>Agendar reunião</h1>
            <p>Você ainda não tem um assessor associado à sua conta.</p>
          </div>
          <Link className="xp-btn" href="/cliente" target="_self">← Voltar ao meu espaço</Link>
        </div>
        <section className="xp-card xp-calendar-card">
          <p className="xp-placeholder">Entre em contato com a equipe para associar um assessor à sua conta.</p>
        </section>
      </>
    );
  }

  return <CalendarioReuniao assessorNome={assessor.nome} assessorEmail={assessor.email} />;
}
