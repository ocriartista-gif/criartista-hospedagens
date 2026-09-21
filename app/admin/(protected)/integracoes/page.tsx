import { getAdminContext } from "@/lib/data/admin";
import { updateIntegrations } from "./actions";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";

type Config = Record<string, Json | undefined>;

function config(value: Json): Config {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Config)
    : {};
}

function stringValue(value: Json | undefined) {
  return typeof value === "string" ? value : "";
}

function booleanValue(value: Json | undefined) {
  return value === true;
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { supabase, membership, property } = await getAdminContext(["owner", "technical_admin"]);

  const [{ data: rows, error }, { data: social, error: socialError }] =
    await Promise.all([
      supabase
        .from("integrations")
        .select("*")
        .eq("property_id", membership.property_id),
      supabase
        .from("social_links")
        .select("*")
        .eq("property_id", membership.property_id)
        .maybeSingle(),
    ]);

  if (error) throw error;
  if (socialError) throw socialError;

  const integrations = new Map(
    (rows ?? []).map((row) => [row.integration_key, row])
  );

  const booking = integrations.get("booking");
  const ga4 = integrations.get("ga4");
  const meta = integrations.get("meta_pixel");
  const gtm = integrations.get("gtm");
  const sheets = integrations.get("google_sheets");
  const cookies = integrations.get("cookie_consent");

  const bookingConfig = config(booking?.config ?? {});
  const ga4Config = config(ga4?.config ?? {});
  const metaConfig = config(meta?.config ?? {});
  const gtmConfig = config(gtm?.config ?? {});
  const sheetsConfig = config(sheets?.config ?? {});
  const cookiesConfig = config(cookies?.config ?? {});

  return (
    <form action={updateIntegrations}>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Ecossistema</span>
          <h1>Integrações</h1>
          <p>
            Centralize conexões e parâmetros sem reconstruir o site.
          </p>
        </div>
        <button className="button button-primary" type="submit">
          Salvar configurações
        </button>
      </header>

      {saved === "1" && (
        <div className="feedback-box feedback-success">
          Configurações de integração salvas.
        </div>
      )}

      <div className="integration-settings-grid">
        <section className="admin-panel integration-settings-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Reserva</span>
              <h2>Motor de reservas</h2>
            </div>
            <span className="integration-phase">Configuração</span>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="bookingEnabled"
              defaultChecked={booking?.enabled ?? false}
            />
            Preparar integração do motor
          </label>

          <div className="field-grid">
            <label>
              Modo
              <select
                name="bookingMode"
                defaultValue={stringValue(bookingConfig.mode) || "criartista"}
              >
                <option value="criartista">Formulário Criartista</option>
                <option value="external_link">Link externo</option>
                <option value="widget">Widget</option>
                <option value="embed">Embed</option>
                <option value="popup">Pop-up</option>
              </select>
            </label>

            <label>
              Provedor
              <input
                name="bookingProvider"
                defaultValue={stringValue(bookingConfig.provider)}
                placeholder="Ex.: Omnibees, Cloudbeds..."
              />
            </label>

            <label className="field-full">
              URL externa / endpoint
              <input
                type="url"
                name="bookingExternalUrl"
                defaultValue={stringValue(bookingConfig.external_url)}
                placeholder="https://..."
              />
            </label>
          </div>
        </section>

        <section className="admin-panel integration-settings-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Mensuração</span>
              <h2>Google Analytics 4</h2>
            </div>
            <span className="integration-phase">Configuração</span>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="ga4Enabled"
              defaultChecked={ga4?.enabled ?? false}
            />
            Preparar GA4
          </label>

          <label>
            Measurement ID
            <input
              name="ga4MeasurementId"
              defaultValue={stringValue(ga4Config.measurement_id)}
              placeholder="G-XXXXXXXXXX"
            />
          </label>
        </section>

        <section className="admin-panel integration-settings-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Publicidade</span>
              <h2>Meta Pixel</h2>
            </div>
            <span className="integration-phase">Configuração</span>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="metaEnabled"
              defaultChecked={meta?.enabled ?? false}
            />
            Preparar Pixel
          </label>

          <label>
            Pixel ID
            <input
              name="metaPixelId"
              defaultValue={stringValue(metaConfig.pixel_id)}
              placeholder="123456789..."
            />
          </label>
        </section>

        <section className="admin-panel integration-settings-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Tags</span>
              <h2>Google Tag Manager</h2>
            </div>
            <span className="integration-phase">Configuração</span>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="gtmEnabled"
              defaultChecked={gtm?.enabled ?? false}
            />
            Preparar GTM
          </label>

          <label>
            Container ID
            <input
              name="gtmContainerId"
              defaultValue={stringValue(gtmConfig.container_id)}
              placeholder="GTM-XXXXXXX"
            />
          </label>
        </section>

        <section className="admin-panel integration-settings-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Operação</span>
              <h2>Google Sheets</h2>
            </div>
            <span className="integration-phase">Configuração</span>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="sheetsEnabled"
              defaultChecked={sheets?.enabled ?? false}
            />
            Preparar espelhamento
          </label>

          <div className="field-grid">
            <label className="field-full">
              Spreadsheet ID
              <input
                name="sheetsId"
                defaultValue={stringValue(sheetsConfig.spreadsheet_id)}
                placeholder="ID da planilha"
              />
            </label>

            <label className="field-full">
              Webhook / endpoint
              <input
                type="url"
                name="sheetsWebhookUrl"
                defaultValue={stringValue(sheetsConfig.webhook_url)}
                placeholder="https://..."
              />
            </label>
          </div>
        </section>

        <section className="admin-panel integration-settings-card integration-live-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Contato</span>
              <h2>WhatsApp</h2>
            </div>
            <span className="integration-live">Já aplicado</span>
          </div>

          <p>
            Este número é usado nos CTAs públicos e na continuação do
            atendimento após o formulário.
          </p>

          <label>
            Número com DDI + DDD
            <input
              name="whatsapp"
              defaultValue={property.whatsapp ?? ""}
              placeholder="5519999999999"
            />
          </label>
        </section>

        <section className="admin-panel integration-settings-card integration-wide integration-live-card">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Presença</span>
              <h2>Redes sociais</h2>
            </div>
            <span className="integration-live">Já aplicado</span>
          </div>

          <div className="field-grid">
            <label>
              Instagram
              <input
                type="url"
                name="instagram"
                defaultValue={social?.instagram ?? ""}
                placeholder="https://instagram.com/..."
              />
            </label>
            <label>
              Facebook
              <input
                type="url"
                name="facebook"
                defaultValue={social?.facebook ?? ""}
                placeholder="https://facebook.com/..."
              />
            </label>
            <label>
              TikTok
              <input
                type="url"
                name="tiktok"
                defaultValue={social?.tiktok ?? ""}
                placeholder="https://tiktok.com/@..."
              />
            </label>
            <label>
              YouTube
              <input
                type="url"
                name="youtube"
                defaultValue={social?.youtube ?? ""}
                placeholder="https://youtube.com/..."
              />
            </label>
            <label className="field-full">
              LinkedIn
              <input
                type="url"
                name="linkedin"
                defaultValue={social?.linkedin ?? ""}
                placeholder="https://linkedin.com/..."
              />
            </label>
          </div>
        </section>

        <section className="admin-panel integration-settings-card integration-wide">
          <div className="integration-card-title">
            <div>
              <span className="eyebrow">Privacidade</span>
              <h2>Cookies e consentimento</h2>
            </div>
            <span className="integration-phase">Configuração</span>
          </div>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="cookiesEnabled"
              defaultChecked={cookies?.enabled ?? false}
            />
            Preparar banner de consentimento
          </label>

          <div className="cookie-options">
            <label className="checkbox-field">
              <input type="checkbox" checked readOnly />
              Necessários
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="cookiesAnalytics"
                defaultChecked={booleanValue(cookiesConfig.analytics)}
              />
              Analytics
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                name="cookiesAdvertising"
                defaultChecked={booleanValue(cookiesConfig.advertising)}
              />
              Publicidade
            </label>
          </div>
        </section>
      </div>

      <div className="sticky-save-bar">
        <span>
          Salvar não injeta scripts ainda; registra a configuração para a
          camada técnica.
        </span>
        <button className="button button-primary" type="submit">
          Salvar integrações
        </button>
      </div>
    </form>
  );
}
