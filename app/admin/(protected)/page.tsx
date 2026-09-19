import { StatCard } from "@/components/admin/StatCard";
import { accommodations, leads } from "@/lib/mock-data";

export default function AdminHome() {
  const newLeads = leads.filter((lead) => lead.status === "novo").length;
  return <><header className="admin-header"><div><span className="eyebrow">Visão geral</span><h1>O que precisa da sua atenção hoje.</h1></div><div className="admin-user">Juliana · Gerente</div></header><div className="stats-grid"><StatCard label="Novos leads" value={newLeads} note="aguardando contato"/><StatCard label="Em atendimento" value={leads.length - newLeads}/><StatCard label="Acomodações" value={accommodations.filter((item) => item.published).length}/><StatCard label="Reservados" value="—" note="entra com o CRM real"/></div><section className="admin-panel"><div className="panel-heading"><h2>Leads recentes</h2><a href="/admin/leads">Ver todos →</a></div><table><thead><tr><th>Nome</th><th>Período</th><th>Origem</th><th>Status</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td>{lead.name}</td><td>{lead.checkIn} → {lead.checkOut}</td><td>{lead.source}</td><td><span className={`badge badge-${lead.status}`}>{lead.status.replaceAll("_", " ")}</span></td></tr>)}</tbody></table></section></>;
}
