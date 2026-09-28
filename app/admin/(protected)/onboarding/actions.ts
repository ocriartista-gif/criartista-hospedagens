"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

function back(kind: "saved" | "error", message: string): never {
  redirect(`/admin/onboarding?${kind}=${encodeURIComponent(message)}`);
}

async function ownerContext() {
  return getAdminContext(["owner"]);
}

export async function saveOnboardingProperty(formData: FormData) {
  const { supabase, membership } = await ownerContext();
  const name = String(formData.get("name") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const address = String(formData.get("address") ?? "").trim();
  if (name.length < 2 || name.length > 120 || (whatsapp && (whatsapp.length < 10 || whatsapp.length > 15)))
    back("error", "Confira o nome e o WhatsApp.");
  const { error } = await supabase.from("properties").update({
    name, whatsapp, address, email: String(formData.get("email") ?? "").trim() || null,
  }).eq("id", membership.property_id);
  if (error) back("error", "Não foi possível salvar os dados.");
  await supabase.from("onboarding_state").update({
    current_step: "brand", updated_at: new Date().toISOString(),
  }).eq("property_id", membership.property_id);
  revalidatePath("/admin", "layout");
  back("saved", "Dados salvos. Continue quando quiser.");
}

export async function saveOnboardingSocial(formData: FormData) {
  const { supabase, membership } = await ownerContext();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const facebook = String(formData.get("facebook") ?? "").trim();
  for (const value of [instagram, facebook]) {
    if (value && (!/^https:\/\//i.test(value) || value.length > 500))
      back("error", "Use links completos começando com https://.");
  }
  const { error } = await supabase.from("social_links").upsert({
    property_id: membership.property_id, instagram: instagram || null,
    facebook: facebook || null, updated_at: new Date().toISOString(),
  }, { onConflict: "property_id" });
  if (error) back("error", "Não foi possível salvar as redes sociais.");
  await supabase.from("onboarding_state").update({
    current_step: "review", updated_at: new Date().toISOString(),
  }).eq("property_id", membership.property_id);
  back("saved", "Redes sociais salvas.");
}

export async function publishProperty() {
  const { supabase, membership, property } = await ownerContext();
  if (property.status !== "draft") back("error", "Esta hospedagem não está em rascunho.");
  const { error } = await supabase.from("properties").update({ status: "active" })
    .eq("id", membership.property_id).eq("status", "draft");
  if (error) back("error", "Falta nome, WhatsApp, endereço, título e foto principal, ou uma acomodação publicada com foto.");
  await supabase.from("onboarding_state").update({
    current_step: "published", updated_at: new Date().toISOString(),
  }).eq("property_id", membership.property_id);
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  back("saved", "Site publicado! Seu endereço já está disponível.");
}
