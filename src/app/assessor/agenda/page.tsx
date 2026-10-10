import { PaginaAgenda } from "@/app/_components/agenda/pagina-agenda";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AgendaAssessorPage({ searchParams }: Props) {
  return <PaginaAgenda area="assessor" parametros={await searchParams} />;
}
