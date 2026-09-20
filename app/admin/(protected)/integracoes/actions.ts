"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function assertAdmin(role: string) {
  if (!["owner", "technical_admin"].includes(role)) {
    throw new Error("Você não tem permissão para configurar integrações.");
  }
}

export async function updateIntegrations(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  assertAdmin(membership.role);

  const bookingMode = text(formData, "bookingMode") || "criartista";

  const rows = [
    {
      property_id: membership.property_id,
      integration_key: "booking",
      enabled: checked(formData, "bookingEnabled"),
      config: {
        mode: ["criartista", "external_link", "widget", "embed", "popup"].includes(bookingMode)
          ? bookingMode
          : "criartista",
        external_url: text(formData, "bookingExternalUrl"),
        provider: text(formData, "bookingProvider"),
      },
      updated_at: new Date().toISOString(),
    },
    {
      property_id: membership.property_id,
      integration_key: "ga4",
      enabled: checked(formData, "ga4Enabled"),
      config: {
        measurement_id: text(formData, "ga4MeasurementId"),
      },
      updated_at: new Date().toISOString(),
    },
    {
      property_id: membership.property_id,
      integration_key: "meta_pixel",
      enabled: checked(formData, "metaEnabled"),
      config: {
        pixel_id: text(formData, "metaPixelId"),
      },
      updated_at: new Date().toISOString(),
    },
    {
      property_id: membership.property_id,
      integration_key: "gtm",
      enabled: checked(formData, "gtmEnabled"),
      config: {
        container_id: text(formData, "gtmContainerId"),
      },
      updated_at: new Date().toISOString(),
    },
    {
      property_id: membership.property_id,
      integration_key: "google_sheets",
      enabled: checked(formData, "sheetsEnabled"),
      config: {
        spreadsheet_id: text(formData, "sheetsId"),
        webhook_url: text(formData, "sheetsWebhookUrl"),
      },
      updated_at: new Date().toISOString(),
    },
    {
      property_id: membership.property_id,
      integration_key: "cookie_consent",
      enabled: checked(formData, "cookiesEnabled"),
      config: {
        necessary: true,
        analytics: checked(formData, "cookiesAnalytics"),
        advertising: checked(formData, "cookiesAdvertising"),
      },
      updated_at: new Date().toISOString(),
    },
  ];

  const { error: integrationError } = await supabase
    .from("integrations")
    .upsert(rows, { onConflict: "property_id,integration_key" });

  if (integrationError) throw integrationError;

  const { error: propertyError } = await supabase
    .from("properties")
    .update({
      whatsapp: text(formData, "whatsapp"),
    })
    .eq("id", membership.property_id);

  if (propertyError) throw propertyError;

  const { error: socialError } = await supabase
    .from("social_links")
    .upsert(
      {
        property_id: membership.property_id,
        instagram: text(formData, "instagram") || null,
        facebook: text(formData, "facebook") || null,
        tiktok: text(formData, "tiktok") || null,
        youtube: text(formData, "youtube") || null,
        linkedin: text(formData, "linkedin") || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "property_id" }
    );

  if (socialError) throw socialError;

  revalidatePath("/");
  revalidatePath("/admin/integracoes");
  redirect("/admin/integracoes?saved=1");
}
