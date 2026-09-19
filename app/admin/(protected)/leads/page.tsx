import { getAdminContext } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { supabase, membership } = await getAdminContext();

  const [{ data: leads, error: leadsError }, { data: accommodations, error: roomsError }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("property_id", membership.property_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("accommodations")
        .select("id, name")
        .eq("property_id", membership.property_id),
    ]);

  if (leadsError) throw leadsError;
  if (roomsError) throw roomsError;

  const roomNames = new Map(
    (accommodations ?? []).map((room) => [room.id, room.name])
  );

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">CRM</span>
          <h1>Leads</h1>
          <p>Origem, estágio comercial e próximos passos em um só lugar.</p>
        </div>
      </header>

      <section className="admin-panel">
        {(leads ?? []).length ? (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Período</th>
                <th>Acomodação</th>
                <th>Origem</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(leads ?? []).map((lead) => (
                <tr key={lead.id}>
                  <td>
                    {lead.name}
                    <small>{lead.whatsapp}</small>
                    {lead.email && <small>{lead.email}</small>}
                  </td>
                  <td>
                    {lead.check_in ?? "—"} → {lead.check_out ?? "—"}
                    {lead.nights && <small>{lead.nights} noite(s)</small>}
                  </td>
                  <td>
                    {lead.accommodation_id
                      ? roomNames.get(lead.accommodation_id) ?? "Acomodação removida"
                      : "Sem preferência"}
                  </td>
                  <td>
                    {lead.source ?? "site"}
                    {lead.campaign && <small>{lead.campaign}</small>}
                  </td>
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
          <p>
            Ainda não há leads registrados. Quando alguém enviar uma consulta
            pelo site, ela aparecerá aqui.
          </p>
        )}
      </section>
    </>
  );
}
