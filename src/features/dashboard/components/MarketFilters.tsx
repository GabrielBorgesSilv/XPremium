import type { Category, Period, Region } from "../domain/types";

const REGIONS: { value: Region; label: string }[] = [
  { value: "BR", label: "Brasil" },
  { value: "INTL", label: "Internacional" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "STOCK", label: "Ações" },
  { value: "REAL_ESTATE", label: "FIIs/REITs" },
  { value: "ETF", label: "ETFs" },
  { value: "CRYPTO", label: "Cripto" },
  { value: "FIXED_INCOME", label: "Renda fixa" },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: "1D", label: "Hoje" },
  { value: "7D", label: "7 dias" },
  { value: "15D", label: "15 dias" },
  { value: "30D", label: "30 dias" },
];

type MarketFiltersProps = {
  region: Region;
  category: Category;
  period: Period;
  onRegion: (region: Region) => void;
  onCategory: (category: Category) => void;
  onPeriod: (period: Period) => void;
};

function FilterBar({
  label,
  columns,
  children,
}: {
  label: string;
  columns: 2 | 3 | 4 | 5;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="xp-filter-label">{label}</p>
      <div className={`xp-period cols-${columns}`} role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

function Option({
  label,
  pressed,
  onSelect,
}: {
  label: string;
  pressed: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={pressed ? "active" : undefined} aria-pressed={pressed} onClick={onSelect}>
      {label}
    </button>
  );
}

export function MarketFilters({ region, category, period, onRegion, onCategory, onPeriod }: MarketFiltersProps) {
  const ranking = category !== "FIXED_INCOME";

  return (
    <section className="xp-card xp-band" aria-labelledby="filtros-titulo">
      <h2 id="filtros-titulo">Filtros</h2>
      <p className="xp-desc">Região, categoria e período das listas abaixo.</p>
      <FilterBar label="Região" columns={2}>
        {REGIONS.map((option) => (
          <Option
            key={option.value}
            label={option.label}
            pressed={region === option.value}
            onSelect={() => onRegion(option.value)}
          />
        ))}
      </FilterBar>
      <FilterBar label="Categoria" columns={5}>
        {CATEGORIES.map((option) => (
          <Option
            key={option.value}
            label={option.label}
            pressed={category === option.value}
            onSelect={() => onCategory(option.value)}
          />
        ))}
      </FilterBar>
      {ranking ? (
        <FilterBar label="Período" columns={4}>
          {PERIODS.map((option) => (
            <Option
              key={option.value}
              label={option.label}
              pressed={period === option.value}
              onSelect={() => onPeriod(option.value)}
            />
          ))}
        </FilterBar>
      ) : (
        <p className="xp-desc">Renda fixa não usa o ranking por período.</p>
      )}
    </section>
  );
}
