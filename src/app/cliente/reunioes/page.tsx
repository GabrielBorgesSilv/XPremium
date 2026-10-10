import Link from "next/link";

import { exigirPapel } from "@/modules/usuarios";

import { REUNIOES } from "../_components/cenarios";

export default async function ReunioesPage() {
  await exigirPapel("usuario");

  return (
    <>
      <Link className="xp-back" href="/cliente">
        ← Meus investimentos
      </Link>
      <header className="xp-head">
        <div>
          <div className="xp-kicker">RELACIONAMENTO</div>
          <h1>Reuniões</h1>
          <p>Compromissos com a sua assessoria. Cada encontro trata só da sua carteira.</p>
        </div>
      </header>
      <section className="xp-card">
        <h2>Próximos encontros</h2>
        <ul className="xp-events xp-reunioes">
          {REUNIOES.map((reuniao) => (
            <li key={reuniao.titulo} className="xp-event">
              <span className="xp-event-date">
                <small>{reuniao.data.split(" ")[1]}</small>
                {reuniao.data.split(" ")[0]}
              </span>
              <div>
                <b>{reuniao.titulo}</b>
                <p>
                  {reuniao.hora} · {reuniao.detalhe}
                </p>
              </div>
              <span className={reuniao.status === "Confirmada" ? "xp-tag lime" : "xp-tag"}>{reuniao.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
