"use client";

import { useEffect, useRef, useState } from "react";

import { buildRanking } from "../domain/ranking";
import {
  CRYPTO_WINDOW_NOTE,
  type Category,
  type FixedIncomeResponse,
  type MarketFixtureAsset,
  type NewsResponse,
  type OverviewResponse,
  type Period,
  type Region,
} from "../domain/types";
import { FixedIncomePanel } from "./FixedIncomePanel";
import { LoadingErrorEmpty } from "./LoadingErrorEmpty";
import { MarketFilters } from "./MarketFilters";
import { MarketOverview } from "./MarketOverview";
import { NewsPreview } from "./NewsPreview";
import { MarketAttentionPreview } from "./MarketAttentionPreview";
import { RankingTable } from "./RankingTable";
import { formatTimestamp } from "./format";
import { decideQuoteRefresh, type QuoteRefreshDecision } from "./refresh";

const REFRESH_FEEDBACK_MS = 300;

type SectionErrors = Partial<Record<"overview" | "rankings" | "fixedIncome" | "news", boolean>>;

type DashboardShellProps = {
  overview: OverviewResponse;
  assets: readonly MarketFixtureAsset[];
  fixedIncome: Record<Region, FixedIncomeResponse>;
  news: NewsResponse;
  attentionNews?: Parameters<typeof MarketAttentionPreview>[0]["news"];
  attentionAlerts?: Parameters<typeof MarketAttentionPreview>[0]["alerts"];
  sectionErrors?: SectionErrors;
};

export function DashboardShell({ overview, assets, fixedIncome, news, attentionNews, attentionAlerts, sectionErrors }: DashboardShellProps) {
  const [region, setRegion] = useState<Region>("BR");
  const [category, setCategory] = useState<Category>("STOCK");
  const [period, setPeriod] = useState<Period>("1D");
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<QuoteRefreshDecision | null>(null);
  const [cacheUntil, setCacheUntil] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const ranking =
    category === "FIXED_INCOME" ? null : buildRanking(assets, { region, category, period });
  const income = category === "FIXED_INCOME" ? fixedIncome[region] : null;
  const methodologyNote =
    category === "REAL_ESTATE"
      ? region === "BR"
        ? "FIIs no recorte Brasil."
        : "REITs no recorte internacional."
      : category === "CRYPTO"
        ? CRYPTO_WINDOW_NOTE
        : null;

  function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    timeoutRef.current = window.setTimeout(() => {
      const decision = decideQuoteRefresh(Date.now(), cacheUntil, overview.dataStatus.expiresAt);
      setCacheUntil(decision.cacheUntil);
      setNotice(decision);
      setRefreshing(false);
      timeoutRef.current = null;
    }, REFRESH_FEEDBACK_MS);
  }

  const marketPanel = income ? (
    sectionErrors?.fixedIncome ? (
      <LoadingErrorEmpty state="error" title="Renda fixa indisponível." />
    ) : (
      <FixedIncomePanel data={income} />
    )
  ) : sectionErrors?.rankings ? (
    <LoadingErrorEmpty state="error" title="Rankings indisponíveis." />
  ) : ranking ? (
    <section aria-labelledby="rankings-titulo" className="xp-card">
      <div>
        <h2 id="rankings-titulo">Rankings</h2>
        {methodologyNote ? <p className="xp-desc">{methodologyNote}</p> : null}
        <p className="xp-desc">
          {ranking.coverage.status === "PARTIAL"
            ? "Lista parcial deste recorte."
            : `Até 10 altas e 10 baixas. Neste recorte: ${ranking.gainers.length} altas e ${ranking.losers.length} baixas.`}
        </p>
      </div>
      {ranking.gainers.length === 0 && ranking.losers.length === 0 ? (
        <LoadingErrorEmpty state="empty" title="Nenhum ativo elegível neste filtro." />
      ) : (
        <div className="xp-rankings">
          <RankingTable title="Altas" rows={ranking.gainers} tone="up" />
          <RankingTable title="Baixas" rows={ranking.losers} tone="down" />
        </div>
      )}
    </section>
  ) : null;

  return (
    <>
      <header className="xp-head">
        <div>
          <h1>Dashboard do Assessor</h1>
          <p>
            Panorama, rankings e notícias para a conversa com o cliente. Referência{" "}
            {formatTimestamp(overview.dataStatus.asOf)}.
          </p>
        </div>
        <button type="button" onClick={refresh} disabled={refreshing} aria-busy={refreshing} className="xp-btn lime">
          {refreshing ? "Atualizando…" : "Atualizar"}
        </button>
      </header>
      {refreshing ? <LoadingErrorEmpty state="loading" title="Atualizando cotações." /> : null}
      {notice ? (
        <p role="status" className="xp-desc">
          {notice.message} Pedido em {formatTimestamp(notice.requestedAt)}.
        </p>
      ) : null}

      {sectionErrors?.overview ? (
        <LoadingErrorEmpty state="error" title="Panorama indisponível." />
      ) : (
        <MarketOverview overview={overview} />
      )}
      <MarketFilters
        region={region}
        category={category}
        period={period}
        onRegion={setRegion}
        onCategory={setCategory}
        onPeriod={setPeriod}
      />

      <div className="xp-columns">
        <div className="xp-stack">{marketPanel}</div>
        {attentionNews && attentionAlerts ? (
          <MarketAttentionPreview news={attentionNews} alerts={attentionAlerts} />
        ) : sectionErrors?.news ? (
          <LoadingErrorEmpty state="error" title="Notícias indisponíveis." />
        ) : (
          <NewsPreview news={news} />
        )}
      </div>
    </>
  );
}
