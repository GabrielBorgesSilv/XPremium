"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { DetalheAtivo, Moeda } from "@/modules/assessor";
import { formatarMoeda, formatarMoedaCompacta, formatarNumero } from "@/shared/formatar";

const COR_MARCADOR = { POSITIVO: "#176b50", NEGATIVO: "#b4362e", INDEFINIDO: "#9a9a94" } as const;

type Props = {
  pontos: { data: string; valor: number }[];
  /** TAXA mostra "% a.a."; PRECO mostra moeda. */
  medida: "PRECO" | "TAXA";
  moeda: Moeda;
  /** Nome da série no tooltip e na descrição acessível (ex.: "Preço", "Patrimônio"). */
  nome: string;
  descricao: string;
  marcadores?: DetalheAtivo["marcadores"];
};

/** "2026-10-09" → "09/10", sem passar por Date (evita erro de fuso). */
const diaMes = (data: string) => `${data.slice(8, 10)}/${data.slice(5, 7)}`;

/** Gráfico de linha de 30 dias usado no painel do ativo e no dash do cliente. */
export function GraficoLinha({ pontos, medida, moeda, nome, descricao, marcadores = [] }: Props) {
  const taxa = medida === "TAXA";
  const formatarValor = (valor: number) => (taxa ? `${formatarNumero(valor, 2)}% a.a.` : formatarMoeda(valor, moeda));
  // Valores grandes (patrimônio) não cabem no eixo por extenso: "R$ 1,2 mi".
  const compacto = !taxa && moeda === "BRL" && pontos.some((p) => p.valor >= 100_000);

  return (
    <>
      <div className="xp-chart-box" role="img" aria-label={descricao}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pontos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#ecece8" vertical={false} />
            <XAxis dataKey="data" tickFormatter={diaMes} tick={{ fontSize: 9, fill: "#969691" }} minTickGap={24} />
            <YAxis
              domain={["auto", "auto"]}
              width={compacto ? 72 : 64}
              tick={{ fontSize: 9, fill: "#969691" }}
              tickFormatter={(valor: number) => (compacto ? formatarMoedaCompacta(valor) : formatarNumero(valor, 2))}
            />
            <Tooltip
              formatter={(valor) => [formatarValor(Number(valor)), nome]}
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
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#111"
              strokeWidth={2}
              dot={false}
              // Sem animação: com ela, a linha às vezes ficava parada no início ao trocar de ativo.
              isAnimationActive={false}
            />
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
