import { describe, expect, it } from "vitest";

import { criarAleatorio } from "./aleatorio";

describe("criarAleatorio", () => {
  it("gera a mesma sequência para a mesma semente", () => {
    const a = criarAleatorio(42);
    const b = criarAleatorio(42);
    const seqA = Array.from({ length: 5 }, () => a.proximo());
    const seqB = Array.from({ length: 5 }, () => b.proximo());
    expect(seqA).toEqual(seqB);
  });

  it("gera sequências diferentes para sementes diferentes", () => {
    expect(criarAleatorio(1).proximo()).not.toBe(criarAleatorio(2).proximo());
  });

  it("respeita os limites de inteiro e decimal", () => {
    const r = criarAleatorio(7);
    for (let i = 0; i < 1000; i++) {
      const n = r.inteiro(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
      expect(Number.isInteger(n)).toBe(true);

      const d = r.decimal(10, 20, 2);
      expect(d).toBeGreaterThanOrEqual(10);
      expect(d).toBeLessThanOrEqual(20);
    }
  });

  it("escolhe só itens da lista e recusa lista vazia", () => {
    const r = criarAleatorio(3);
    const itens = ["a", "b", "c"] as const;
    for (let i = 0; i < 100; i++) expect(itens).toContain(r.escolher(itens));
    expect(() => r.escolher([])).toThrow();
  });
});
