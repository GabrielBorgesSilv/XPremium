import Link from "next/link";

import { CabecalhoPerfil, CardConta, CardDadosPessoais, CardSeguranca } from "@/app/_components/perfil";
import { obterResumoAssessor } from "@/modules/assessor";
import { buscarDadosPessoais, exigirPapel } from "@/modules/usuarios";
import { formatarData, formatarMoedaCompacta } from "@/shared/formatar";

export default async function PerfilAssessorPage() {
  // O layout já exige o papel; aqui pegamos os dados do usuário logado.
  const usuario = await exigirPapel("assessor");
  const [dados, carteira] = await Promise.all([buscarDadosPessoais(usuario.id), obterResumoAssessor()]);

  const numeros: { rotulo: string; valor: string; href: string; link: string }[] = [
    { rotulo: "Clientes vinculados", valor: String(carteira.numClientes), href: "/assessor/clientes", link: "Ver clientes" },
    { rotulo: "Patrimônio sob gestão", valor: formatarMoedaCompacta(carteira.patrimonioSobGestao), href: "/assessor/ativos", link: "Ver investimentos" },
    { rotulo: "Clientes com pontos de atenção", valor: String(carteira.clientesComAtencao), href: "/assessor/clientes?atencao=1", link: "Ver quais" },
    { rotulo: "Ativos com alerta de notícia", valor: String(carteira.ativosComAlerta), href: "/assessor/ativos?alerta=1", link: "Ver ativos" },
    { rotulo: "Clientes acima do FGC", valor: String(carteira.clientesAcimaFGC), href: "/assessor/ativos", link: "Ver aviso" },
  ];

  return (
    <>
      <CabecalhoPerfil usuario={usuario} />

      <div className="xp-columns">
        <CardConta usuario={usuario} />
        <CardDadosPessoais dados={dados} />
      </div>

      <section className="xp-card xp-section">
        <h2>Minha carteira</h2>
        <p className="xp-desc">
          Clientes vinculados e dados de demonstração · ref. {formatarData(carteira.asOf)}
        </p>
        <div className="xp-metrics xp-metrics-5">
          {numeros.map((n) => (
            <div key={n.rotulo}>
              <span>{n.rotulo}</span>
              <b>{n.valor}</b>
              <Link className="xp-mini-link" href={n.href}>{n.link} →</Link>
            </div>
          ))}
        </div>
      </section>

      <CardSeguranca />
    </>
  );
}
