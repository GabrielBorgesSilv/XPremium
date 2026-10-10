"use client";

import Link from "next/link";
import { useState } from "react";

function hojeLocal(): string {
  const data = new Date();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function CalendarioReuniao({
  assessorNome,
  assessorEmail,
}: {
  assessorNome: string;
  assessorEmail: string;
}) {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");

  function solicitarReuniao() {
    if (!data || !horario) {
      return;
    }

    const assunto = encodeURIComponent("Solicitação de reunião de assessoria");
    const corpo = encodeURIComponent(
      `Olá, ${assessorNome}!\n\nGostaria de solicitar uma reunião para ${data} às ${horario}.\n\nAguardo a confirmação.`,
    );
    window.location.href = `mailto:${assessorEmail}?subject=${assunto}&body=${corpo}`;
  }

  return (
    <>
      <div className="xp-head">
        <div>
          <div className="xp-kicker">RELACIONAMENTO</div>
          <h1>Agendar reunião</h1>
          <p>Escolha uma data e um horário para solicitar uma conversa com {assessorNome}.</p>
        </div>
        <Link className="xp-btn" href="/cliente" target="_self">← Voltar ao meu espaço</Link>
      </div>

      <section className="xp-card xp-calendar-card">
        <div className="xp-calendar-intro">
          <span className="xp-calendar-icon" aria-hidden="true">▦</span>
          <div>
            <h2>Calendário da assessoria</h2>
            <p>O horário será confirmado pelo assessor após o envio da solicitação.</p>
          </div>
        </div>
        <div className="xp-calendar-form">
          <label>
            Data desejada
            <input
              min={hojeLocal()}
              onChange={(event) => setData(event.target.value)}
              required
              type="date"
              value={data}
            />
          </label>
          <label>
            Horário preferido
            <select onChange={(event) => setHorario(event.target.value)} required value={horario}>
              <option value="">Selecione um horário</option>
              {["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((opcao) => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </label>
          <button
            className="xp-btn lime"
            disabled={!data || !horario}
            onClick={solicitarReuniao}
            type="button"
          >
            Enviar solicitação <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </>
  );
}
