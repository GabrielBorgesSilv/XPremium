import { describe, expect, it } from "vitest";

import { PedidoRecuperacaoSchema, RedefinicaoSenhaSchema } from "./schema";

describe("PedidoRecuperacaoSchema", () => {
  it("normaliza o e-mail e recusa formato inválido", () => {
    expect(PedidoRecuperacaoSchema.parse({ email: " Pessoa@HubXP.test " }).email).toBe("pessoa@hubxp.test");
    expect(PedidoRecuperacaoSchema.safeParse({ email: "nao-e-email" }).success).toBe(false);
  });
});

describe("RedefinicaoSenhaSchema (mesma regra de senha do cadastro)", () => {
  const ok = { token: "t", senha: "12345678", confirmacaoSenha: "12345678" };
  it("aceita 8 a 200 caracteres com confirmação igual", () => {
    expect(RedefinicaoSenhaSchema.safeParse(ok).success).toBe(true);
  });
  it("recusa senha curta, longa, confirmação diferente e link vazio", () => {
    expect(RedefinicaoSenhaSchema.safeParse({ ...ok, senha: "1234567", confirmacaoSenha: "1234567" }).success).toBe(false);
    const longa = "x".repeat(201);
    expect(RedefinicaoSenhaSchema.safeParse({ ...ok, senha: longa, confirmacaoSenha: longa }).success).toBe(false);
    expect(RedefinicaoSenhaSchema.safeParse({ ...ok, confirmacaoSenha: "87654321" }).success).toBe(false);
    expect(RedefinicaoSenhaSchema.safeParse({ ...ok, token: "" }).success).toBe(false);
  });
});
