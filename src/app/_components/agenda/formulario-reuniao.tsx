"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type { AreaAgenda, Pessoa } from "@/modules/agenda";

import { criarReuniaoAction, type EstadoReuniao } from "./actions";

type Props = {
  area: AreaAgenda;
  participantes: Pessoa[];
  categorias: [string, string][];
  duracoes: readonly number[];
  /** Dia sugerido (o selecionado no calendário) e o mínimo permitido (hoje). */
  diaSugerido: string;
  hoje: string;
  hrefFechar: string;
};

function Erro({ texto }: { texto?: string }) {
  return texto ? <small className="xp-campo-erro">{texto}</small> : null;
}

export function FormularioReuniao(props: Props) {
  const [estado, acao, enviando] = useActionState<EstadoReuniao, FormData>(criarReuniaoAction, {});
  // Recria o formulário a cada envio: o React 19 limpa os campos após a ação, e as caixas de
  // seleção não voltam sozinhas para o valor devolvido. Com `key` nova, tudo nasce preenchido.
  return <CamposReuniao key={estado.tentativa ?? 0} {...props} estado={estado} acao={acao} enviando={enviando} />;
}

function CamposReuniao({
  area,
  participantes,
  categorias,
  duracoes,
  diaSugerido,
  hoje,
  hrefFechar,
  estado,
  acao,
  enviando,
}: Props & { estado: EstadoReuniao; acao: (dados: FormData) => void; enviando: boolean }) {
  const v = estado.valores ?? {};
  const [modalidade, setModalidade] = useState(v.modalidade || "ONLINE");
  const erro = estado.campos ?? {};

  return (
    <form action={acao} className="xp-form" noValidate>
      <input type="hidden" name="area" value={area} />
      <input type="hidden" name="tentativa" value={(estado.tentativa ?? 0) + 1} />

      {estado.erro && <div className="xp-warn danger" role="alert">{estado.erro}</div>}

      <label className="xp-campo">
        <span>{area === "assessor" ? "Cliente" : "Assessor"}</span>
        {participantes.length === 1 && area === "cliente" ? (
          <>
            <input type="hidden" name="participanteId" value={participantes[0].id} />
            <b>{participantes[0].nome}</b>
          </>
        ) : (
          <select name="participanteId" defaultValue={v.participanteId ?? ""} required>
            <option value="" disabled>Escolha um cliente</option>
            {participantes.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        )}
        <Erro texto={erro.participanteId} />
      </label>

      <div className="xp-campos-3">
        <label className="xp-campo">
          <span>Data</span>
          <input type="date" name="data" min={hoje} defaultValue={v.data || diaSugerido} required />
          <Erro texto={erro.data} />
        </label>
        <label className="xp-campo">
          <span>Horário (Brasília)</span>
          <input type="time" name="hora" defaultValue={v.hora || "10:00"} required />
          <Erro texto={erro.hora} />
        </label>
        <label className="xp-campo">
          <span>Duração</span>
          <select name="duracaoMin" defaultValue={v.duracaoMin || "60"}>
            {duracoes.map((d) => (
              <option key={d} value={d}>{d} min</option>
            ))}
          </select>
          <Erro texto={erro.duracaoMin} />
        </label>
      </div>

      <fieldset className="xp-campo">
        <span>Onde</span>
        <div className="xp-opcoes">
          {(["ONLINE", "PRESENCIAL"] as const).map((m) => (
            <label key={m} className={`xp-filter${modalidade === m ? " active" : ""}`}>
              <input
                type="radio"
                name="modalidade"
                value={m}
                checked={modalidade === m}
                onChange={() => setModalidade(m)}
              />
              {m === "ONLINE" ? "Online" : "Presencial"}
            </label>
          ))}
        </div>
        <Erro texto={erro.modalidade} />
      </fieldset>

      {modalidade === "PRESENCIAL" && (
        <label className="xp-campo">
          <span>Local</span>
          <input name="local" maxLength={200} placeholder="Endereço ou ponto de encontro" defaultValue={v.local ?? ""} />
          <Erro texto={erro.local} />
        </label>
      )}

      <label className="xp-campo">
        <span>Motivo</span>
        <select name="motivoCategoria" defaultValue={v.motivoCategoria ?? ""} required>
          <option value="" disabled>Escolha o motivo</option>
          {categorias.map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
        <Erro texto={erro.motivoCategoria} />
      </label>

      <label className="xp-campo">
        <span>Explique o motivo da reunião</span>
        <textarea
          name="motivoDescricao"
          rows={3}
          maxLength={500}
          placeholder="Ex.: revisar a carteira depois das notícias sobre juros"
          defaultValue={v.motivoDescricao ?? ""}
          required
        />
        <Erro texto={erro.motivoDescricao} />
      </label>

      <div className="xp-actions">
        <button className="xp-btn lime" type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar convite"}
        </button>
        <Link className="xp-filter" href={hrefFechar}>Cancelar</Link>
      </div>
      <p className="xp-note">A reunião fica pendente até a outra pessoa aceitar. Você, que convidou, não precisa aceitar.</p>
    </form>
  );
}
