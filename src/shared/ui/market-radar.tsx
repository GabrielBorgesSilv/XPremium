"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Alerta = {
  id: string;
  noticiaId: string;
  ticker: string;
  direcao: "positivo" | "negativo" | "misto" | "incerto";
  justificativa: string;
};

type NewsItem = {
  id: string;
  titulo: string;
  url: string;
  resumo: string | null;
  descricao: string | null;
  ticker: string | null;
  fonte: string;
  publicadoEm: string | null;
  origemAnalise: "openai" | "heuristica" | "nenhuma";
};

export type MarketRadarProps = {
  news: { items: NewsItem[]; updatedAt: string | null; status: "fresh" | "stale" | "unavailable" };
  alerts: { items: Alerta[]; status: "available" | "unavailable" };
  investments: { ticker: string; nome: string }[];
};

const PAGE_SIZE = 5;
const priority: Record<Alerta["direcao"], number> = { negativo: 0, positivo: 1, misto: 2, incerto: 3 };

function normalizarTicker(value: string): string {
  return value.trim().toUpperCase().replace(/\.SA$/, "");
}

function formatarData(value: string | null): string {
  if (!value) return "Data não informada";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Data inválida" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export function MarketRadar({ news, alerts, investments }: MarketRadarProps) {
  const [page, setPage] = useState(1);
  const investmentByTicker = new Map(investments.map((investment) => [normalizarTicker(investment.ticker), investment]));
  const alertByNewsId = new Map(alerts.items.map((alert) => [alert.noticiaId, alert]));
  const sortedNews = useMemo(() => news.items.filter((item) => alertByNewsId.has(item.id)).sort((a, b) => {
    const alertA = alertByNewsId.get(a.id);
    const alertB = alertByNewsId.get(b.id);
    const rankA = alertA ? priority[alertA.direcao] : 4;
    const rankB = alertB ? priority[alertB.direcao] : 4;
    return rankA - rankB;
  }), [news.items, alerts.items]);
  const pageCount = Math.ceil(sortedNews.length / PAGE_SIZE);
  const pageItems = sortedNews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return <section className="xp-card xp-news-panel" aria-labelledby="market-radar-title">
    <div className="xp-alert-heading"><div><div className="xp-kicker">RADAR DO MERCADO</div><h2 id="market-radar-title">Notícias e impactos na carteira</h2><p className="xp-desc">Notícias analisadas e investimentos potencialmente afetados.</p></div><span className="xp-tag">{news.updatedAt ? `Atualizado ${formatarData(news.updatedAt)}` : "Aguardando dados"}</span></div>
    {sortedNews.length === 0 ? <p className="xp-empty-inline">{news.status === "unavailable" ? "Notícias indisponíveis. Verifique a ingestão agendada." : "Nenhuma notícia analisada disponível."}</p> : <>
      <div className="xp-news-list">{pageItems.map((item) => {
        const alert = alertByNewsId.get(item.id);
        const investment = item.ticker ? investmentByTicker.get(normalizarTicker(item.ticker)) : undefined;
        return <article key={item.id}>
          {item.ticker ? <span className="xp-tag">{item.ticker}</span> : <span className="xp-tag">Sem ticker identificado</span>}
          <h3><a href={item.url} target="_blank" rel="noreferrer">{item.titulo} ↗</a></h3>
          <p>{item.resumo ?? item.descricao ?? "Resumo indisponível."}</p>
          {alert && investment ? <div className="xp-related-investment"><a href={item.url} target="_blank" rel="noreferrer"><strong>{investment.nome} ({investment.ticker})</strong></a><span className={`xp-direction xp-direction-${alert.direcao}`}>Impacto possível: {alert.direcao}</span><Link href={`/assessor/ativos?ativo=${encodeURIComponent(investment.ticker)}`}>Ver clientes com este investimento</Link></div> : null}
          {alert ? <p className="xp-alert-reason"><b>Por que pode impactar:</b> {alert.justificativa}</p> : null}
          <small>{item.fonte} · {formatarData(item.publicadoEm)}{item.origemAnalise === "openai" ? " · Análise OpenAI" : item.origemAnalise === "heuristica" ? " · Fallback local" : " · Sem análise IA"}</small>
        </article>;
      })}</div>
      {pageCount > 1 ? <nav className="xp-pagination" aria-label="Paginação das notícias">
        <button className="xp-btn" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Anterior</button>
        <span>Página {page} de {pageCount}</span>
        <button className="xp-btn" type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Próxima</button>
      </nav> : null}
    </>}
    <p className="xp-disclaimer">Triagem informacional para avaliação humana. Não é previsão nem recomendação de investimento.</p>
  </section>;
}
