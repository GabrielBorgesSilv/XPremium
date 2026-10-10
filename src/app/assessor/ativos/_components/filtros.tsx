import Link from "next/link";

import type { Categoria, FiltrosVisao } from "@/modules/assessor";

import { hrefAtivos, ROTULO_CATEGORIA } from "./rotulos";

const CATEGORIAS = Object.keys(ROTULO_CATEGORIA) as Categoria[];

/** Filtros por link: cada clique muda a URL e a página é refeita no servidor. */
export function Filtros({ filtros }: { filtros: FiltrosVisao }) {
  // Trocar de filtro fecha o painel lateral, para não mostrar um ativo que saiu da lista.
  const link = (mudancas: Partial<FiltrosVisao>) => hrefAtivos(filtros, { ...mudancas, ativo: undefined });

  return (
    <nav className="xp-filters" aria-label="Filtrar ativos">
      <Link className={`xp-filter${!filtros.categoria ? " active" : ""}`} href={link({ categoria: undefined })}>
        Todas
      </Link>
      {CATEGORIAS.map((categoria) => (
        <Link
          key={categoria}
          className={`xp-filter${filtros.categoria === categoria ? " active" : ""}`}
          href={link({ categoria })}
        >
          {ROTULO_CATEGORIA[categoria]}
        </Link>
      ))}
      <Link
        className={`xp-filter${filtros.alerta ? " active" : ""}`}
        href={link({ alerta: filtros.alerta ? undefined : "1" })}
      >
        ⚠ Só com alerta
      </Link>
    </nav>
  );
}
