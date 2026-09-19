import { StatCard } from "@/components/admin/StatCard";
import { getAdminContext } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { supabase, membership } = await getAdminContext();
  const auth = await createClient();
  const { data: claimsData } = await auth.auth.getClaims();
  const email = String(claimsData?.claims?.email ?? "Usuário");

  const [{ data: leads }, { data: accommodations }] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("property_id", membership.property_id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("accommodations")
      .select("id,published")
      .eq("property_id", membership.property_id),
  ]);

  const allLeads = leads ?? [];
  const newLeads = allLeads.filter((lead) => lead.status === "novo").length;
  const inService = allLeads.filter((lead) =>
    ["contatado", "cotacao_enviada", "follow_up"].includes(lead.status)
  ).length;
  const reserved = allLeads.filter((lead) => lead.status === "reservado").length;
  const publishedRooms = (accommodations ?? []).filter((item) => item.published).length;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>O que precisa da sua atenção hoje.</h1>
        </div>
        <div className="admin-user">{email} · Proprietário</div>
      </header>

      <div className="stats-grid">
        <StatCard label="Novos leads" value={newLeads} note="aguardando contato" />
        <StatCard label="Em atendimento" value={inService} />
        <StatCard label="Acomodações" value={publishedRooms} note="publicadas" />
        <StatCard label="Reservados" value={reserved} />
      </div>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>Leads recentes</h2>
          <a href="/admin/leads">Ver todos →</a>
        </div>

        {allLeads.length ? (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Período</th>
                <th>Origem</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.check_in ?? "—"} → {lead.check_out ?? "—"}</td>
                  <td>{lead.source ?? "site"}</td>
                  <td>
                    <span className={`badge badge-${lead.status}`}>
                      {lead.status.replaceAll("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Ainda não há leads registrados. Quando alguém enviar uma consulta pelo site, ela aparecerá aqui.</p>
        )}
      </section>
    </>
  );
}
