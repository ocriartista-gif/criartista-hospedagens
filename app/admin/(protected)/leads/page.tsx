import Link from "next/link";
import { LeadPriorityBadge } from "@/components/admin/LeadPriorityBadge";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminContext } from "@/lib/data/admin";
import type { Tables } from "@/types/database";

export const dynamic = "force-dynamic";

type QueueLead = Tables<"lead_priority_queue">;

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

  if (lead.check_in) return `Estadia solicitada: ${formatDate(lead.check_in)}`;

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
}: {
  leads: QueueLead[];
  roomNames: Map<string, string>;
}) {
  if (!leads.length) {
    return <p className="empty-state">Nenhum contato nesta fila agora.</p>;
  }

  return (
    <table className="crm-table">
      <thead>
        <tr>
          <th>Prioridade</th>
          <th>Lead</th>
          <th>Motivo</th>
          <th>Próxima ação</th>
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
              <Link className="lead-name-link" href={`/admin/leads/${lead.id}`}>
                {lead.name}
              </Link>
              <small>{lead.whatsapp}</small>
              {lead.accommodation_id && (
                <small>
                  {roomNames.get(lead.accommodation_id) ?? "Acomodação removida"}
                </small>
              )}
            </td>
            <td className="crm-reason">{reasonText(lead)}</td>
            <td>{nextAction(lead)}</td>
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

export default async function LeadsPage() {
  const { supabase, membership } = await getAdminContext();

  const [{ data: queue, error }, { data: accommodations, error: roomsError }] =
    await Promise.all([
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
    ]);

  if (error) throw error;
  if (roomsError) throw roomsError;

  const allLeads = (queue ?? []).filter((lead): lead is QueueLead & { id: string } =>
    Boolean(lead.id)
  );

  const workQueue = allLeads.filter(
    (lead) => lead.queue_type === "atender" && !lead.do_not_contact
  );
  const reactivationQueue = allLeads.filter(
    (lead) => lead.queue_type === "reativar" && !lead.do_not_contact
  );
  const otherLeads = allLeads.filter(
    (lead) =>
      !["atender", "reativar"].includes(lead.queue_type ?? "") ||
      Boolean(lead.do_not_contact)
  );

  const highPriority = workQueue.filter((lead) =>
    ["urgente", "alta"].includes(lead.priority_level ?? "")
  ).length;

  const overdue = workQueue.filter((lead) =>
    (lead.priority_reasons ?? []).some((reason) =>
      ["Follow-up vencido", "Contato agendado vencido"].includes(reason)
    )
  ).length;

  const roomNames = new Map(
    (accommodations ?? []).map((room) => [room.id, room.name])
  );

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

      <section className="admin-panel crm-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Fila 1</span>
            <h2>Atender agora</h2>
          </div>
          <span className="queue-count">{workQueue.length} contato(s)</span>
        </div>
        <LeadTable leads={workQueue} roomNames={roomNames} />
      </section>

      <section className="admin-panel crm-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Fila 2</span>
            <h2>Reativar oportunidades</h2>
          </div>
          <span className="queue-count">{reactivationQueue.length} contato(s)</span>
        </div>
        <p className="section-note">
          Leads antigos cuja época de viagem volta a se aproximar. Reservas
          anteriores recebem um pequeno reforço de prioridade por potencial de
          recompra.
        </p>
        <LeadTable leads={reactivationQueue} roomNames={roomNames} />
      </section>

      {otherLeads.length > 0 && (
        <section className="admin-panel crm-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Base</span>
              <h2>Outros contatos</h2>
            </div>
            <span className="queue-count">{otherLeads.length} contato(s)</span>
          </div>
          <LeadTable leads={otherLeads} roomNames={roomNames} />
        </section>
      )}
    </>
  );
}
