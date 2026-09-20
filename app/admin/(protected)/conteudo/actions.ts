"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

const sections = [
  "hero",
  "intro",
  "accommodations",
  "direct_booking",
  "experiences",
  "reviews",
  "location",
  "footer",
] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateContentSections(formData: FormData) {
  const { supabase, membership } = await getAdminContext();

  if (
    !["owner", "manager", "marketing", "technical_admin"].includes(
      membership.role
    )
  ) {
    throw new Error("Você não tem permissão para editar o conteúdo.");
  }

  for (const sectionKey of sections) {
    const { error } = await supabase
      .from("content_sections")
      .update({
        eyebrow: text(formData, `${sectionKey}_eyebrow`) || null,
        title: text(formData, `${sectionKey}_title`) || null,
        description: text(formData, `${sectionKey}_description`) || null,
      })
      .eq("property_id", membership.property_id)
      .eq("section_key", sectionKey);

    if (error) throw error;
  }

  revalidatePath("/");
  revalidatePath("/acomodacoes");
  revalidatePath("/acomodacoes/[slug]", "page");
  revalidatePath("/admin/conteudo");

  redirect("/admin/conteudo?saved=1");
}
