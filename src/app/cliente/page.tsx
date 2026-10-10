import Link from "next/link";

import { obterPainelCliente } from "@/modules/cliente";
import {
  buscarAssessorDoUsuario,
  buscarDadosPessoais,
  exigirPapel,
} from "@/modules/usuarios";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentuais = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

const alocacoes = [
  ["Renda fixa", "alocacaoRendaFixa"],
  ["Multimercado", "alocacaoMultimercado"],
  ["FIIs", "alocacaoFiis"],
  ["Renda variável", "alocacaoRendaVariavel"],
  ["Internacional", "alocacaoInternacional"],
] as const;

function dataBr(data: string): string {
  return new Date(`${data}T00:00:00.000Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function idadeEmAnos(dataNascimento: string): number {
  const nascimento = new Date(`${dataNascimento}T00:00:00.000Z`);
  const hoje = new Date();
  const aniversarioPassou =
    hoje.getUTCMonth() > nascimento.getUTCMonth() ||
    (hoje.getUTCMonth() === nascimento.getUTCMonth() &&
      hoje.getUTCDate() >= nascimento.getUTCDate());
  return hoje.getUTCFullYear() - nascimento.getUTCFullYear() - (aniversarioPassou ? 0 : 1);
}

export default async function ClientePage() {
  const usuario = await exigirPapel("usuario");
  const [painel, dadosPessoais, assessor] = await Promise.all([
    obterPainelCliente(usuario.id),
    buscarDadosPessoais(usuario.id),
    buscarAssessorDoUsuario(usuario.id),
  ]);
  return (
    <>
      <div className="xp-head">
        <div>
          <div className="xp-kicker">ÁREA DO CLIENTE</div>
          <h1>Olá, {usuario.nome}</h1>
          <p>Seu patrimônio e perfil, com informações registradas na sua conta.</p>
        </div>
        <Link className="xp-btn lime" href="/cliente/calendario" target="_self">
          Agendar reunião <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="xp-grid-stats xp-client-stats">
        <section className="xp-card xp-stat">
          <label>Patrimônio declarado</label>
          <strong>{painel ? moeda.format(painel.anamnese.patrimonioAtual) : "—"}</strong>
          <small>
            {painel
              ? `Renda mensal: ${moeda.format(painel.anamnese.rendaMensal)}`
              : dadosPessoais
                ? `Faixa de renda: ${dadosPessoais.rendaFaixa}`
                : "Complete sua anamnese para ver seus dados."}
          </small>
        </section>
        <section className="xp-card xp-stat">
          <label>Perfil de investidor</label>
          <strong className="xp-profile-value">{painel?.anamnese.perfilInvestidor ?? "Pendente"}</strong>
          <small>{painel?.anamnese.toleranciaRiscoDetalhada ?? "Perfil ainda não informado."}</small>
        </section>
        <section className="xp-card xp-stat">
          <label>Open Finance</label>
          <strong>{painel?.conexoes.filter((item) => item.consentimento).length ?? 0} conexões</strong>
          <small>{painel ? "Consentimento ativo" : "Nenhuma conexão registrada."}</small>
        </section>
      </div>

      <div className="xp-columns">
        <section className="xp-card">
          <h2>Meu perfil</h2>
          {painel ? (
            <dl className="xp-client-details">
              <div><dt>Idade</dt><dd>{painel.anamnese.idade} anos</dd></div>
              <div><dt>Profissão</dt><dd>{painel.anamnese.profissao}</dd></div>
              <div><dt>Experiência</dt><dd>{painel.anamnese.experienciaMercado}</dd></div>
              <div><dt>Objetivo</dt><dd>{painel.anamnese.objetivoDetalhado}</dd></div>
              <div><dt>Horizonte</dt><dd>{painel.anamnese.horizonte}</dd></div>
              <div><dt>Assessor</dt><dd>{assessor?.nome ?? "Não informado"}</dd></div>
            </dl>
          ) : dadosPessoais ? (
            <dl className="xp-client-details">
            <div><dt>Idade</dt><dd>{idadeEmAnos(dadosPessoais.nascimento)} anos</dd></div>
            <div><dt>Profissão</dt><dd>{dadosPessoais.profissao}</dd></div>
            <div><dt>Estado civil</dt><dd>{dadosPessoais.estadoCivil.replace("_", " ")}</dd></div>
            <div><dt>Assessor</dt><dd>{assessor?.nome ?? "Não informado"}</dd></div>
            </dl>
          ) : (
            <p className="xp-placeholder">Seus dados de perfil aparecerão após a anamnese.</p>
          )}
        </section>

        <section className="xp-card">
          <h2>Alocação dos investimentos</h2>
          <p className="xp-desc">Distribuição informada para o seu patrimônio.</p>
          {painel ? (
            <div className="xp-client-allocation">
              {alocacoes.map(([nome, campo]) => {
                const percentual = painel.anamnese[campo];
                return (
                  <div key={campo}>
                    <span>{nome}</span>
                    <b>{percentuais.format(percentual)}</b>
                    <div className="xp-allocation-track">
                      <span style={{ width: percentuais.format(percentual) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="xp-placeholder">A alocação ficará disponível após a anamnese.</p>
          )}
        </section>
      </div>

      <section className="xp-card xp-client-banks">
        <h2>Contas conectadas</h2>
        <p className="xp-desc">Dados sincronizados pelo Open Finance.</p>
        <div className="xp-bank-grid">
          {(painel?.conexoes ?? []).map((conta) => (
            <article className="xp-bank-card" key={`${conta.instituicao}-${conta.tipoConta}`}>
              <div className="xp-bank-heading">
                <div><h3>{conta.instituicao}</h3><p>{conta.tipoConta}</p></div>
                <span className="xp-tag lime">{conta.consentimento ? "Conectado" : "Pendente"}</span>
              </div>
              <dl className="xp-client-details">
                <div><dt>Saldo disponível</dt><dd>{moeda.format(conta.saldoDisponivel)}</dd></div>
                <div><dt>Fatura atual</dt><dd>{moeda.format(conta.faturaAtual)}</dd></div>
                <div><dt>Score de crédito</dt><dd>{conta.scoreCredito}</dd></div>
                <div><dt>Autorizado em</dt><dd>{dataBr(conta.dataAutorizacao)}</dd></div>
                <div><dt>Portabilidade</dt><dd>{conta.portabilidadeEmAndamento ? "Em andamento" : "Não iniciada"}</dd></div>
              </dl>
              {conta.detalhesPortabilidade && <p className="xp-bank-note">{conta.detalhesPortabilidade}</p>}
            </article>
          ))}
        </div>
        {!painel?.conexoes.length && (
          <p className="xp-placeholder">Nenhuma conta conectada no momento.</p>
        )}
      </section>
    </>
  );
}
