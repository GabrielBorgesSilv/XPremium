// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardShell } from "../components/DashboardShell";
import { QUOTE_CACHE_MS, decideQuoteRefresh } from "../components/refresh";
import { fixedIncomeFixtures } from "../fixtures/fixedIncome.fixture";
import { marketFixtures, overviewFixture } from "../fixtures/market.fixture";
import { newsFixture } from "../fixtures/news.fixture";

function renderDashboard() {
  return render(
    <DashboardShell
      overview={overviewFixture}
      assets={marketFixtures}
      fixedIncome={fixedIncomeFixtures}
      news={newsFixture}
    />,
  );
}

describe("interface do dashboard", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("mostra panorama simulado, rankings e notícias demonstrativas sem link", () => {
    renderDashboard();

    expect(screen.getByRole("heading", { name: "Dashboard do Assessor" })).toBeTruthy();
    expect(screen.getAllByText("DADOS SIMULADOS").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Indicador demonstrativo Brasil 01" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Indicador demonstrativo internacional 01" })).toBeTruthy();
    expect(screen.getByRole("table", { name: "Altas" })).toBeTruthy();
    expect(screen.getByRole("table", { name: "Baixas" })).toBeTruthy();
    expect(screen.getByText("DEMO_BR_STOCK_12")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Notícia demonstrativa 01" })).toBeTruthy();
    expect(screen.getAllByText("demonstrativo").length).toBeGreaterThan(0);
    expect(screen.queryByRole("link")).toBeNull();
    expect(document.body.textContent?.toLowerCase().includes("gerado por ia")).toBe(false);

    const altas = screen.getByRole("table", { name: "Altas" });
    const altasRows = within(altas).getAllByRole("row").slice(1);
    expect(altasRows).toHaveLength(10);
    expect(altasRows[0]?.textContent).toContain("DEMO_BR_STOCK_12");
    expect(altasRows[0]?.textContent).toContain("BRL");
    expect(altasRows[0]?.textContent).toContain("Ajustado, demonstração");
    expect(within(altas).getByRole("columnheader", { name: "Metodologia" })).toBeTruthy();
    expect(altas.parentElement?.getAttribute("tabindex")).toBe("0");

    const baixas = screen.getByRole("table", { name: "Baixas" });
    const baixasRows = within(baixas).getAllByRole("row").slice(1);
    expect(baixasRows).toHaveLength(10);
    expect(baixasRows[0]?.textContent).toContain("DEMO_BR_STOCK_24");

    expect(screen.queryByText("DEMO_BR_STOCK_25")).toBeNull();
    expect(screen.queryByText("DEMO_BR_STOCK_26")).toBeNull();
    expect(screen.queryByText("DEMO_BR_STOCK_27")).toBeNull();
    expect(screen.getAllByText(/15\/01\/2026 18:00 UTC/).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Notícia demonstrativa 03" })).toBeTruthy();
  });

  it("troca região e esconde o ranking quando a categoria é renda fixa", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("radio", { name: "Internacional" }));
    expect(screen.getByText("DEMO_INTL_STOCK_12")).toBeTruthy();
    expect(screen.getByText("USD 112,00")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "FIIs/REITs" }));
    expect(screen.getByText("REITs no recorte internacional.")).toBeTruthy();
    expect(screen.queryByText("DEMO_INTL_STOCK_12")).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Cripto" }));
    expect(screen.getByText("Janela de cálculo contínua de demonstração; não representa pregão.")).toBeTruthy();
    expect(screen.getAllByText("Não ajustado, demonstração").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("radio", { name: "Renda fixa" }));
    expect(screen.queryByRole("radio", { name: "1D" })).toBeNull();
    expect(screen.queryByRole("table", { name: "Altas" })).toBeNull();
    expect(screen.queryByRole("table", { name: "Baixas" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Renda fixa" })).toBeTruthy();
    expect(screen.getByText("Referência soberana demonstrativa INTL 01")).toBeTruthy();
  });

  it("reutiliza o cache de cotações e não altera o preço exibido", () => {
    renderDashboard();
    const before = screen.getByRole("table", { name: "Altas" }).textContent;

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T15:00:00.000Z"));
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    expect(screen.getByRole("button", { name: "Atualizando…" }).getAttribute("aria-busy")).toBe("true");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText(/preços de demonstração permanecem os mesmos/)).toBeTruthy();
    expect(screen.getByRole("table", { name: "Altas" }).textContent).toBe(before);

    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText(/Cache de cotações reutilizado/)).toBeTruthy();
    expect(screen.getByRole("table", { name: "Altas" }).textContent).toBe(before);
  });

  it("decide o cache de 15 minutos sem gerar preço novo", () => {
    const now = Date.parse("2026-10-10T15:00:00.000Z");
    const expired = decideQuoteRefresh(now, null, "2026-01-15T18:15:00.000Z");
    expect(expired.outcome).toBe("SIMULATED");
    expect(expired.cacheUntil).toBe(now + QUOTE_CACHE_MS);

    const reused = decideQuoteRefresh(now + 1000, expired.cacheUntil, "2026-01-15T18:15:00.000Z");
    expect(reused.outcome).toBe("CACHE_REUSED");
    expect(reused.cacheUntil).toBe(expired.cacheUntil);
  });

  it("mantém panorama e notícias ao trocar o ranking", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("radio", { name: "Internacional" }));
    expect(screen.getByRole("heading", { name: "Indicador demonstrativo Brasil 01" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Notícia demonstrativa 01" })).toBeTruthy();
    expect(screen.getByText("DEMO_INTL_STOCK_12")).toBeTruthy();
    expect(screen.queryByText("DEMO_BR_STOCK_12")).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Renda fixa" }));
    expect(screen.getByRole("heading", { name: "Indicador demonstrativo internacional 01" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Notícia demonstrativa 02" })).toBeTruthy();
    expect(screen.queryByRole("table", { name: "Altas" })).toBeNull();
    expect(screen.getAllByText("demonstrativo").length).toBeGreaterThan(0);
  });

  it("isola falha de uma seção sem apagar as outras", () => {
    const { unmount } = render(
      <DashboardShell
        overview={overviewFixture}
        assets={marketFixtures}
        fixedIncome={fixedIncomeFixtures}
        news={newsFixture}
        sectionErrors={{ news: true }}
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Notícias indisponíveis.");
    expect(screen.getByRole("table", { name: "Altas" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Indicador demonstrativo Brasil 01" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Notícia demonstrativa 01" })).toBeNull();
    unmount();

    render(
      <DashboardShell
        overview={overviewFixture}
        assets={marketFixtures}
        fixedIncome={fixedIncomeFixtures}
        news={newsFixture}
        sectionErrors={{ rankings: true, overview: true }}
      />,
    );
    expect(screen.getByText("Panorama indisponível.")).toBeTruthy();
    expect(screen.getByText("Rankings indisponíveis.")).toBeTruthy();
    expect(screen.queryByRole("table", { name: "Altas" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Notícia demonstrativa 01" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Ações" })).toBeTruthy();
  });
});
