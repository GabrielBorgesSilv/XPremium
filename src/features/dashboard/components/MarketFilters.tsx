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
  { value: "1D", label: "1D" },
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
];

type MarketFiltersProps = {
  region: Region;
  category: Category;
  period: Period;
  onRegion: (region: Region) => void;
  onCategory: (category: Category) => void;
  onPeriod: (period: Period) => void;
};

function Choice({
  name,
  value,
  label,
  checked,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`xp-link${checked ? " active" : ""}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} />
      {label}
    </label>
  );
}

export function MarketFilters({ region, category, period, onRegion, onCategory, onPeriod }: MarketFiltersProps) {
  const ranking = category !== "FIXED_INCOME";

  return (
    <div className="xp-card">
      <h2>Filtros</h2>
      <p className="xp-desc">Região, categoria e período do universo de demonstração.</p>
      <fieldset className="xp-filters">
        <legend className="xp-group">Região</legend>
        <div className="xp-choice-row">
          {REGIONS.map((option) => (
            <Choice
              key={option.value}
              name="dashboard-region"
              value={option.value}
              label={option.label}
              checked={region === option.value}
              onSelect={() => onRegion(option.value)}
            />
          ))}
        </div>
      </fieldset>
      <fieldset className="xp-filters">
        <legend className="xp-group">Categoria</legend>
        <div className="xp-choice-row">
          {CATEGORIES.map((option) => (
            <Choice
              key={option.value}
              name="dashboard-category"
              value={option.value}
              label={option.label}
              checked={category === option.value}
              onSelect={() => onCategory(option.value)}
            />
          ))}
        </div>
      </fieldset>
      {ranking ? (
        <fieldset className="xp-filters">
          <legend className="xp-group">Período</legend>
          <div className="xp-choice-row">
            {PERIODS.map((option) => (
              <Choice
                key={option.value}
                name="dashboard-period"
                value={option.value}
                label={option.label}
                checked={period === option.value}
                onSelect={() => onPeriod(option.value)}
              />
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="xp-desc">Renda fixa não usa o ranking por período.</p>
      )}
    </div>
  );
}
