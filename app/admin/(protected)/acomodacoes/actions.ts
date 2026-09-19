"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function imageUrls(formData: FormData) {
  return [1, 2, 3, 4, 5]
    .map((index) => text(formData, `image${index}`))
    .filter(Boolean);
}

async function replaceImages(
  accommodationId: string,
  urls: string[]
) {
  const { supabase } = await getAdminContext();

  const { error: deleteError } = await supabase
    .from("accommodation_images")
    .delete()
    .eq("accommodation_id", accommodationId);

  if (deleteError) throw deleteError;

  if (!urls.length) return;

  const { error: insertError } = await supabase
    .from("accommodation_images")
    .insert(
      urls.map((url, index) => ({
        accommodation_id: accommodationId,
        storage_path: url,
        alt_text: null,
        is_cover: index === 0,
        sort_order: index + 1,
      }))
    );

  if (insertError) throw insertError;
}

export async function createAccommodation(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const amenities = text(formData, "amenities")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("accommodations")
    .insert({
      property_id: membership.property_id,
      name,
      slug,
      short_description: text(formData, "shortDescription") || null,
      description: text(formData, "description") || null,
      capacity: numberValue(formData, "capacity", 2),
      adults: numberValue(formData, "adults", 2),
      children: numberValue(formData, "children", 0),
      size_m2: numberValue(formData, "sizeM2", 0) || null,
      beds: text(formData, "beds") || null,
      amenities,
      published: formData.get("published") === "on",
      sort_order: numberValue(formData, "sortOrder", 0),
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Accommodation was not created.");

  await replaceImages(data.id, imageUrls(formData));

  revalidatePath("/");
  revalidatePath("/acomodacoes");
  revalidatePath("/admin/acomodacoes");
  redirect("/admin/acomodacoes");
}

export async function updateAccommodation(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const amenities = text(formData, "amenities")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("accommodations")
    .update({
      name,
      slug,
      short_description: text(formData, "shortDescription") || null,
      description: text(formData, "description") || null,
      capacity: numberValue(formData, "capacity", 2),
      adults: numberValue(formData, "adults", 2),
      children: numberValue(formData, "children", 0),
      size_m2: numberValue(formData, "sizeM2", 0) || null,
      beds: text(formData, "beds") || null,
      amenities,
      published: formData.get("published") === "on",
      sort_order: numberValue(formData, "sortOrder", 0),
    })
    .eq("id", id)
    .eq("property_id", membership.property_id);

  if (error) throw error;

  await replaceImages(id, imageUrls(formData));

  revalidatePath("/");
  revalidatePath("/acomodacoes");
  revalidatePath(`/acomodacoes/${slug}`);
  revalidatePath("/admin/acomodacoes");
  redirect("/admin/acomodacoes");
}

export async function deleteAccommodation(formData: FormData) {
  const { supabase, membership } = await getAdminContext();
  const id = text(formData, "id");

  const { error } = await supabase
    .from("accommodations")
    .delete()
    .eq("id", id)
    .eq("property_id", membership.property_id);

  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/acomodacoes");
  revalidatePath("/admin/acomodacoes");
  redirect("/admin/acomodacoes");
}
