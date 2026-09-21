"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullable(formData: FormData, key: string) {
  return text(formData, key) || null;
}

export async function updatePropertySettings(formData: FormData) {
  const { supabase, membership } = await getAdminContext([
    "owner",
    "manager",
    "technical_admin",
  ]);

  const name = text(formData, "name");
  if (!name) {
    redirect("/admin/configuracoes?error=O%20nome%20da%20hospedagem%20%C3%A9%20obrigat%C3%B3rio.");
  }

  const { error } = await supabase
    .from("properties")
    .update({
      name,
      tagline: nullable(formData, "tagline"),
      description: nullable(formData, "description"),
      phone: nullable(formData, "phone"),
      whatsapp: nullable(formData, "whatsapp"),
      email: nullable(formData, "email"),
      address: nullable(formData, "address"),
      maps_url: nullable(formData, "mapsUrl"),
      timezone: text(formData, "timezone") || "America/Sao_Paulo",
      check_in_time: text(formData, "checkInTime") || "15:00",
      check_out_time: text(formData, "checkOutTime") || "12:00",
      children_policy: nullable(formData, "childrenPolicy"),
      pets_policy: nullable(formData, "petsPolicy"),
      cancellation_policy: nullable(formData, "cancellationPolicy"),
    })
    .eq("id", membership.property_id);

  if (error) throw error;

  revalidatePath("/", "layout");
  revalidatePath("/acomodacoes", "page");
  revalidatePath("/acomodacoes/[slug]", "page");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/configuracoes");

  redirect("/admin/configuracoes?saved=1");
}
