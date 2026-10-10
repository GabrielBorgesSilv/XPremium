/**
 * Link "clique para conversar" do WhatsApp (wa.me) com o texto pronto.
 * Sem número, o WhatsApp abre e a pessoa escolhe o contato.
 */
export function linkWhatsApp(celular: string | null, texto: string): string {
  const consulta = `text=${encodeURIComponent(texto)}`;
  const numero = celular ? numeroInternacional(celular) : null;
  return numero ? `https://wa.me/${numero}?${consulta}` : `https://wa.me/?${consulta}`;
}

/** Celular brasileiro em formato internacional só com dígitos (55 + DDD + número); null se inválido. */
export function numeroInternacional(celular: string): string | null {
  const digitos = celular.replace(/\D/g, "");
  if (/^[1-9]{2}9\d{8}$/.test(digitos)) return `55${digitos}`;
  if (/^55[1-9]{2}9\d{8}$/.test(digitos)) return digitos;
  return null;
}
