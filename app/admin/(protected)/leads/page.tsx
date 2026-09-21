import Link from "next/link";
import { LeadPriorityBadge } from "@/components/admin/LeadPriorityBadge";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminContext } from "@/lib/data/admin";
import type { Tables } from "@/types/database";

export const dynamic = "force-dynamic";

type QueueLead = Tables<"lead_priority_queue">;
type ViewKey =
  | "atender"
  | "urgentes"
  | "followup"
  | "cotacao"
  | "meus"
  | "sem-responsavel"
  | "reativar"
  | "todos";

const filterOptions: { key: ViewKey; label: string }[] = [
  { key: "atender", label: "Atender agora" },
  { key: "urgentes", label: "Urgentes" },
  { key: "followup", label: "Follow-up hoje + vencidos" },
  { key: "cotacao", label: "Cotação enviada" },
  { key: "meus", label: "Meus leads" },
  { key: "sem-responsavel", label: "Sem responsável" },
  { key: "reativar", label: "Reativar" },
  { key: "todos", label: "Todos" },
];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T12:00:00Z`)
  );
}

function formatDateTime(value: string | null, timeZone: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: timeZone ?? "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function dateKey(value: string | null, timeZone: string | null) {
  if (!value) return null;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone ?? "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(value))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function nextAction(lead: QueueLead) {
  if (lead.do_not_contact) return "Não contatar";

  if (lead.scheduled_contact_at) {
    return `Contato marcado: ${formatDateTime(
      lead.scheduled_contact_at,
      lead.property_timezone
    )}`;
  }

  if (lead.next_follow_up) {
    return `Follow-up: ${formatDateTime(
      lead.next_follow_up,
      lead.property_timezone
    )}`;
  }

  if (lead.queue_type === "reativar" && lead.next_seasonal_date) {
    return `Reativar para época de ${formatDate(lead.next_seasonal_date)}`;
  }

  if (lead.status === "novo") return "Fazer primeiro contato";

  if (lead.check_in) {
    return `Estadia solicitada: ${formatDate(lead.check_in)}`;
  }

  return "Definir próximo passo";
}

function reasonText(lead: QueueLead) {
  const reasons = lead.priority_reasons ?? [];
  return reasons.length
    ? reasons.slice(0, 2).join(" · ")
    : "Sem gatilho especial no momento";
}

function LeadTable({
  leads,
  roomNames,
  memberNames,
}: {
  leads: QueueLead[];
  roomNames: Map<string, string>;
  memberNames: Map<string, string>;
}) {
  if (!leads.length) {
    return <p className="empty-state">Nenhum contato neste filtro agora.</p>;
  }

  return (
    <table className="crm-table">
      <thead>
        <tr>
          <th>Prioridade</th>
          <th>Lead</th>
          <th>Motivo</th>
          <th>Próxima ação</th>
          <th>Responsável</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td>
              <LeadPriorityBadge
                level={lead.priority_level}
                score={lead.priority_score}
              />
            </td>
            <td>
              <Link
                className="lead-name-link"
                href={`/admin/leads/${lead.id}`}
              >
                {lead.name}
              </Link>
              <small>{lead.whatsapp}</small>
              {lead.accommodation_id && (
                <small>
                  {roomNames.get(lead.accommodation_id) ??
                    "Acomodação removida"}
                </small>
              )}
            </td>
            <td className="crm-reason">{reasonText(lead)}</td>
            <td>{nextAction(lead)}</td>
            <td>
              {lead.assigned_to
                ? memberNames.get(lead.assigned_to) ?? "Usuário"
                : <span className="unassigned-label">Sem responsável</span>}
            </td>
            <td>
              <span className={`badge badge-${lead.status ?? "novo"}`}>
                {(lead.status ?? "novo").replaceAll("_", " ")}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function applyFilter(
  leads: QueueLead[],
  view: ViewKey,
  currentUserId: string
) {
  return leads.filter((lead) => {
    if (view === "todos") return true;

    if (view === "reativar") {
      return lead.queue_type === "reativar" && !lead.do_not_contact;
    }

    if (view === "urgentes") {
      return (
        lead.queue_type === "atender" &&
        !lead.do_not_contact &&
        ["urgente", "alta"].includes(lead.priority_level ?? "")
      );
    }

    if (view === "followup") {
      const followUpDate = dateKey(
        lead.next_follow_up,
        lead.property_timezone
      );
      return (
        lead.queue_type === "atender" &&
        !lead.do_not_contact &&
        Boolean(followUpDate) &&
        Boolean(lead.local_today) &&
        followUpDate! <= lead.local_today!
      );
    }

    if (view === "cotacao") {
      return (
        lead.status === "cotacao_enviada" &&
        !lead.do_not_contact
      );
    }

    if (view === "meus") {
      return (
        lead.assigned_to === currentUserId &&
        !lead.do_not_contact &&
        ["atender", "reativar"].includes(lead.queue_type ?? "")
      );
    }

    if (view === "sem-responsavel") {
      return (
        !lead.assigned_to &&
        !lead.do_not_contact &&
        !["reservado", "perdido"].includes(lead.status ?? "")
      );
    }

    return lead.queue_type === "atender" && !lead.do_not_contact;
  });
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: requestedView } = await searchParams;
  const view = filterOptions.some((item) => item.key === requestedView)
    ? (requestedView as ViewKey)
    : "atender";

  const { supabase, membership } = await getAdminContext(["owner", "manager", "reservations", "technical_admin"]);

  const [
    { data: queue, error },
    { data: accommodations, error: roomsError },
    { data: members, error: membersError },
  ] = await Promise.all([
    supabase
      .from("lead_priority_queue")
      .select("*")
      .eq("property_id", membership.property_id)
      .order("priority_score", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("accommodations")
      .select("id, name")
      .eq("property_id", membership.property_id),
    supabase
      .from("property_members")
      .select("user_id, display_name, email")
      .eq("property_id", membership.property_id),
  ]);

  if (error) throw error;
  if (roomsError) throw roomsError;
  if (membersError) throw membersError;

  const allLeads = (queue ?? []).filter(
    (lead): lead is QueueLead & { id: string } => Boolean(lead.id)
  );

  const workQueue = allLeads.filter(
    (lead) => lead.queue_type === "atender" && !lead.do_not_contact
  );
  const reactivationQueue = allLeads.filter(
    (lead) => lead.queue_type === "reativar" && !lead.do_not_contact
  );

  const highPriority = workQueue.filter((lead) =>
    ["urgente", "alta"].includes(lead.priority_level ?? "")
  ).length;

  const overdue = workQueue.filter((lead) =>
    (lead.priority_reasons ?? []).some((reason) =>
      ["Follow-up vencido", "Contato agendado vencido"].includes(reason)
    )
  ).length;

  const filteredLeads = applyFilter(
    allLeads,
    view,
    membership.user_id
  );

  const roomNames = new Map(
    (accommodations ?? []).map((room) => [room.id, room.name])
  );

  const memberNames = new Map(
    (members ?? []).map((member) => [
      member.user_id,
      member.display_name || member.email || "Usuário",
    ])
  );

  const selectedLabel =
    filterOptions.find((item) => item.key === view)?.label ?? "Atender agora";

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">CRM · Rotina comercial</span>
          <h1>Quem precisa ser chamado hoje.</h1>
          <p>
            A fila combina follow-ups, contatos marcados, proximidade da
            hospedagem, tempo sem retorno e oportunidades de reativação.
          </p>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard
          label="Para atender"
          value={workQueue.length}
          note="fila comercial ativa"
        />
        <StatCard
          label="Alta prioridade"
          value={highPriority}
          note="urgente ou alta"
        />
        <StatCard
          label="Vencidos"
          value={overdue}
          note="follow-up ou contato"
        />
        <StatCard
          label="Reativar"
          value={reactivationQueue.length}
          note="oportunidades sazonais"
        />
      </div>

      <nav className="crm-filters" aria-label="Filtros do CRM">
        {filterOptions.map((item) => (
          <Link
            key={item.key}
            href={`/admin/leads?view=${item.key}`}
            className={item.key === view ? "active" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <section className="admin-panel crm-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Fila selecionada</span>
            <h2>{selectedLabel}</h2>
          </div>
          <span className="queue-count">
            {filteredLeads.length} contato(s)
          </span>
        </div>

        <LeadTable
          leads={filteredLeads}
          roomNames={roomNames}
          memberNames={memberNames}
        />
      </section>
    </>
  );
}
