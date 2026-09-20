"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";

const allowedFonts = new Set([
  "Playfair Display",
  "Cormorant Garamond",
  "DM Serif Display",
  "Lora",
  "Manrope",
  "Montserrat",
  "DM Sans",
  "Sora",
  "Inter",
  "Georgia",
  "Arial",
]);

const hex = /^#[0-9A-Fa-f]{6}$/;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function color(formData: FormData, key: string, fallback: string) {
  const value = text(formData, key);
  return hex.test(value) ? value.toUpperCase() : fallback;
}

function font(formData: FormData, key: string, fallback: string) {
  const value = text(formData, key);
  return allowedFonts.has(value) ? value : fallback;
}

function selectedMedia(formData: FormData, key: string) {
  try {
    const parsed = JSON.parse(text(formData, key));
    return Array.isArray(parsed)
      ? parsed.filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0
        )
      : [];
  } catch {
    return [];
  }
}

export async function updateBrandIdentity(formData: FormData) {
  const { supabase, membership } = await getAdminContext();

  if (
    !["owner", "manager", "marketing", "technical_admin"].includes(
      membership.role
    )
  ) {
    throw new Error("Você não tem permissão para editar a identidade.");
  }

  const eyebrowTransform = text(formData, "eyebrowTransform");
  const eyebrowWeight = text(formData, "eyebrowWeight");
  const eyebrowSpacing = text(formData, "eyebrowSpacing");

  const logoMain = selectedMedia(formData, "logoMainMedia")[0] ?? null;
  const logoLight = selectedMedia(formData, "logoLightMedia")[0] ?? null;
  const favicon = selectedMedia(formData, "faviconMedia")[0] ?? null;

  const { error } = await supabase
    .from("property_themes")
    .update({
      primary_color: color(formData, "primary", "#183B2A"),
      secondary_color: color(formData, "secondary", "#8CA67C"),
      accent_color: color(formData, "accent", "#C97863"),
      background_color: color(formData, "background", "#F6F2EA"),
      text_color: color(formData, "text", "#302C2F"),
      heading_font: font(formData, "headingFont", "Playfair Display"),
      eyebrow_font: font(formData, "eyebrowFont", "Inter"),
      body_font: font(formData, "bodyFont", "Inter"),
      eyebrow_transform: ["uppercase", "normal", "capitalize"].includes(
        eyebrowTransform
      )
        ? eyebrowTransform
        : "uppercase",
      eyebrow_weight: ["400", "500", "600"].includes(eyebrowWeight)
        ? eyebrowWeight
        : "600",
      eyebrow_spacing: ["normal", "wide"].includes(eyebrowSpacing)
        ? eyebrowSpacing
        : "wide",
      logo_main_url: logoMain,
      logo_light_url: logoLight,
      favicon_url: favicon,
      updated_at: new Date().toISOString(),
    })
    .eq("property_id", membership.property_id);

  if (error) throw error;

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/identidade");
  revalidatePath("/admin/galeria");

  redirect("/admin/identidade?saved=1");
}
