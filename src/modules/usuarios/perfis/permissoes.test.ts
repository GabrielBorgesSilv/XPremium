import { describe, expect, it } from "vitest";

import { decidirAcesso, paginaInicialDoPapel, papelAtende } from "./permissoes";
import type { Papel, Usuario } from "./schema";

const usuario = (papel: Papel): Usuario => ({
  id: "id-teste",
  nome: "Pessoa Fictícia",
  email: "teste@hubxp.test",
  papel,
});

describe("papelAtende (hierarquia usuario < assessor < admin)", () => {
  it.each<[Papel, Papel, boolean]>([
    ["usuario", "usuario", true],
    ["usuario", "assessor", false],
    ["usuario", "admin", false],
    ["assessor", "usuario", true],
    ["assessor", "assessor", true],
    ["assessor", "admin", false],
    ["admin", "usuario", true],
    ["admin", "assessor", true],
    ["admin", "admin", true],
  ])("%s atende %s → %s", (atual, exigido, esperado) => {
    expect(papelAtende(atual, exigido)).toBe(esperado);
  });
});

describe("decidirAcesso", () => {
  it("sem sessão → nao-autenticado (401 na API, /login na página)", () => {
    expect(decidirAcesso(null, "usuario")).toBe("nao-autenticado");
  });

  it("usuário comum na área de assessor → sem-permissao (403 na API)", () => {
    expect(decidirAcesso(usuario("usuario"), "assessor")).toBe("sem-permissao");
  });

  it("qualquer usuário logado acessa a área de cliente", () => {
    for (const papel of ["usuario", "assessor", "admin"] as const) {
      expect(decidirAcesso(usuario(papel), "usuario")).toBe("permitido");
    }
  });
});

describe("paginaInicialDoPapel", () => {
  it("usuario → /cliente; assessor e admin → /assessor", () => {
    expect(paginaInicialDoPapel("usuario")).toBe("/cliente");
    expect(paginaInicialDoPapel("assessor")).toBe("/assessor");
    expect(paginaInicialDoPapel("admin")).toBe("/assessor");
  });
});
