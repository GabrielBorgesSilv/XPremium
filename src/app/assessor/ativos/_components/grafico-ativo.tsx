"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DetalheAtivo, SeriePrecos } from "@/modules/assessor";
import { formatarMoeda, formatarNumero } from "@/shared/formatar";

const COR_MARCADOR = { POSITIVO: "#176b50", NEGATIVO: "#b4362e", INDEFINIDO: "#9a9a94" } as const;

type Props = { serie: SeriePrecos; marcadores: DetalheAtivo["marcadores"] };

/** "2026-10-09" → "09/10", sem passar por Date (evita erro de fuso). */
const diaMes = (data: string) => `${data.slice(8, 10)}/${data.slice(5, 7)}`;

export function GraficoAtivo({ serie, marcadores }: Props) {
  const taxa = serie.medida === "TAXA";
  const formatarValor = (valor: number) => (taxa ? `${formatarNumero(valor, 2)}% a.a.` : formatarMoeda(valor, serie.moeda));

  return (
    <>
      <div className="xp-chart-box" role="img" aria-label={`Evolução ${taxa ? "da taxa" : "do preço"} de ${serie.ticker}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={serie.pontos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#ecece8" vertical={false} />
            <XAxis dataKey="data" tickFormatter={diaMes} tick={{ fontSize: 9, fill: "#969691" }} minTickGap={24} />
            <YAxis
              domain={["auto", "auto"]}
              width={64}
              tick={{ fontSize: 9, fill: "#969691" }}
              tickFormatter={(valor: number) => formatarNumero(valor, 2)}
            />
            <Tooltip
              formatter={(valor) => [formatarValor(Number(valor)), taxa ? "Taxa" : "Preço"]}
              labelFormatter={(data) => diaMes(String(data))}
            />
            {marcadores.map((m) => (
              <ReferenceLine
                key={`${m.data}-${m.titulo}`}
                x={m.data}
                stroke={COR_MARCADOR[m.direcao]}
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
            ))}
            <Line type="monotone" dataKey="valor" stroke="#111" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {marcadores.length > 0 && (
        <div className="xp-legend">
          <span><i style={{ background: COR_MARCADOR.POSITIVO }} />Notícia positiva</span>
          <span><i style={{ background: COR_MARCADOR.NEGATIVO }} />Notícia negativa</span>
          <span><i style={{ background: COR_MARCADOR.INDEFINIDO }} />Indefinida</span>
        </div>
      )}
    </>
  );
}
