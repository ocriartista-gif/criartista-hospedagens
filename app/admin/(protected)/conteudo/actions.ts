"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";
import type { Json } from "@/types/database";

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

function extraObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json | undefined>)
    : {};
}

function selectedMedia(formData: FormData, key: string) {
  try {
    const parsed = JSON.parse(text(formData, key));
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string" && value.length > 0)
      : [];
  } catch {
    return [];
  }
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

  const { data: currentRows, error: currentError } = await supabase
    .from("content_sections")
    .select("section_key, extra")
    .eq("property_id", membership.property_id);

  if (currentError) throw currentError;

  const currentExtras = new Map(
    (currentRows ?? []).map((row) => [row.section_key, row.extra])
  );
  const heroImage = selectedMedia(formData, "heroMedia")[0] ?? null;

  for (const sectionKey of sections) {
    const currentExtra = extraObject(currentExtras.get(sectionKey) ?? {});
    let extra = currentExtra;

    if (sectionKey === "hero") {
      extra = { ...currentExtra, hero_image: heroImage };
    }

    if (sectionKey === "experiences") {
      extra = {
        ...currentExtra,
        items: [1, 2, 3].map((index) => ({
          title: text(formData, `experience_${index}_title`),
          description: text(formData, `experience_${index}_description`),
          image:
            selectedMedia(formData, `experience_${index}_media`)[0] ?? null,
        })),
      };
    }

    const { error } = await supabase
      .from("content_sections")
      .update({
        eyebrow: text(formData, `${sectionKey}_eyebrow`) || null,
        title: text(formData, `${sectionKey}_title`) || null,
        description: text(formData, `${sectionKey}_description`) || null,
        extra,
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
