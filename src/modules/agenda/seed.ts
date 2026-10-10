import "server-only";

import { db } from "@/core/db";
import type { Aleatorio } from "@/shared/aleatorio";
import type { ContextoSeed } from "@/shared/contexto-seed";

import { agendaReunioes } from "./reunioes/db";
import { instanteDe, somarMinutos } from "./reunioes/regras";
import type { CategoriaMotivo, Lado, Modalidade, StatusReuniao } from "./reunioes/schema";

/** Data (AAAA-MM-DD) de hoje + `dias`, no fuso de Brasília. */
function diaDaqui(dias: number): string {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const data = new Date(`${hoje}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

type Modelo = {
  cliente: number; // índice do cliente de demo (0 = usuario1)
  convocante: Lado;
  dias: number;
  hora: string;
  duracaoMin: number;
  modalidade: Modalidade;
  local: string | null;
  motivoCategoria: CategoriaMotivo;
  motivoDescricao: string;
  status: StatusReuniao;
};

const MODELOS: readonly Modelo[] = [
  {
    cliente: 0, convocante: "CLIENTE", dias: 2, hora: "10:00", duracaoMin: 30, modalidade: "ONLINE", local: null,
    motivoCategoria: "RESGATE", motivoDescricao: "Quero entender os prazos de resgate dos meus títulos.", status: "PENDENTE",
  },
  {
    cliente: 1, convocante: "ASSESSOR", dias: 3, hora: "15:00", duracaoMin: 60, modalidade: "PRESENCIAL",
    local: "Escritório da assessoria (endereço fictício)", motivoCategoria: "REVISAO_CARTEIRA",
    motivoDescricao: "Revisão trimestral da carteira e dos títulos perto do limite do FGC.", status: "PENDENTE",
  },
  {
    cliente: 3, convocante: "CLIENTE", dias: 5, hora: "11:00", duracaoMin: 45, modalidade: "ONLINE", local: null,
    motivoCategoria: "PLANEJAMENTO", motivoDescricao: "Planejar a reserva para a compra de um imóvel.", status: "ACEITA",
  },
  {
    cliente: 2, convocante: "ASSESSOR", dias: -3, hora: "16:00", duracaoMin: 60, modalidade: "ONLINE", local: null,
    motivoCategoria: "NOVO_INVESTIMENTO", motivoDescricao: "Apresentar alternativas para o valor parado em conta.", status: "ACEITA",
  },
];

/**
 * Reuniões de demonstração entre o assessor de demo e os clientes de demo (npm run db:seed).
 * EXCEÇÃO à regra do banco idêntico: as datas são relativas ao dia do seed, para as reuniões
 * pendentes continuarem no futuro (e poderem ser aceitas) em qualquer dia da apresentação.
 */
export async function semearAgenda(aleatorio: Aleatorio, contexto: ContextoSeed): Promise<void> {
  const assessor = contexto.contas.find((c) => c.papel === "assessor");
  const clientes = contexto.contas.filter((c) => c.papel === "usuario");
  if (!assessor || clientes.length === 0) return;

  const criadoEm = new Date().toISOString();
  const linhas = MODELOS.flatMap((m) => {
    const cliente = clientes[m.cliente];
    if (!cliente) return [];
    const inicio = instanteDe(diaDaqui(m.dias), m.hora);
    return [
      {
        id: aleatorio.uuid(),
        assessorId: assessor.id,
        clienteId: cliente.id,
        convocante: m.convocante,
        inicio,
        fim: somarMinutos(inicio, m.duracaoMin),
        motivoCategoria: m.motivoCategoria,
        motivoDescricao: m.motivoDescricao,
        modalidade: m.modalidade,
        local: m.local,
        status: m.status,
        justificativa: null,
        respondidaEm: m.status === "PENDENTE" ? null : criadoEm,
        criadoEm,
      },
    ];
  });
  if (linhas.length > 0) await db.insert(agendaReunioes).values(linhas);
}
