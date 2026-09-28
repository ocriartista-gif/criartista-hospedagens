import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  mercadoPagoRequest, verifyMercadoPagoSignature,
  type AuthorizedPayment, type Preapproval,
} from "@/lib/billing/mercado-pago";

export const runtime = "nodejs";

type Notification = { id?: string | number; type?: string; data?: { id?: string | number } };

export async function POST(request: NextRequest) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const dataId = request.nextUrl.searchParams.get("data.id") ?? request.nextUrl.searchParams.get("data_id");
  if (!secret || !verifyMercadoPagoSignature(
    request.headers.get("x-signature"), request.headers.get("x-request-id"), dataId, secret
  )) return new NextResponse("Invalid signature", { status: 401 });
  let notification: Notification;
  try { notification = await request.json(); } catch { return new NextResponse("Invalid body", { status: 400 }); }
  if (String(notification.data?.id ?? "").toLowerCase() !== dataId!.toLowerCase() || !notification.id || !notification.type)
    return new NextResponse("Invalid notification", { status: 400 });
  const service = createServiceClient();
  const eventId = `${notification.type}:${notification.id}`;
  const { error: eventError } = await service.from("billing_webhook_events").upsert({
    provider: "mercado_pago", external_event_id: eventId,
    resource_id: dataId!, event_type: notification.type,
  }, { onConflict: "provider,external_event_id", ignoreDuplicates: true });
  if (eventError) return new NextResponse("Storage unavailable", { status: 503 });
  const { data: event } = await service.from("billing_webhook_events").select("status")
    .eq("provider", "mercado_pago").eq("external_event_id", eventId).single();
  if (event?.status === "processed" || event?.status === "ignored") return NextResponse.json({ ok: true });
  try {
    if (notification.type === "subscription_authorized_payment") {
      const invoice = await mercadoPagoRequest<AuthorizedPayment>(`/authorized_payments/${encodeURIComponent(dataId!)}`);
      if (String(invoice.id) !== dataId || !invoice.preapproval_id) throw new Error("Invoice mismatch.");
      const preapproval = await mercadoPagoRequest<Preapproval>(`/preapproval/${encodeURIComponent(invoice.preapproval_id)}`);
      const intentId = preapproval.external_reference;
      if (!intentId || !/^[0-9a-f-]{36}$/i.test(intentId)) throw new Error("Missing checkout reference.");
      const { data: intent, error: intentError } = await service.from("checkout_intents")
        .select("*").eq("id", intentId).single();
      if (intentError || !intent || intent.provider_subscription_id !== preapproval.id)
        throw new Error("Checkout intent mismatch.");
      const { data: owner } = await service.auth.admin.getUserById(intent.owner_id);
      if (!owner.user?.email || (preapproval.payer_email &&
        preapproval.payer_email.toLowerCase() !== owner.user.email.toLowerCase()))
        throw new Error("Payer mismatch.");
      if (invoice.payment?.status !== "approved" || preapproval.status !== "authorized") {
        // Pending or failed invoices never provision a property.
        await service.from("billing_webhook_events").update({ status: "ignored", processed_at: new Date().toISOString() })
          .eq("provider", "mercado_pago").eq("external_event_id", eventId);
        return NextResponse.json({ ok: true });
      }
      if (invoice.currency_id !== intent.currency || Number(invoice.transaction_amount) !== intent.amount
        || preapproval.auto_recurring?.currency_id !== intent.currency
        || Number(preapproval.auto_recurring?.transaction_amount) !== intent.amount)
        throw new Error("Amount mismatch.");
      const { data: propertyId, error: provisionError } = await service.rpc("provision_property", {
        p_source: "mercado_pago", p_source_id: preapproval.id,
        p_owner_id: intent.owner_id, p_property_name: intent.property_name,
      });
      if (provisionError || !propertyId) throw provisionError ?? new Error("Provisioning failed.");
      const { error: subscriptionError } = await service.from("subscriptions").upsert({
        property_id: propertyId, owner_id: intent.owner_id, checkout_intent_id: intent.id,
        external_subscription_id: preapproval.id, status: "active", amount: intent.amount, currency: intent.currency,
        current_period_start: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, { onConflict: "external_subscription_id" });
      if (subscriptionError) throw subscriptionError;
      const { error: paidError } = await service.from("checkout_intents").update({ status: "paid" }).eq("id", intent.id);
      if (paidError) throw paidError;
    } else if (notification.type === "subscription_preapproval") {
      const preapproval = await mercadoPagoRequest<Preapproval>(`/preapproval/${encodeURIComponent(dataId!)}`);
      const status = preapproval.status === "canceled" ? "canceled" :
        preapproval.status === "paused" ? "past_due" : null;
      if (status) {
        const { error: updateError } = await service.from("subscriptions")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("external_subscription_id", preapproval.id);
        if (updateError) throw updateError;
      }
      if (status === "canceled") {
        const { error: intentError } = await service.from("checkout_intents")
          .update({ status: "canceled" })
          .eq("provider_subscription_id", preapproval.id).eq("status", "pending");
        if (intentError) throw intentError;
      }
    }
    const { error: finishError } = await service.from("billing_webhook_events").update({
      status: "processed", processed_at: new Date().toISOString(),
    }).eq("provider", "mercado_pago").eq("external_event_id", eventId);
    if (finishError) throw finishError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mercado Pago webhook processing failed", error);
    return new NextResponse("Processing failed", { status: 503 });
  }
}
