import { listarPatrimonio } from "@/modules/cliente";
import { exigirPapel } from "@/modules/usuarios";

const categorias = {
  renda_fixa: "Renda fixa",
  renda_variavel: "Renda variável",
  fundos: "Fundos",
  imoveis: "Imóveis",
  outros: "Outros",
} as const;

function dataBr(data: string | undefined): string {
  if (!data) {
    return "—";
  }

  const dataNormalizada = data.includes("T") ? data : `${data.replace(" ", "T")}Z`;
  const dataObjeto = new Date(dataNormalizada);
  return Number.isNaN(dataObjeto.getTime())
    ? "—"
    : dataObjeto.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function PatrimonioPage() {
  const usuario = await exigirPapel("usuario");
  const ativos = await listarPatrimonio(usuario.id);

  return (
    <>
      <div className="xp-head">
        <div>
          <div className="xp-kicker">INVESTIMENTOS</div>
          <h1>Meus ativos</h1>
          <p>Consulte as posições vinculadas à sua conta.</p>
        </div>
      </div>

      <section className="xp-card">
        <h2>Carteira de ativos</h2>
        <p className="xp-desc">
          {ativos.length} {ativos.length === 1 ? "ativo registrado" : "ativos registrados"}.
        </p>
        {ativos.length === 0 ? (
          <div className="xp-placeholder">
            <p>Nenhum ativo registrado na sua carteira.</p>
          </div>
        ) : (
          <div className="xp-table-wrap">
            <table className="xp-table">
              <thead>
                <tr>
                  <th>Instituição</th>
                  <th>Categoria</th>
                  <th>Valor atual</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {ativos.map((ativo) => (
                  <tr key={ativo.id}>
                    <td>{ativo.instituicao}</td>
                    <td>{categorias[ativo.categoria]}</td>
                    <td>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: ativo.moeda,
                      }).format(ativo.valorAtual)}
                    </td>
                    <td>{dataBr(ativo.atualizadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
