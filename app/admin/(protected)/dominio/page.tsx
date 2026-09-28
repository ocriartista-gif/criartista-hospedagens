import { getAdminContext } from "@/lib/data/admin";
import { addCustomDomain, checkCustomDomain, makePrimaryDomain } from "./actions";

export default async function DomainPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const { supabase, membership } = await getAdminContext(["owner"]);
  const { data: domains } = await supabase.from("property_domains").select("*")
    .eq("property_id", membership.property_id).order("created_at");
  const enabled = Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID && process.env.SUPABASE_SERVICE_ROLE_KEY);
  return <>
    <header className="admin-header"><div><span className="eyebrow">Endereço do site</span><h1>Domínio</h1><p>Seu subdomínio é criado automaticamente. O domínio próprio é opcional.</p></div></header>
    {saved && <div className="feedback-box feedback-success" role="status">{saved}</div>}
    {error && <div className="feedback-box feedback-error" role="alert">{error}</div>}
    <div className="profile-grid">
      {(domains ?? []).map((row) => <section className="admin-panel" key={row.id}>
        <h2>{row.type === "subdomain" ? "Endereço gratuito" : "Domínio próprio"}</h2>
        <p><strong>{row.domain}</strong></p><p>Status: {row.status === "verified" ? "Verificado" : "Aguardando DNS"}{row.is_primary ? " · Principal" : ""}</p>
        {row.type === "custom" && row.status !== "verified" && <>
          <p>Configure o domínio no seu provedor de DNS e volte para verificar. Se a Vercel exigir prova de propriedade, use os registros abaixo:</p>
          {Array.isArray(row.verification_records) && row.verification_records.map((record, index) =>
            record && typeof record === "object" && !Array.isArray(record) &&
            <code className="dns-record" key={index}>{String(record.type)} · {String(record.domain)} · {String(record.value)}</code>)}
          <p>Para um subdomínio como www, aponte um CNAME para o destino mostrado pelo provedor. Para domínio raiz, consulte o registro A indicado pela Vercel.</p>
          <form action={checkCustomDomain}><input type="hidden" name="domain" value={row.domain} /><button className="button button-secondary" disabled={!enabled}>Verificar novamente</button></form>
        </>}
        {row.status === "verified" && !row.is_primary &&
          <form action={makePrimaryDomain}><input type="hidden" name="domainId" value={row.id} /><button className="button button-secondary">Definir como principal</button></form>}
      </section>)}
      <section className="admin-panel"><h2>Adicionar domínio próprio</h2>
        <p>Você pode continuar usando o subdomínio gratuito enquanto configura o DNS.</p>
        <form action={addCustomDomain} className="profile-form"><label>Seu domínio<input name="domain" placeholder="www.suapousada.com.br" required /></label><button className="button button-primary" disabled={!enabled}>Adicionar domínio</button></form>
        {!enabled && <p>A conexão automática de domínios ainda não está disponível.</p>}
      </section>
    </div>
  </>;
}
