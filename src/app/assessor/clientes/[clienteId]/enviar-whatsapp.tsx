"use client";

import { useMemo, useState } from "react";

import { linkWhatsApp } from "@/shared/whatsapp";

import { registrarWhatsAppAction } from "./actions";

type Props = {
  clienteId: string;
  celular: string | null;
  origemCelular: "cadastro" | "teste" | "nenhum";
  /** Blocos com conteúdo, na ordem fixa, com o rótulo de cada um. */
  disponiveis: { bloco: string; rotulo: string }[];
  /** Mensagem pronta por combinação de blocos (chave: blocos na ordem fixa unidos por "+"). */
  mensagens: Record<string, string>;
};

const AVISO_CELULAR: Record<Props["origemCelular"], string> = {
  cadastro: "Envia para o celular do cadastro do cliente.",
  teste: "Cliente de demonstração: envia para o número de teste (WHATSAPP_DEMO).",
  nenhum: "Cliente sem celular cadastrado: o WhatsApp abre e você escolhe o contato.",
};

/** Botão de WhatsApp do painel do cliente: o assessor escolhe os blocos, vê a prévia e abre o WhatsApp. */
export function EnviarWhatsApp({ clienteId, celular, origemCelular, disponiveis, mensagens }: Props) {
  const [escolhidos, setEscolhidos] = useState<string[]>(disponiveis.map((d) => d.bloco));
  const ordenados = disponiveis.map((d) => d.bloco).filter((b) => escolhidos.includes(b));
  const texto = mensagens[ordenados.join("+")] ?? "";
  const link = useMemo(() => linkWhatsApp(celular, texto), [celular, texto]);

  const alternar = (bloco: string) =>
    setEscolhidos((atual) => (atual.includes(bloco) ? atual.filter((b) => b !== bloco) : [...atual, bloco]));

  return (
    <section className="xp-card xp-section">
      <h2>Enviar pelo WhatsApp</h2>
      <p className="xp-desc">
        Só temas, sem valores: os detalhes ficam para a conversa e o app. {AVISO_CELULAR[origemCelular]}
      </p>

      <div className="xp-filters" role="group" aria-label="O que incluir na mensagem">
        {disponiveis.map(({ bloco, rotulo }) => (
          <label key={bloco} className={`xp-filter${escolhidos.includes(bloco) ? " active" : ""}`}>
            <input
              type="checkbox"
              checked={escolhidos.includes(bloco)}
              onChange={() => alternar(bloco)}
              style={{ marginRight: 6 }}
            />
            {rotulo}
          </label>
        ))}
      </div>

      <label className="xp-note" htmlFor="previa-whatsapp">Prévia (você ainda pode editar no WhatsApp)</label>
      <textarea
        id="previa-whatsapp"
        readOnly
        value={texto || "Escolha pelo menos um item."}
        rows={8}
        style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 6, border: "1px solid var(--xp-line)", font: "inherit", fontSize: 12, resize: "vertical" }}
      />

      {ordenados.length === 0 ? (
        <button className="xp-btn lime" type="button" disabled style={{ marginTop: 10, opacity: 0.6 }}>
          Abrir no WhatsApp
        </button>
      ) : (
        <a
          className="xp-btn lime"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-block", marginTop: 10 }}
          onClick={() => void registrarWhatsAppAction(clienteId, ordenados)}
        >
          Abrir no WhatsApp →
        </a>
      )}
    </section>
  );
}
