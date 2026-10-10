import { describe, expect, it } from "vitest";

import { linkWhatsApp, numeroInternacional } from "./whatsapp";

describe("numeroInternacional", () => {
  it("aceita celular com ou sem máscara e com ou sem 55", () => {
    expect(numeroInternacional("(11) 91234-5678")).toBe("5511912345678");
    expect(numeroInternacional("11912345678")).toBe("5511912345678");
    expect(numeroInternacional("+55 11 91234-5678")).toBe("5511912345678");
  });
  it("recusa fixo, DDD inválido e tamanhos errados", () => {
    for (const n of ["(11) 3123-4567", "(01) 91234-5678", "1191234567", ""]) expect(numeroInternacional(n)).toBeNull();
  });
});

describe("linkWhatsApp", () => {
  it("monta o link com número e texto codificado", () => {
    expect(linkWhatsApp("11912345678", "Olá, Ana! Tudo bem?")).toBe(
      "https://wa.me/5511912345678?text=Ol%C3%A1%2C%20Ana!%20Tudo%20bem%3F",
    );
  });
  it("sem número (ou número inválido) abre o WhatsApp para escolher o contato", () => {
    expect(linkWhatsApp(null, "oi")).toBe("https://wa.me/?text=oi");
    expect(linkWhatsApp("123", "oi")).toBe("https://wa.me/?text=oi");
  });
});
