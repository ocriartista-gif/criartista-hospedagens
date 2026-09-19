import Link from "next/link";
import { LeadPriorityBadge } from "@/components/admin/LeadPriorityBadge";
import { StatCard } from "@/components/admin/StatCard";
import { getAdminContext } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { supabase, membership } = await getAdminContext();

  const [{ data: queue }, { data: accommodations }] = await Promise.all([
    supabase
      .from("lead_priority_queue")
      .select("*")
      .eq("property_id", membership.property_id)
      .order("priority_score", { ascending: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("accommodations")
      .select("id,published")
      .eq("property_id", membership.property_id),
  ]);

  const all = (queue ?? []).filter((lead) => Boolean(lead.id));
  const workQueue = all.filter(
    (lead) => lead.queue_type === "atender" && !lead.do_not_contact
  );
  const urgent = workQueue.filter((lead) =>
    ["urgente", "alta"].includes(lead.priority_level ?? "")
  );
  const overdue = workQueue.filter((lead) =>
    (lead.priority_reasons ?? []).some((reason) =>
      ["Follow-up vencido", "Contato agendado vencido"].includes(reason)
    )
  );
  const reactivation = all.filter(
    (lead) => lead.queue_type === "reativar" && !lead.do_not_contact
  );
  const publishedRooms = (accommodations ?? []).filter(
    (item) => item.published
  ).length;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>O que precisa da sua atenção hoje.</h1>
        </div>
        <div className="admin-user">
          {membership.display_name || membership.email || "Usuário"} · Proprietário
        </div>
      </header>

      {overdue.length > 0 && (
        <section className="commercial-alert">
          <div>
            <span className="eyebrow">Atenção comercial</span>
            <strong>
              {overdue.length} contato(s) já passaram do horário planejado.
            </strong>
            <p>
              Follow-ups e retornos combinados vencidos sobem automaticamente
              na fila de prioridade.
            </p>
          </div>
          <Link className="button button-primary" href="/admin/leads?view=atender">
            Abrir fila
          </Link>
        </section>
      )}

      <div className="stats-grid">
        <StatCard
          label="Para atender"
          value={workQueue.length}
          note="fila comercial"
        />
        <StatCard
          label="Alta prioridade"
          value={urgent.length}
          note="atacar primeiro"
        />
        <StatCard
          label="Reativar"
          value={reactivation.length}
          note="oportunidades sazonais"
        />
        <StatCard
          label="Acomodações"
          value={publishedRooms}
          note="publicadas"
        />
      </div>

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Fila comercial</span>
            <h2>Próximos contatos</h2>
          </div>
          <Link href="/admin/leads">Abrir CRM →</Link>
        </div>

        {workQueue.length ? (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Prioridade</th>
                <th>Lead</th>
                <th>Por quê</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {workQueue.slice(0, 6).map((lead) => (
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
                  </td>
                  <td className="crm-reason">
                    {(lead.priority_reasons ?? []).slice(0, 2).join(" · ") ||
                      "Definir próximo passo"}
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
        ) : (
          <div className="commercial-clear">
            <strong>Fila comercial zerada.</strong>
            <span>
              Nenhum lead ativo exige contato agora. O sistema continuará
              acompanhando follow-ups e datas futuras.
            </span>
          </div>
        )}
      </section>
    </>
  );
}
