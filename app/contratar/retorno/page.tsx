import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CheckoutReturn() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: membership } = user
    ? await supabase.from("property_members").select("property_id")
        .eq("user_id", user.id).limit(1).maybeSingle()
    : { data: null };
  return <main className="account-page"><section className="admin-panel account-card">
    <h1>{membership ? "Sua hospedagem está pronta para configurar" : "Estamos confirmando seu pagamento"}</h1>
    <p>{membership ? "Vamos colocar as primeiras informações no ar." :
      "A criação da hospedagem começa somente após a confirmação recebida diretamente do provedor. Se você acabou de pagar, aguarde alguns instantes e atualize esta página."}</p>
    <Link className="button button-primary" href={membership ? "/admin/onboarding" : "/contratar/retorno"}>
      {membership ? "Abrir primeiros passos" : "Verificar novamente"}
    </Link>
  </section></main>;
}
