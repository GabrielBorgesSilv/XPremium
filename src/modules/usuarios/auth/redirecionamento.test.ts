import { describe, expect, it } from "vitest";

import type { Papel, Usuario } from "../perfis/schema";
import { caminhoInternoSeguro, destinoAposLogin } from "./redirecionamento";

const usuario = (papel: Papel): Usuario => ({
  id: "id-teste",
  nome: "Pessoa Fictícia",
  email: "teste@hubxp.test",
  papel,
});

describe("caminhoInternoSeguro (voltar só para dentro da app)", () => {
  it.each(["/assessor", "/assessor/clientes?aba=2", "/cliente/patrimonio"])("aceita %s", (c) => {
    expect(caminhoInternoSeguro(c)).toBe(c);
  });

  it.each([
    "https://site-externo.com",
    "//site-externo.com",
    "/\\site-externo.com",
    "javascript:alert(1)",
    "assessor",
    "",
    "/login",
    "/login?voltar=/assessor",
    "/assessor\n",
    null,
    undefined,
    42,
  ])("recusa %j", (c) => {
    expect(caminhoInternoSeguro(c)).toBeNull();
  });
});

describe("destinoAposLogin", () => {
  it("'Sou cliente' leva qualquer papel para /cliente", () => {
    for (const papel of ["usuario", "assessor", "admin"] as const) {
      expect(destinoAposLogin(usuario(papel), "cliente", null)).toEqual({
        destino: "/cliente",
        semAcessoAssessor: false,
      });
    }
  });

  it("'Sou assessor' com papel assessor ou admin leva para /assessor", () => {
    for (const papel of ["assessor", "admin"] as const) {
      expect(destinoAposLogin(usuario(papel), "assessor", null)).toEqual({
        destino: "/assessor",
        semAcessoAssessor: false,
      });
    }
  });

  it("'Sou assessor' sem o papel entra e vai para /cliente com aviso", () => {
    expect(destinoAposLogin(usuario("usuario"), "assessor", null)).toEqual({
      destino: "/cliente",
      semAcessoAssessor: true,
    });
  });

  it("volta para a página pedida quando o voltar é interno", () => {
    expect(destinoAposLogin(usuario("assessor"), "cliente", "/assessor/clientes").destino).toBe(
      "/assessor/clientes",
    );
  });

  it("ignora voltar externo e usa a área escolhida", () => {
    expect(destinoAposLogin(usuario("usuario"), "cliente", "https://site-externo.com").destino).toBe(
      "/cliente",
    );
  });
});
