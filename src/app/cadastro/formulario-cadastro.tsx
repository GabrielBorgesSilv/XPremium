"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type EstadoCadastro, cadastrarAction } from "./actions";
import estilos from "./cadastro.module.css";

type Opcoes = [valor: string, rotulo: string][];

export function FormularioCadastro({
  estadosCivis,
  faixasRenda,
  textoTermo,
}: {
  estadosCivis: Opcoes;
  faixasRenda: Opcoes;
  textoTermo: string;
}) {
  const [estado, acao, enviando] = useActionState<EstadoCadastro, FormData>(cadastrarAction, {});
  const v = estado.valores ?? {};
  const e = estado.erros ?? {};

  // Campo com rótulo, erro acessível e valor preservado após erro (o React limpa o formulário).
  const campo = (
    nome: keyof NonNullable<EstadoCadastro["erros"]>,
    rotulo: string,
    entrada: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>,
  ) => (
    <div className={estilos.campo}>
      <label htmlFor={nome}>{rotulo}</label>
      {entrada}
      {e[nome] && (
        <span id={`erro-${nome}`} className={estilos.erroCampo}>
          {e[nome]}
        </span>
      )}
    </div>
  );
  const atributos = (nome: keyof NonNullable<EstadoCadastro["erros"]>) => ({
    id: nome,
    name: nome,
    "aria-invalid": Boolean(e[nome]),
    "aria-describedby": e[nome] ? `erro-${nome}` : undefined,
  });

  return (
    <form action={acao} className={estilos.cartao} noValidate>
      <div className={estilos.campos}>
        {campo("nome", "Nome completo", <input {...atributos("nome")} autoComplete="name" placeholder="Ex.: Ana Martins" defaultValue={v.nome} />)}
        {campo("nascimento", "Data de nascimento", <input {...atributos("nascimento")} type="date" autoComplete="bday" defaultValue={v.nascimento} />)}
        {campo("email", "E-mail", <input {...atributos("email")} type="email" autoComplete="email" placeholder="seu@email.com" defaultValue={v.email} />)}
        {campo("celular", "Celular", <input {...atributos("celular")} type="tel" autoComplete="tel-national" placeholder="(11) 90000-0000" defaultValue={v.celular} />)}
        {campo("profissao", "Profissão", <input {...atributos("profissao")} placeholder="Sua profissão" defaultValue={v.profissao} />)}
        <div className={estilos.campo}>
          <label htmlFor="estadoCivil">Estado civil</label>
          <select {...atributos("estadoCivil")} defaultValue={v.estadoCivil ?? ""}>
            <option value="" disabled>Selecione</option>
            {estadosCivis.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
          {e.estadoCivil && <span id="erro-estadoCivil" className={estilos.erroCampo}>{e.estadoCivil}</span>}
        </div>
        <div className={estilos.campo}>
          <label htmlFor="rendaFaixa">Renda mensal aproximada</label>
          <select {...atributos("rendaFaixa")} defaultValue={v.rendaFaixa ?? ""}>
            <option value="" disabled>Selecione</option>
            {faixasRenda.map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
          </select>
          {e.rendaFaixa && <span id="erro-rendaFaixa" className={estilos.erroCampo}>{e.rendaFaixa}</span>}
        </div>
        <div />
        {campo("senha", "Senha (mínimo 8 caracteres)", <input {...atributos("senha")} type="password" autoComplete="new-password" />)}
        {campo("confirmacaoSenha", "Confirme a senha", <input {...atributos("confirmacaoSenha")} type="password" autoComplete="new-password" />)}
      </div>

      <div className={estilos.termo}>
        <label>
          <input type="checkbox" name="consentimento" aria-invalid={Boolean(e.consentimento)} aria-describedby={e.consentimento ? "erro-consentimento" : undefined} /> {textoTermo}
        </label>
        {e.consentimento && <span id="erro-consentimento" className={estilos.erroCampo}>{e.consentimento}</span>}
      </div>

      {estado.emailEmUso && (
        <p role="alert" className={estilos.erro}>
          E-mail já cadastrado. <Link href="/login">Entrar</Link> ou <Link href="/recuperar-senha">recuperar a senha</Link>.
        </p>
      )}

      <div className={estilos.rodape}>
        <Link href="/login" className="xp-btn outline">← Já tenho conta</Link>
        <button type="submit" className="xp-btn lime" disabled={enviando}>
          {enviando ? "Criando conta…" : "Criar conta →"}
        </button>
      </div>
    </form>
  );
}
