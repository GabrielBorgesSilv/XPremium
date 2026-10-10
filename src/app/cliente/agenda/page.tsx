import { PaginaAgenda } from "@/app/_components/agenda/pagina-agenda";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AgendaClientePage({ searchParams }: Props) {
  return <PaginaAgenda area="cliente" parametros={await searchParams} />;
}
