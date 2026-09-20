"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function canManage(role: string) {
  return ["owner", "manager", "marketing", "technical_admin"].includes(role);
}

function reviewPayload(formData: FormData) {
  const rating = Math.min(5, Math.max(1, Number(text(formData, "rating") || 5)));

  return {
    guest_name: text(formData, "guestName"),
    rating,
    review_text: text(formData, "reviewText"),
    source: text(formData, "source") || null,
    source_url: text(formData, "sourceUrl") || null,
    review_date: text(formData, "reviewDate") || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin/avaliacoes");
}

export async function createReview(formData: FormData) {
  const { supabase, membership } = await getAdminContext();

  if (!canManage(membership.role)) {
    throw new Error("Você não tem permissão para gerenciar avaliações.");
  }

  const payload = reviewPayload(formData);

  if (!payload.guest_name || !payload.review_text) {
    redirect("/admin/avaliacoes?error=Nome%20e%20depoimento%20s%C3%A3o%20obrigat%C3%B3rios.");
  }

  const { error } = await supabase.from("reviews").insert({
    property_id: membership.property_id,
    ...payload,
  });

  if (error) throw error;

  refresh();
  redirect("/admin/avaliacoes?created=1");
}

export async function updateReview(formData: FormData) {
  const { supabase, membership } = await getAdminContext();

  if (!canManage(membership.role)) {
    throw new Error("Você não tem permissão para gerenciar avaliações.");
  }

  const id = text(formData, "id");
  const payload = reviewPayload(formData);

  const { error } = await supabase
    .from("reviews")
    .update(payload)
    .eq("id", id)
    .eq("property_id", membership.property_id);

  if (error) throw error;

  refresh();
  redirect("/admin/avaliacoes?saved=1");
}

export async function deleteReview(formData: FormData) {
  const { supabase, membership } = await getAdminContext();

  if (!canManage(membership.role)) {
    throw new Error("Você não tem permissão para gerenciar avaliações.");
  }

  const id = text(formData, "id");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("property_id", membership.property_id);

  if (error) throw error;

  refresh();
  redirect("/admin/avaliacoes?deleted=1");
}
