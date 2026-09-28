"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { mercadoPagoRequest } from "@/lib/billing/mercado-pago";

export async function startCheckout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/contratar");
  const name = String(formData.get("propertyName") ?? "").trim();
  if (name.length < 2 || name.length > 120) redirect("/contratar/checkout?error=Informe%20o%20nome%20da%20hospedagem.");
  const amount = Number(process.env.SAAS_MONTHLY_PRICE_BRL);
  const base = process.env.SAAS_BASE_URL;
  if (!Number.isFinite(amount) || amount <= 0 || !base || !process.env.MERCADO_PAGO_ACCESS_TOKEN)
    redirect("/contratar/checkout?error=Pagamento%20temporariamente%20indispon%C3%ADvel.");
  const service = createServiceClient();
  const { data: pending } = await service.from("checkout_intents").select("*")
    .eq("owner_id", user.id).eq("status", "pending").maybeSingle();
  if (pending?.checkout_url) redirect(pending.checkout_url);
  if (pending) redirect("/contratar/checkout?error=Seu%20pagamento%20est%C3%A1%20sendo%20preparado.%20Tente%20novamente%20em%20instantes.");
  const { data: intent, error } = await service.from("checkout_intents").insert({
    owner_id: user.id, property_name: name, amount,
  }).select("id").single();
  if (error || !intent) redirect("/contratar/checkout?error=N%C3%A3o%20foi%20poss%C3%ADvel%20iniciar%20o%20pagamento.");
  try {
    const preapproval = await mercadoPagoRequest<{ id: string; init_point: string }>("/preapproval", {
      method: "POST",
      headers: { "X-Idempotency-Key": intent.id },
      body: JSON.stringify({
        reason: "O Criartista Hospedagens",
        payer_email: user.email,
        external_reference: intent.id,
        status: "pending",
        back_url: new URL("/contratar/retorno", base).toString(),
        auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: amount, currency_id: "BRL" },
      }),
    });
    if (!preapproval.id || !/^https:\/\//.test(preapproval.init_point)) throw new Error("Invalid checkout response.");
    const { error: saveError } = await service.from("checkout_intents").update({
      provider_subscription_id: preapproval.id, checkout_url: preapproval.init_point,
    }).eq("id", intent.id);
    if (saveError) throw saveError;
    redirect(preapproval.init_point);
  } catch (failure) {
    // Next.js redirect is a control-flow exception; do not cancel a valid checkout.
    if (failure && typeof failure === "object" && "digest" in failure && String(failure.digest).startsWith("NEXT_REDIRECT")) throw failure;
    await service.from("checkout_intents").update({ status: "canceled" }).eq("id", intent.id);
    redirect("/contratar/checkout?error=O%20checkout%20n%C3%A3o%20respondeu.%20Tente%20novamente.");
  }
}
