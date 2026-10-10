import Link from "next/link";

type Role = "assessor" | "cliente";

const positions = [
  ["Tesouro IPCA+ 2029", "Renda fixa", "R$ 420.500", "+11,2%", "Ativo"],
  ["CDB Banco XP · 2027", "Renda fixa", "R$ 315.000", "+10,8%", "Ativo"],
  ["Fundo Atlas Macro", "Multimercado", "R$ 286.400", "+8,4%", "Ativo"],
  ["IVVB11", "Exterior", "R$ 198.250", "+14,6%", "Ativo"],
];

/** Primeiro nome do usuário logado para a saudação ("Carla Rocha" → "Carla"). */
function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function Heading({ role, userName }: { role: Role; userName: string }) {
  return <div className="xp-head"><div><div className="xp-kicker">{role === "assessor" ? "VISÃO DO ASSESSOR" : "ÁREA DO CLIENTE"}</div><h1>{role === "assessor" ? `Bom dia, ${firstName(userName)}` : `Olá, ${firstName(userName)}`}</h1><p>{role === "assessor" ? "Resumo das carteiras e dos próximos compromissos." : "Acompanhe seu patrimônio e seus investimentos."}</p></div><button className="xp-btn lime" type="button">＋ {role === "assessor" ? "Nova análise" : "Baixar extrato"}</button></div>;
}

function Stats({ role }: { role: Role }) {
  const stats = role === "assessor"
    ? [["Patrimônio sob gestão", "R$ 48,6 mi", "12,8%", "◈"], ["Clientes ativos", "24", "2 novos", "♙"], ["Rentabilidade média", "12,4%", "2,1%", "↗"], ["Oportunidades", "12", "3 prioritárias", "✳"]]
    : [["Meu patrimônio", "R$ 2,4 mi", "8,4%", "◈"], ["Investimentos", "08", "2 classes", "↗"], ["Rentabilidade", "12,4%", "2,1%", "⌁"], ["Próxima reunião", "14 Out", "10:30", "▦"]];
  return <div className="xp-grid-stats">{stats.map(([label, value, delta, icon]) => <section className="xp-card xp-stat" key={label}><label>{label}<span>{icon}</span></label><strong>{value}</strong><small>{delta} no período</small></section>)}</div>;
}

function Chart() {
  return <><svg className="xp-chart" viewBox="0 0 600 165" preserveAspectRatio="none" role="img" aria-label="Evolução patrimonial crescente nos últimos oito meses"><defs><linearGradient id="xp-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c8ff00" stopOpacity=".35"/><stop offset="1" stopColor="#c8ff00" stopOpacity="0"/></linearGradient></defs><path d="M0 134 C35 128 50 117 77 121 S120 101 152 110 S191 82 220 94 S270 74 300 81 S340 58 370 67 S410 43 444 55 S478 25 515 43 S559 15 600 20 L600 165 L0 165Z" fill="url(#xp-fill)"/><path d="M0 134 C35 128 50 117 77 121 S120 101 152 110 S191 82 220 94 S270 74 300 81 S340 58 370 67 S410 43 444 55 S478 25 515 43 S559 15 600 20" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/></svg><div className="xp-months"><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span></div></>;
}

function Allocation() {
  return <div className="xp-donut-row"><div className="xp-donut" role="img" aria-label="Gráfico de alocação por classe de ativo"/><div className="xp-alloc">{[["Renda fixa", "38%"], ["Fundos", "25%"], ["Ações", "17%"], ["Exterior", "12%"], ["Outros", "8%"]].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div></div>;
}

function Positions() {
  return <div className="xp-table-wrap"><table className="xp-table"><thead><tr><th>Ativo</th><th>Classe</th><th>Posição</th><th>Retorno</th><th>Status</th></tr></thead><tbody>{positions.map((position) => <tr key={position[0]}>{position.map((value, index) => <td key={index}>{index === 4 ? <span className="xp-tag lime">{value}</span> : value}</td>)}</tr>)}</tbody></table></div>;
}

function Events({ role }: { role: Role }) {
  return <div className="xp-events"><div className="xp-event"><span className="xp-event-date"><small>OUT</small>14</span><div><b>Revisão de carteira</b><p>10:30 · Ana Martins · Reunião online</p></div><span className="xp-tag lime">Confirmado</span></div><div className="xp-event"><span className="xp-event-date"><small>OUT</small>16</span><div><b>Vencimento de aplicação</b><p>14:00 · CDB Banco XP · R$ 85 mil</p></div><span className="xp-tag">Lembrete</span></div>{role === "assessor" && <Link className="xp-btn" style={{ display: "inline-block", marginTop: 12 }} href="/assessor/clientes">Ver clientes</Link>}</div>;
}

export function Dashboard({ role, userName }: { role: Role; userName?: string }) {
  const displayName = userName || (role === "assessor" ? "Mariana Costa" : "Ana Martins");

  return <><Heading role={role} userName={displayName}/><Stats role={role}/><div className="xp-columns"><section className="xp-card"><h2>Evolução patrimonial</h2><p className="xp-desc">Patrimônio consolidado · últimos 8 meses</p><Chart/></section><section className="xp-card"><h2>Alocação da carteira</h2><p className="xp-desc">Distribuição por classe de ativo</p><Allocation/></section></div><div className="xp-columns"><section className="xp-card"><h2>Investimentos em destaque</h2><p className="xp-desc">Posições com melhor acompanhamento</p><Positions/></section><section className="xp-card"><h2>Agenda compartilhada</h2><p className="xp-desc">Próximos compromissos assessor ↔ cliente</p><Events role={role}/></section></div></>;
}

export function ModulePage({ title, description }: { title: string; description: string }) {
  return <><div className="xp-head"><div><div className="xp-kicker">GESTÃO PATRIMONIAL</div><h1>{title}</h1><p>{description}</p></div><button className="xp-btn lime" type="button">＋ Adicionar</button></div><section className="xp-card"><h2>{title} em acompanhamento</h2><p className="xp-desc">Dados demonstrativos do protótipo</p><Positions/></section></>;
}
