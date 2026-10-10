import Link from "next/link";

import type { DadosPessoais } from "@/modules/usuarios";
import { formatarMoeda, formatarPercentual } from "@/shared/formatar";

import {
  CENARIOS,
  DIVISAO_PATRIMONIO,
  INVESTIMENTOS_FUTUROS,
  PATRIMONIO_REFERENCIA,
  projetar,
  rendimentoEsperado,
} from "./cenarios";
import { preenchimentoDoPerfil } from "./preenchimento";

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

export function PainelCliente({
  nome,
  email,
  dados,
  questionarioPreenchido,
}: {
  nome: string;
  email: string;
  dados: DadosPessoais | null;
  questionarioPreenchido: boolean;
}) {
  const esperado = rendimentoEsperado();
  const maisProvavel = CENARIOS.reduce((atual, cenario) =>
    cenario.probabilidade > atual.probabilidade ? cenario : atual,
  );
  const perfil = preenchimentoDoPerfil({ nome, email, dados, questionarioPreenchido });
  const completo = perfil.fracao === 1;

  return (
    <>
      <section className="xp-card xp-perfil-aviso" aria-label="Preenchimento do perfil">
        <p className="xp-kicker">SEU PERFIL</p>
        <h2>{formatarPercentual(perfil.fracao, { casas: 0 })} preenchido</h2>
        <p className="xp-desc">
          {perfil.preenchidos} de {perfil.total} informações da sua conta.
          {completo ? "" : " Complete o que falta para a assessoria conhecer você."}
        </p>
        <div
          className="xp-bar"
          role="meter"
          aria-label="Porcentagem de preenchimento do perfil"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(perfil.fracao * 100)}
        >
          <i style={{ width: `${perfil.fracao * 100}%` }} />
        </div>
        <Link className="xp-btn" href="/cliente/perfil">
          {completo ? "Ver perfil" : "Completar perfil"}
        </Link>
      </section>

      <header className="xp-head">
        <div>
          <div className="xp-kicker">ÁREA DO CLIENTE</div>
          <h1>Olá, {primeiroNome(nome)}</h1>
          <p>Seus investimentos, a chance de cada cenário de rendimento e o que está previsto para os próximos meses.</p>
        </div>
        <Link className="xp-btn lime xp-cta" href="/cliente/reunioes">
          Ver reuniões
        </Link>
      </header>

      <div className="xp-grid-stats">
        <section className="xp-card xp-stat">
          <label>Patrimônio investido</label>
          <strong>{formatarMoeda(PATRIMONIO_REFERENCIA)}</strong>
          <p className="xp-note">Só a sua carteira</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Rendimento esperado</label>
          <strong>{formatarPercentual(esperado)}</strong>
          <p className="xp-note">Em 12 meses, ponderado pelos cenários</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Cenário mais provável</label>
          <strong>{maisProvavel.nome}</strong>
          <p className="xp-note">{formatarPercentual(maisProvavel.probabilidade)} de chance</p>
        </section>
        <section className="xp-card xp-stat">
          <label>Próximo aporte</label>
          <strong>{formatarMoeda(4_500)}</strong>
          <p className="xp-note">Previsto para todo mês</p>
        </section>
      </div>

      <section className="xp-card xp-section">
        <h2>Probabilidade de rendimento</h2>
        <p className="xp-desc">
          Três caminhos para os próximos 12 meses da sua carteira. A chance de cada um está explícita. Isto não é
          recomendação de investimento.
        </p>
        <div className="xp-cenarios" aria-label="Cenários de rendimento">
          {CENARIOS.map((cenario) => (
            <div key={cenario.id} className="xp-cenario">
              <b>{cenario.nome}</b>
              <div className="xp-bar" title={`${formatarPercentual(cenario.probabilidade)} de chance`}>
                <i style={{ width: `${cenario.probabilidade * 100}%` }} />
              </div>
              <span>{formatarPercentual(cenario.probabilidade)}</span>
              <small>
                {formatarPercentual(cenario.rendimento, { sinal: true })} · {formatarMoeda(projetar(PATRIMONIO_REFERENCIA, cenario.rendimento))}
              </small>
            </div>
          ))}
        </div>
      </section>

      <section className="xp-card xp-section">
        <h2>Investimentos futuros</h2>
        <p className="xp-desc">Aportes e vencimentos previstos na sua conta. Não inclui a carteira de outros clientes.</p>
        <div className="xp-table-wrap">
          <table className="xp-table">
            <caption className="xp-sr">Investimentos futuros</caption>
            <thead>
              <tr>
                <th scope="col">Investimento</th>
                <th scope="col">Quando</th>
                <th scope="col">Valor</th>
                <th scope="col">Destino</th>
              </tr>
            </thead>
            <tbody>
              {INVESTIMENTOS_FUTUROS.map((item) => (
                <tr key={item.nome}>
                  <th scope="row">{item.nome}</th>
                  <td>{item.quando}</td>
                  <td>{formatarMoeda(item.valor)}</td>
                  <td>{item.destino}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="xp-card xp-section" aria-labelledby="divisao-titulo">
        <h2 id="divisao-titulo">Onde está o patrimônio</h2>
        <p className="xp-desc">Divisão demonstrativa da sua carteira. Cada ícone é uma parte do total.</p>
        <ul className="xp-fatias">
          {DIVISAO_PATRIMONIO.map((parte) => (
            <li key={parte.id} className="xp-fatia">
              <span className="xp-fatia-icone" aria-hidden="true">
                {parte.icone}
              </span>
              <b>{parte.nome}</b>
              <small>
                {formatarPercentual(parte.fracao, { casas: 0 })} · {formatarMoeda(PATRIMONIO_REFERENCIA * parte.fracao)}
              </small>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
