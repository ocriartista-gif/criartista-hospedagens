import { getAdminContext } from "@/lib/data/admin";
import { updatePropertySettings } from "./actions";

export const dynamic = "force-dynamic";

function shortTime(value: string | null | undefined, fallback: string) {
  return value ? value.slice(0, 5) : fallback;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { property } = await getAdminContext([
    "owner",
    "manager",
    "technical_admin",
  ]);

  return (
    <form action={updatePropertySettings}>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Propriedade</span>
          <h1>Configurações</h1>
          <p>
            Dados institucionais e operacionais usados em diferentes partes do
            site.
          </p>
        </div>
        <button className="button button-primary" type="submit">
          Salvar
        </button>
      </header>

      {params.saved === "1" && (
        <div className="feedback-box feedback-success">
          Configurações atualizadas.
        </div>
      )}

      {params.error && (
        <div className="feedback-box feedback-error">{params.error}</div>
      )}

      <div className="settings-stack">
        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Institucional</span>
              <h2>Dados da hospedagem</h2>
            </div>
          </div>

          <div className="field-grid">
            <label>
              Nome
              <input name="name" required defaultValue={property.name} />
            </label>

            <label>
              WhatsApp
              <input
                name="whatsapp"
                inputMode="tel"
                defaultValue={property.whatsapp ?? ""}
                placeholder="5519999999999"
              />
            </label>

            <label>
              E-mail
              <input
                type="email"
                name="email"
                defaultValue={property.email ?? ""}
              />
            </label>

            <label>
              Telefone
              <input
                name="phone"
                inputMode="tel"
                defaultValue={property.phone ?? ""}
              />
            </label>

            <label className="field-full">
              Frase de posicionamento
              <input
                name="tagline"
                defaultValue={property.tagline ?? ""}
                maxLength={180}
              />
            </label>

            <label className="field-full">
              Descrição
              <textarea
                name="description"
                defaultValue={property.description ?? ""}
                maxLength={1000}
              />
            </label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Localização</span>
              <h2>Endereço e mapa</h2>
            </div>
          </div>

          <div className="field-grid">
            <label className="field-full">
              Endereço
              <input
                name="address"
                defaultValue={property.address ?? ""}
                placeholder="Rua, número, cidade - UF"
              />
            </label>

            <label className="field-full">
              Link do Google Maps
              <input
                type="url"
                name="mapsUrl"
                defaultValue={property.maps_url ?? ""}
                placeholder="https://maps.google.com/..."
              />
            </label>

            <label>
              Fuso horário
              <select
                name="timezone"
                defaultValue={property.timezone ?? "America/Sao_Paulo"}
              >
                <option value="America/Sao_Paulo">Brasília / São Paulo</option>
                <option value="America/Cuiaba">Cuiabá</option>
                <option value="America/Manaus">Manaus</option>
                <option value="America/Belem">Belém</option>
                <option value="America/Fortaleza">Fortaleza</option>
                <option value="America/Recife">Recife</option>
              </select>
            </label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Operação</span>
              <h2>Horários e políticas</h2>
            </div>
          </div>

          <div className="field-grid">
            <label>
              Check-in
              <input
                type="time"
                name="checkInTime"
                defaultValue={shortTime(property.check_in_time, "15:00")}
              />
            </label>

            <label>
              Check-out
              <input
                type="time"
                name="checkOutTime"
                defaultValue={shortTime(property.check_out_time, "12:00")}
              />
            </label>

            <label className="field-full">
              Política de crianças
              <textarea
                name="childrenPolicy"
                defaultValue={property.children_policy ?? ""}
                placeholder="Ex.: crianças até 5 anos não pagam..."
              />
            </label>

            <label className="field-full">
              Política de pets
              <textarea
                name="petsPolicy"
                defaultValue={property.pets_policy ?? ""}
                placeholder="Ex.: aceitamos pets de pequeno porte..."
              />
            </label>

            <label className="field-full">
              Política de cancelamento
              <textarea
                name="cancellationPolicy"
                defaultValue={property.cancellation_policy ?? ""}
                placeholder="Informe as regras principais de cancelamento."
              />
            </label>
          </div>
        </section>
      </div>

      <div className="sticky-save-bar">
        <span>Esses dados alimentam automaticamente o site público.</span>
        <button className="button button-primary" type="submit">
          Salvar configurações
        </button>
      </div>
    </form>
  );
}
