import type { OverviewResponse, Region } from "../domain/types";
import { DataProvenance } from "./DataProvenance";
import { MarketIndicatorCard } from "./MarketIndicatorCard";

const REGION_TITLE: Record<Region, string> = {
  BR: "Brasil",
  INTL: "Internacional",
};

export function MarketOverview({ overview }: { overview: OverviewResponse }) {
  const regions: Region[] = ["BR", "INTL"];

  return (
    <section aria-labelledby="panorama-titulo" className="xp-card">
      <h2 id="panorama-titulo">Panorama</h2>
      <DataProvenance dataStatus={overview.dataStatus} />
      <p className="xp-desc">Indicadores ilustrativos. A seleção final do panorama ainda não foi aprovada.</p>
      {regions.map((region) => {
        const indicators = overview.indicators.filter((indicator) => indicator.region === region);
        return (
          <div key={region}>
            <h3>{REGION_TITLE[region]}</h3>
            {indicators.length === 0 ? (
              <p className="xp-desc">Nenhum indicador de demonstração nesta região.</p>
            ) : (
              <div className="xp-grid-stats">
                {indicators.map((indicator) => (
                  <MarketIndicatorCard key={indicator.id} indicator={indicator} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
