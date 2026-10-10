import { describe, expect, it } from "vitest";

import { LoginSchema } from "./schema";

describe("LoginSchema (só e-mail, sem CPF)", () => {
  it("normaliza o e-mail: espaços nas pontas e maiúsculas", () => {
    expect(LoginSchema.parse({ email: "  USUARIO1@HubXP.test ", senha: "x" }).email).toBe(
      "usuario1@hubxp.test",
    );
  });

  it("recusa e-mail inválido, CPF no lugar do e-mail e senha vazia", () => {
    expect(LoginSchema.safeParse({ email: "nao-e-email", senha: "x" }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: "123.456.789-09", senha: "x" }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: "a@hubxp.test", senha: "" }).success).toBe(false);
  });
});
