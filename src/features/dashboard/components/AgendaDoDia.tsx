"use client";

import { useState } from "react";

import {
  DIMENSAO_ROTULO,
  PERIODOS_AGENDA,
  filtrarAtividades,
  filtrarPorPeriodo,
  type Atividade,
  type Criticidade,
  type Dimensao,
  type PeriodoAgenda,
} from "../domain/atividades";

const DIMENSOES: (Dimensao | "TODAS")[] = [
  "TODAS",
  "PERFIL",
  "FLUXO",
  "PATRIMONIO",
  "IMOBILIARIO",
  "PASSIVOS",
  "TRIBUTACAO",
  "OBJETIVOS",
  "RELACIONAMENTO",
  "CARTEIRA",
];

function rotuloDimensao(valor: Dimensao | "TODAS"): string {
  return valor === "TODAS" ? "Todas" : DIMENSAO_ROTULO[valor];
}

function quando(emDias: number): string {
  if (emDias === 0) return "Hoje";
  if (emDias === 1) return "Amanhã";
  return `Em ${emDias} dias`;
}

export function AgendaDoDia({ atividades, nome }: { atividades: readonly Atividade[]; nome: string }) {
  const [periodo, setPeriodo] = useState<PeriodoAgenda>("HOJE");
  const [criticidade, setCriticidade] = useState<Criticidade | "TODAS">("TODAS");
  const [dimensao, setDimensao] = useState<Dimensao | "TODAS">("TODAS");
  const dias = PERIODOS_AGENDA.find((item) => item.id === periodo)?.dias ?? 0;
  const noPeriodo = filtrarPorPeriodo(atividades, dias);
  const dimensoesPresentes = DIMENSOES.filter(
    (valor) => valor === "TODAS" || noPeriodo.some((item) => item.dimensao === valor),
  );
  const visiveis = filtrarAtividades(noPeriodo, criticidade, dimensao);
  const contagem = {
    CRITICO: noPeriodo.filter((item) => item.criticidade === "CRITICO").length,
    ATENCAO: noPeriodo.filter((item) => item.criticidade === "ATENCAO").length,
    MENOR: noPeriodo.filter((item) => item.criticidade === "MENOR").length,
  };
  const faixa = PERIODOS_AGENDA.find((item) => item.id === periodo)?.rotulo.toLowerCase() ?? "hoje";

  return (
    <>
      <header className="xp-head">
        <div>
          <div className="xp-kicker">VISÃO DO ASSESSOR</div>
          <h1>Bom dia, {nome}</h1>
        </div>
      </header>

      <div className="xp-period" role="group" aria-label="Período do dashboard">
        {PERIODOS_AGENDA.map((item) => (
          <button
            key={item.id}
            type="button"
            className={periodo === item.id ? "active" : undefined}
            aria-pressed={periodo === item.id}
            onClick={() => setPeriodo(item.id)}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      <div className="xp-grid-stats xp-grid-day">
        {(
          [
            ["CRITICO", "Crítico", contagem.CRITICO],
            ["ATENCAO", "Atenção", contagem.ATENCAO],
            ["MENOR", "Menor criticidade", contagem.MENOR],
          ] as const
        ).map(([valor, rotulo, total]) => (
          <button
            key={valor}
            type="button"
            className={`xp-card xp-stat xp-task-stat ${valor.toLowerCase()}${criticidade === valor ? " active" : ""}`}
            aria-pressed={criticidade === valor}
            onClick={() => setCriticidade((atual) => (atual === valor ? "TODAS" : valor))}
          >
            <span className="xp-task-kicker">
              {rotulo}
              <span className={`xp-dot ${valor.toLowerCase()}`} aria-hidden="true" />
            </span>
            <strong>{total}</strong>
            <small>{faixa}</small>
          </button>
        ))}
      </div>

      <section className="xp-card" aria-labelledby="agenda-titulo">
        <h2 id="agenda-titulo">Atividades</h2>
        <p className="xp-desc">
          A ordem usa perfil, fluxo, patrimônio, imóveis, passivos, tributação, objetivos, relacionamento e carteira.
          Dentro de cada faixa, o caso mais grave aparece primeiro.
        </p>
        <div className="xp-filters" aria-label="Filtrar por dimensão">
          {dimensoesPresentes.map((valor) => (
            <button
              key={valor}
              type="button"
              className={`xp-filter${dimensao === valor ? " active" : ""}`}
              aria-label={`Dimensão ${rotuloDimensao(valor)}`}
              aria-pressed={dimensao === valor}
              onClick={() => setDimensao(valor)}
            >
              {rotuloDimensao(valor)}
            </button>
          ))}
        </div>

        {visiveis.length === 0 ? (
          <p className="xp-desc" role="status">
            Nenhuma atividade neste recorte.
          </p>
        ) : (
          <ol className="xp-task-list">
            {visiveis.map((atividade) => (
              <li key={atividade.id} className={`xp-task ${atividade.criticidade.toLowerCase()}`}>
                <div className="xp-task-time">
                  <b>{atividade.horario}</b>
                  <span>{quando(atividade.emDias)}</span>
                  <span>{atividade.compromisso}</span>
                </div>
                <div>
                  <div className="xp-task-meta">
                    <span className={`xp-tag ${atividade.criticidade.toLowerCase()}`}>{atividade.criticidadeRotulo}</span>
                    <span className="xp-tag">{atividade.dimensaoRotulo}</span>
                  </div>
                  <h3>{atividade.cliente}</h3>
                  <b>{atividade.titulo}</b>
                  <p>{atividade.detalhe}</p>
                  <p>Próxima ação: {atividade.acao}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
