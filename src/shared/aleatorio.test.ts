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

  it("gera UUID v4 válido e determinístico", () => {
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    const a = criarAleatorio(42).uuid();
    expect(a).toMatch(uuidV4);
    expect(criarAleatorio(42).uuid()).toBe(a);
    expect(criarAleatorio(43).uuid()).not.toBe(a);
  });

  it("escolhe só itens da lista e recusa lista vazia", () => {
    const r = criarAleatorio(3);
    const itens = ["a", "b", "c"] as const;
    for (let i = 0; i < 100; i++) expect(itens).toContain(r.escolher(itens));
    expect(() => r.escolher([])).toThrow();
  });
});
