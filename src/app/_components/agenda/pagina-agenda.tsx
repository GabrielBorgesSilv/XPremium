import Link from "next/link";

import {
  type AreaAgenda,
  CATEGORIAS_MOTIVO,
  DURACOES_MIN,
  obterAgenda,
  type ReuniaoVista,
  type Situacao,
} from "@/modules/agenda";
import {
  DIAS_SEMANA_CURTOS,
  deslocarMes,
  diaEmBrasilia,
  gradeDoMes,
  mesValido,
  nomeDoMes,
} from "@/shared/calendario";

import { hrefCliente } from "../../assessor/_components/rotas";
import { cancelarReuniaoAction, responderReuniaoAction } from "./actions";
import { FormularioReuniao } from "./formulario-reuniao";

type Parametros = Record<string, string | string[] | undefined>;

const SELO_SITUACAO: Record<Situacao, { texto: (nome: string) => string; classe: string }> = {
  AGUARDANDO_VOCE: { texto: () => "Aguardando sua resposta", classe: "mix" },
  AGUARDANDO_OUTRO: { texto: (nome) => `Aguardando ${nome.split(" ")[0]}`, classe: "ind" },
  CONFIRMADA: { texto: () => "Confirmada", classe: "pos" },
  RECUSADA: { texto: () => "Recusada", classe: "neg" },
  CANCELADA: { texto: () => "Cancelada", classe: "ind" },
};

const hora = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const dataLonga = (dia: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "long", day: "2-digit", month: "long" }).format(
    new Date(`${dia}T12:00:00Z`),
  );

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

function hrefAgenda(area: AreaAgenda, p: { mes?: string; dia?: string; nova?: boolean }): string {
  const params = new URLSearchParams();
  if (p.mes) params.set("mes", p.mes);
  if (p.dia) params.set("dia", p.dia);
  if (p.nova) params.set("nova", "1");
  const q = params.toString();
  return q ? `/${area}/agenda?${q}` : `/${area}/agenda`;
}

/** Campos ocultos que toda ação leva, para voltar ao mesmo mês/dia. */
function Contexto({ area, mes, dia, id }: { area: AreaAgenda; mes: string; dia: string; id: string }) {
  return (
    <>
      <input type="hidden" name="area" value={area} />
      <input type="hidden" name="mes" value={mes} />
      <input type="hidden" name="dia" value={dia} />
      <input type="hidden" name="id" value={id} />
    </>
  );
}

function ItemReuniao({ r, area, mes, dia }: { r: ReuniaoVista; area: AreaAgenda; mes: string; dia: string }) {
  const selo = SELO_SITUACAO[r.situacao];
  return (
    <article className="xp-reuniao">
      <div className="xp-reuniao-hora">
        <b>{hora(r.inicio)}</b>
        <small>até {hora(r.fim)}</small>
      </div>
      <div className="xp-reuniao-corpo">
        <div className="xp-news-tags">
          <span className={`xp-tag ${selo.classe}`}>{selo.texto(r.comQuem.nome)}</span>
          <span className="xp-tag">{r.modalidade === "ONLINE" ? "Online" : "Presencial"}</span>
          <span className="xp-tag">{CATEGORIAS_MOTIVO[r.motivoCategoria]}</span>
        </div>
        <b>
          {area === "assessor" ? <Link href={hrefCliente(r.comQuem.id)}>{r.comQuem.nome}</Link> : r.comQuem.nome}
          <small> · {r.convocadaPorVoce ? "você convidou" : "convidou você"} · {dataLonga(diaEmBrasilia(r.inicio))}</small>
        </b>
        <p>{r.motivoDescricao}</p>
        {r.local && <p className="xp-note">📍 {r.local}</p>}
        {r.justificativa && <p className="xp-note">Motivo informado: {r.justificativa}</p>}

        {r.podeResponder && (
          <form action={responderReuniaoAction} className="xp-reuniao-acoes">
            <Contexto area={area} mes={mes} dia={dia} id={r.id} />
            <input name="justificativa" maxLength={300} placeholder="Motivo da recusa (opcional)" />
            <button className="xp-btn lime" type="submit" name="resposta" value="aceitar">Aceitar</button>
            <button className="xp-filter" type="submit" name="resposta" value="recusar">Recusar</button>
          </form>
        )}

        {r.podeCancelar && (
          <details className="xp-reuniao-cancelar">
            <summary>Cancelar reunião</summary>
            <form action={cancelarReuniaoAction} className="xp-reuniao-acoes">
              <Contexto area={area} mes={mes} dia={dia} id={r.id} />
              <input name="justificativa" maxLength={300} placeholder="Motivo do cancelamento (opcional)" />
              <button className="xp-filter" type="submit">Confirmar cancelamento</button>
            </form>
          </details>
        )}
      </div>
    </article>
  );
}

/** Página de agenda, igual para assessor e cliente; a área define de que lado o usuário está. */
export async function PaginaAgenda({ area, parametros }: { area: AreaAgenda; parametros: Parametros }) {
  const agenda = await obterAgenda(area);
  const hoje = diaEmBrasilia(agenda.agora);
  const mesParam = texto(parametros.mes);
  const mes = mesValido(mesParam) ? mesParam : hoje.slice(0, 7);
  const diaParam = texto(parametros.dia);
  const dia = diaParam && /^\d{4}-\d{2}-\d{2}$/.test(diaParam) ? diaParam : mes === hoje.slice(0, 7) ? hoje : `${mes}-01`;
  const novaAberta = texto(parametros.nova) === "1";
  const aviso = texto(parametros.aviso)?.slice(0, 200);

  const agora = Date.parse(agenda.agora);
  const ativas = (r: ReuniaoVista) => r.status === "PENDENTE" || r.status === "ACEITA";
  const convites = agenda.reunioes.filter((r) => r.podeResponder);
  const doDia = agenda.reunioes.filter((r) => diaEmBrasilia(r.inicio) === dia);
  const proximas = agenda.reunioes.filter((r) => ativas(r) && !r.podeResponder && Date.parse(r.inicio) > agora);
  const historico = agenda.reunioes
    .filter((r) => !ativas(r) || Date.parse(r.inicio) <= agora)
    .reverse();

  const porDia = new Map<string, ReuniaoVista[]>();
  for (const r of agenda.reunioes.filter(ativas)) {
    const d = diaEmBrasilia(r.inicio);
    porDia.set(d, [...(porDia.get(d) ?? []), r]);
  }

  const semParticipantes = agenda.participantes.length === 0;

  return (
    <>
      <div className="xp-head">
        <div>
          <div className="xp-kicker">AGENDA</div>
          <h1>Minha agenda</h1>
          <p>
            {area === "assessor"
              ? "Reuniões com os seus clientes. Quem é convidado precisa aceitar."
              : "Reuniões com o seu assessor. Quem é convidado precisa aceitar."}
          </p>
        </div>
        {!semParticipantes && !novaAberta && (
          <Link className="xp-btn lime" href={hrefAgenda(area, { mes, dia, nova: true })}>＋ Nova reunião</Link>
        )}
      </div>

      {aviso && <div className="xp-warn" role="status">{aviso}</div>}
      {semParticipantes && (
        <div className="xp-warn">
          {area === "assessor"
            ? "Você ainda não tem clientes vinculados, então não há com quem marcar reuniões."
            : "Você ainda não tem um assessor vinculado. Assim que tiver, poderá marcar reuniões com ele."}
        </div>
      )}

      {convites.length > 0 && (
        <section className="xp-card xp-section xp-destaque">
          <h2>Aguardando sua resposta · {convites.length}</h2>
          <p className="xp-desc">Convites que você recebeu. A reunião só é confirmada quando você aceita.</p>
          {convites.map((r) => <ItemReuniao key={r.id} r={r} area={area} mes={mes} dia={dia} />)}
        </section>
      )}

      {novaAberta && !semParticipantes && (
        <section className="xp-card xp-section">
          <h2>Nova reunião</h2>
          <p className="xp-desc">Todos os campos são obrigatórios; o local, só para reunião presencial.</p>
          <FormularioReuniao
            area={area}
            participantes={agenda.participantes}
            categorias={Object.entries(CATEGORIAS_MOTIVO)}
            duracoes={DURACOES_MIN}
            diaSugerido={dia < hoje ? hoje : dia}
            hoje={hoje}
            hrefFechar={hrefAgenda(area, { mes, dia })}
          />
        </section>
      )}

      <div className="xp-columns">
        <section className="xp-card">
          <div className="xp-cal-topo">
            <Link className="xp-filter" href={hrefAgenda(area, { mes: deslocarMes(mes, -1) })} aria-label="Mês anterior">‹</Link>
            <h2>{nomeDoMes(mes)}</h2>
            <Link className="xp-filter" href={hrefAgenda(area, { mes: deslocarMes(mes, 1) })} aria-label="Próximo mês">›</Link>
          </div>
          <div className="xp-cal" role="grid" aria-label={`Calendário de ${nomeDoMes(mes)}`}>
            {DIAS_SEMANA_CURTOS.map((d) => <div key={d} className="xp-cal-semana">{d}</div>)}
            {gradeDoMes(mes).flat().map(({ data, doMes }) => {
              const doDiaCal = porDia.get(data) ?? [];
              const classes = ["xp-cal-dia", doMes ? "" : "fora", data === hoje ? "hoje" : "", data === dia ? "selecionado" : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <Link key={data} className={classes} href={hrefAgenda(area, { mes, dia: data })} scroll={false}>
                  <span className="xp-cal-num">{Number(data.slice(8))}</span>
                  {doDiaCal.slice(0, 2).map((r) => (
                    <span key={r.id} className={`xp-cal-chip ${SELO_SITUACAO[r.situacao].classe}`}>
                      {hora(r.inicio)} {r.comQuem.nome.split(" ")[0]}
                    </span>
                  ))}
                  {doDiaCal.length > 2 && <span className="xp-cal-mais">+{doDiaCal.length - 2}</span>}
                </Link>
              );
            })}
          </div>
          <div className="xp-legend">
            <span><i style={{ background: "#176b50" }} />Confirmada</span>
            <span><i style={{ background: "#c98a27" }} />Aguardando você</span>
            <span><i style={{ background: "#9a9a94" }} />Aguardando o outro</span>
          </div>
        </section>

        <section className="xp-card">
          <h2>{dataLonga(dia)}</h2>
          <p className="xp-desc">{doDia.length === 0 ? "Nenhuma reunião neste dia." : `${doDia.length} reunião(ões)`}</p>
          {doDia.map((r) => <ItemReuniao key={r.id} r={r} area={area} mes={mes} dia={dia} />)}
        </section>
      </div>

      <section className="xp-card xp-section">
        <h2>Próximas reuniões</h2>
        <p className="xp-desc">Confirmadas e convites que você enviou</p>
        {proximas.length === 0 ? (
          <p className="xp-note">Nenhuma reunião marcada.</p>
        ) : (
          proximas.map((r) => <ItemReuniao key={r.id} r={r} area={area} mes={mes} dia={dia} />)
        )}
      </section>

      {historico.length > 0 && (
        <details className="xp-card xp-historico">
          <summary>Histórico · {historico.length}</summary>
          {historico.map((r) => <ItemReuniao key={r.id} r={r} area={area} mes={mes} dia={dia} />)}
        </details>
      )}
    </>
  );
}
