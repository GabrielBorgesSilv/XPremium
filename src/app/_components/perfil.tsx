import Link from "next/link";

import { sairAction } from "@/app/login/actions";
import { type DadosPessoais, ESTADOS_CIVIS, FAIXAS_RENDA, type Papel, type Usuario } from "@/modules/usuarios";
import { formatarCelular } from "@/shared/formatar";

/** Blocos da página de perfil, usados pelo perfil do assessor e do cliente. */

export const ROTULO_PAPEL: Record<Papel, string> = {
  usuario: "Cliente",
  assessor: "Assessor de investimentos",
  admin: "Administrador",
};

/** Idade completa hoje (dado real da conta, então a referência é a data atual). */
function idade(nascimento: string): number {
  const [a, m, d] = nascimento.split("-").map(Number);
  const hoje = new Date();
  const aniversarioPassou = hoje.getMonth() + 1 > m || (hoje.getMonth() + 1 === m && hoje.getDate() >= d);
  return hoje.getFullYear() - a - (aniversarioPassou ? 0 : 1);
}

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export function CabecalhoPerfil({ usuario }: { usuario: Usuario }) {
  return (
    <div className="xp-head">
      <div className="xp-profile">
        <span className="xp-avatar xp-avatar-lg" aria-hidden="true">{iniciais(usuario.nome)}</span>
        <div>
          <div className="xp-kicker">MEU PERFIL</div>
          <h1>{usuario.nome}</h1>
          <p>{ROTULO_PAPEL[usuario.papel]}</p>
        </div>
      </div>
    </div>
  );
}

export function CardConta({ usuario }: { usuario: Usuario }) {
  return (
    <section className="xp-card">
      <h2>Conta</h2>
      <p className="xp-desc">Dados de acesso à plataforma</p>
      <div className="xp-metrics xp-metrics-2">
        <div><span>Nome</span><b>{usuario.nome}</b></div>
        <div><span>E-mail</span><b>{usuario.email}</b></div>
        <div><span>Perfil de acesso</span><b>{ROTULO_PAPEL[usuario.papel]}</b></div>
      </div>
    </section>
  );
}

/** `mostrarRenda`: a faixa de renda aparece no perfil do cliente, não no do assessor. */
export function CardDadosPessoais({ dados, mostrarRenda = false }: { dados: DadosPessoais | null; mostrarRenda?: boolean }) {
  return (
    <section className="xp-card">
      <h2>Dados pessoais</h2>
      <p className="xp-desc">Informados no cadastro</p>
      {dados ? (
        <div className="xp-metrics xp-metrics-2">
          <div><span>Celular</span><b>{dados.celular ? formatarCelular(dados.celular) : "Não informado"}</b></div>
          <div><span>Profissão</span><b>{dados.profissao}</b></div>
          <div><span>Idade</span><b>{idade(dados.nascimento)} anos</b></div>
          <div><span>Estado civil</span><b>{ESTADOS_CIVIS[dados.estadoCivil]}</b></div>
          {mostrarRenda && <div><span>Renda mensal</span><b>{FAIXAS_RENDA[dados.rendaFaixa]}</b></div>}
        </div>
      ) : (
        <div className="xp-placeholder">Cadastro pessoal não preenchido para esta conta.</div>
      )}
    </section>
  );
}

export function CardSeguranca() {
  return (
    <section className="xp-card">
      <h2>Segurança</h2>
      <p className="xp-desc">Senha e sessão</p>
      <div className="xp-actions">
        <Link className="xp-btn" href="/recuperar-senha">Alterar senha</Link>
        <form action={sairAction}>
          <button className="xp-filter" type="submit">Sair da conta</button>
        </form>
      </div>
      <p className="xp-note">&ldquo;Alterar senha&rdquo; envia um link de redefinição para o seu e-mail.</p>
    </section>
  );
}
