import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadPriorityBadge } from "@/components/admin/LeadPriorityBadge";
import { getAdminContext } from "@/lib/data/admin";
import { registerContactNow, updateLead } from "../actions";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${value}T12:00:00Z`)
  );
}

function formatCurrency(value: number | null) {
  if (value == null) return "";
  return String(value);
}

function dateTimeInput(value: string | null, timeZone: string) {
  if (!value) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(value))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function formatDateTime(value: string | null, timeZone: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, membership, property } = await getAdminContext();

  const [{ data: lead, error }, { data: priority }] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .eq("property_id", membership.property_id)
      .maybeSingle(),
    supabase
      .from("lead_priority_queue")
      .select("*")
      .eq("id", id)
      .eq("property_id", membership.property_id)
      .maybeSingle(),
  ]);

  if (error) throw error;
  if (!lead) notFound();

  const { data: room } = lead.accommodation_id
    ? await supabase
        .from("accommodations")
        .select("name")
        .eq("id", lead.accommodation_id)
        .maybeSingle()
    : { data: null };

  const reasons = priority?.priority_reasons ?? [];

  return (
    <>
      <header className="admin-header">
        <div>
          <Link className="text-link" href="/admin/leads">← Voltar para leads</Link>
          <span className="eyebrow">CRM · Lead</span>
          <h1>{lead.name}</h1>
          <p>
            {lead.source ?? "site"} · criado em{" "}
            {formatDateTime(lead.created_at, property.timezone)}
          </p>
        </div>
        <LeadPriorityBadge
          level={priority?.priority_level ?? null}
          score={priority?.priority_score ?? null}
        />
      </header>

      <section className={`priority-explanation priority-box-${priority?.priority_level ?? "baixa"}`}>
        <div>
          <span className="eyebrow">Por que este lead está nesta posição?</span>
          <h2>
            {priority?.queue_type === "reativar"
              ? "Oportunidade de reativação"
              : "Prioridade comercial atual"}
          </h2>
        </div>
        <div className="priority-reasons">
          {reasons.length ? (
            reasons.map((reason) => <span key={reason}>{reason}</span>)
          ) : (
            <span>Sem gatilho especial de prioridade no momento.</span>
          )}
        </div>
      </section>

      <div className="lead-detail-grid">
        <section className="admin-panel lead-context">
          <div className="panel-heading">
            <h2>Contato e estadia</h2>
          </div>

          <dl className="lead-facts">
            <div><dt>WhatsApp</dt><dd>{lead.whatsapp}</dd></div>
            <div><dt>E-mail</dt><dd>{lead.email ?? "—"}</dd></div>
            <div><dt>Check-in</dt><dd>{formatDate(lead.check_in)}</dd></div>
            <div><dt>Check-out</dt><dd>{formatDate(lead.check_out)}</dd></div>
            <div><dt>Noites</dt><dd>{lead.nights ?? "—"}</dd></div>
            <div><dt>Hóspedes</dt><dd>{lead.adults} adulto(s) · {lead.children} criança(s)</dd></div>
            <div><dt>Acomodação</dt><dd>{room?.name ?? "Sem preferência"}</dd></div>
            <div><dt>Último contato</dt><dd>{formatDateTime(lead.last_contact, property.timezone)}</dd></div>
            <div><dt>Próximo follow-up</dt><dd>{formatDateTime(lead.next_follow_up, property.timezone)}</dd></div>
            <div><dt>Contato marcado</dt><dd>{formatDateTime(lead.scheduled_contact_at, property.timezone)}</dd></div>
          </dl>

          <div className="lead-contact-actions">
            <a
              className="button button-primary"
              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "").replace(/^55/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir WhatsApp
            </a>

            <form action={registerContactNow}>
              <input type="hidden" name="id" value={lead.id} />
              <button className="button button-secondary" type="submit">
                Registrar contato agora
              </button>
            </form>
          </div>
        </section>

        <form action={updateLead} className="admin-panel lead-edit-form">
          <input type="hidden" name="id" value={lead.id} />

          <div className="panel-heading">
            <h2>Próximo passo comercial</h2>
          </div>

          <div className="field-grid">
            <label>
              Status
              <select name="status" defaultValue={lead.status}>
                <option value="novo">Novo</option>
                <option value="contatado">Contatado</option>
                <option value="cotacao_enviada">Cotação enviada</option>
                <option value="follow_up">Follow-up</option>
                <option value="reservado">Reservado</option>
                <option value="perdido">Perdido</option>
              </select>
            </label>

            <label>
              Valor cotado
              <input
                name="quotedValue"
                inputMode="decimal"
                defaultValue={formatCurrency(lead.quoted_value)}
                placeholder="0,00"
              />
            </label>

            <label>
              Último contato
              <input
                type="datetime-local"
                name="lastContact"
                defaultValue={dateTimeInput(lead.last_contact, property.timezone)}
              />
            </label>

            <label>
              Próximo follow-up
              <input
                type="datetime-local"
                name="nextFollowUp"
                defaultValue={dateTimeInput(lead.next_follow_up, property.timezone)}
              />
            </label>

            <label>
              Contato marcado com hóspede
              <input
                type="datetime-local"
                name="scheduledContactAt"
                defaultValue={dateTimeInput(lead.scheduled_contact_at, property.timezone)}
              />
            </label>

            <label>
              Prioridade manual extra
              <input
                type="number"
                name="priorityOverride"
                min="0"
                max="100"
                defaultValue={lead.priority_override ?? ""}
                placeholder="0 a 100"
              />
            </label>

            <label className="field-full">
              Motivo / assunto do contato marcado
              <input
                name="scheduledContactNote"
                defaultValue={lead.scheduled_contact_note ?? ""}
                placeholder="Ex.: retornar após falar com o marido"
              />
            </label>

            <label className="field-full">
              Observações comerciais
              <textarea
                name="notes"
                defaultValue={lead.notes ?? ""}
                placeholder="Registre contexto relevante para o próximo atendimento."
              />
            </label>

            <label className="field-full">
              Motivo da perda
              <input
                name="lostReason"
                defaultValue={lead.lost_reason ?? ""}
                placeholder="Preencher quando o status for Perdido"
              />
            </label>

            <label className="checkbox-field field-full">
              <input
                type="checkbox"
                name="doNotContact"
                defaultChecked={lead.do_not_contact}
              />
              Não contatar este lead
            </label>
          </div>

          <div className="form-actions">
            <button className="button button-primary" type="submit">
              Salvar próximo passo
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
