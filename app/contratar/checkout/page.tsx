import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startCheckout } from "./actions";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/contratar");
  const enabled = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SAAS_MONTHLY_PRICE_BRL && process.env.SAAS_BASE_URL);
  return <main className="account-page"><section className="admin-panel account-card">
    <span className="eyebrow">Oferta completa</span><h1>Seu site começa aqui</h1>
    <p>Conta: {user.email}</p>
    {enabled ? <form action={startCheckout} className="profile-form">
      <label>Nome da hospedagem<input name="propertyName" minLength={2} maxLength={120} required placeholder="Ex.: Pousada do Vale" /></label>
      <p>O valor e as condições da assinatura serão exibidos no checkout seguro antes da confirmação.</p>
      {error && <p role="alert" className="feedback-box feedback-error">{error}</p>}
      <button className="button button-primary">Ir para o pagamento</button>
    </form> : <p role="status">A contratação online ainda está sendo preparada. Sua conta já foi criada.</p>}
  </section></main>;
}
