import type { OverviewResponse, Region } from "../domain/types";
import { MarketIndicatorCard } from "./MarketIndicatorCard";

const REGION_TITLE: Record<Region, string> = {
  BR: "Brasil",
  INTL: "Internacional",
};

export function MarketOverview({ overview }: { overview: OverviewResponse }) {
  const regions: Region[] = ["BR", "INTL"];

  const groups = regions.map((region) => ({
    region,
    indicators: overview.indicators.filter((indicator) => indicator.region === region),
  }));

  return (
    <section aria-labelledby="panorama-titulo">
      <h2 id="panorama-titulo" className="xp-block-title">
        Panorama
      </h2>
      <p className="xp-desc">Brasil e exterior no mesmo dia. Os filtros abaixo não alteram estes cartões.</p>
      {groups.map((group) =>
        group.indicators.length === 0 ? (
          <p key={group.region} className="xp-desc">
            Nenhum indicador em {REGION_TITLE[group.region]}.
          </p>
        ) : null,
      )}
      <div className="xp-grid-stats">
        {groups.flatMap((group) =>
          group.indicators.map((indicator) => <MarketIndicatorCard key={indicator.id} indicator={indicator} />),
        )}
      </div>
    </section>
  );
}
