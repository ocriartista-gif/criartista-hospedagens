"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/data/admin";
import { getThemeContrastIssues } from "@/lib/theme";
import type { Json } from "@/types/database";
import type { PaletteKey, PropertyTheme } from "@/types";

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

const allowedPaletteKeys = new Set<PaletteKey>([
  "primary",
  "secondary",
  "accent",
  "background",
  "text",
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

function paletteKey(
  formData: FormData,
  key: string,
  fallback: PaletteKey
): PaletteKey {
  const value = text(formData, key) as PaletteKey;
  return allowedPaletteKeys.has(value) ? value : fallback;
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

function canEdit(role: string) {
  return ["owner", "manager", "marketing", "technical_admin"].includes(role);
}

function snapshot(row: Record<string, unknown>): Json {
  return JSON.parse(JSON.stringify(row)) as Json;
}

function restoreValue<T>(
  source: Record<string, Json | undefined>,
  key: string,
  fallback: T
): T {
  const value = source[key];
  return (value === undefined ? fallback : value) as T;
}

function refreshIdentity() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/identidade");
  revalidatePath("/admin/galeria");
}

export async function updateBrandIdentity(formData: FormData) {
  const { supabase, membership } = await getAdminContext();

  if (!canEdit(membership.role)) {
    throw new Error("Você não tem permissão para editar a identidade.");
  }

  const eyebrowTransform = text(formData, "eyebrowTransform");
  const eyebrowWeight = text(formData, "eyebrowWeight");
  const eyebrowSpacing = text(formData, "eyebrowSpacing");

  const logoMain = selectedMedia(formData, "logoMainMedia")[0] ?? null;
  const logoLight = selectedMedia(formData, "logoLightMedia")[0] ?? null;
  const favicon = selectedMedia(formData, "faviconMedia")[0] ?? null;

  const nextTheme: PropertyTheme = {
    primary: color(formData, "primary", "#183B2A"),
    secondary: color(formData, "secondary", "#8CA67C"),
    accent: color(formData, "accent", "#C97863"),
    background: color(formData, "background", "#F6F2EA"),
    text: color(formData, "text", "#302C2F"),
    headingFont: font(formData, "headingFont", "Playfair Display"),
    eyebrowFont: font(formData, "eyebrowFont", "Inter"),
    bodyFont: font(formData, "bodyFont", "Inter"),
    eyebrowTransform: ["uppercase", "normal", "capitalize"].includes(
      eyebrowTransform
    )
      ? (eyebrowTransform as PropertyTheme["eyebrowTransform"])
      : "uppercase",
    eyebrowWeight: ["400", "500", "600"].includes(eyebrowWeight)
      ? (eyebrowWeight as PropertyTheme["eyebrowWeight"])
      : "600",
    eyebrowSpacing: ["normal", "wide"].includes(eyebrowSpacing)
      ? (eyebrowSpacing as PropertyTheme["eyebrowSpacing"])
      : "wide",
    headerSurfaceKey: paletteKey(formData, "headerSurfaceKey", "background"),
    postHeroSurfaceKey: paletteKey(
      formData,
      "postHeroSurfaceKey",
      "background"
    ),
    logoMainUrl: logoMain ?? undefined,
    logoLightUrl: logoLight ?? undefined,
    faviconUrl: favicon ?? undefined,
  };

  const contrastIssues = getThemeContrastIssues(nextTheme);

  if (contrastIssues.length) {
    redirect(
      `/admin/identidade?error=${encodeURIComponent(contrastIssues[0])}`
    );
  }

  const { data: currentTheme, error: currentError } = await supabase
    .from("property_themes")
    .select("*")
    .eq("property_id", membership.property_id)
    .single();

  if (currentError) throw currentError;

  const { error: historyError } = await supabase
    .from("property_theme_history")
    .insert({
      property_id: membership.property_id,
      changed_by: membership.user_id,
      snapshot: snapshot(currentTheme),
    });

  if (historyError) throw historyError;

  const { error } = await supabase
    .from("property_themes")
    .update({
      primary_color: nextTheme.primary,
      secondary_color: nextTheme.secondary,
      accent_color: nextTheme.accent,
      background_color: nextTheme.background,
      text_color: nextTheme.text,
      heading_font: nextTheme.headingFont,
      eyebrow_font: nextTheme.eyebrowFont,
      body_font: nextTheme.bodyFont,
      eyebrow_transform: nextTheme.eyebrowTransform,
      eyebrow_weight: nextTheme.eyebrowWeight,
      eyebrow_spacing: nextTheme.eyebrowSpacing,
      header_surface_key: nextTheme.headerSurfaceKey,
      post_hero_surface_key: nextTheme.postHeroSurfaceKey,
      logo_main_url: logoMain,
      logo_light_url: logoLight,
      favicon_url: favicon,
      updated_at: new Date().toISOString(),
    })
    .eq("property_id", membership.property_id);

  if (error) throw error;

  refreshIdentity();
  redirect("/admin/identidade?saved=1");
}

export async function resetLastBrandIdentity() {
  const { supabase, membership } = await getAdminContext();

  if (!canEdit(membership.role)) {
    throw new Error("Você não tem permissão para editar a identidade.");
  }

  const { data: history, error: historyError } = await supabase
    .from("property_theme_history")
    .select("id, snapshot")
    .eq("property_id", membership.property_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (historyError) throw historyError;

  if (!history) {
    redirect(
      "/admin/identidade?error=N%C3%A3o%20h%C3%A1%20uma%20altera%C3%A7%C3%A3o%20anterior%20para%20restaurar."
    );
  }

  const previous =
    history.snapshot &&
    typeof history.snapshot === "object" &&
    !Array.isArray(history.snapshot)
      ? (history.snapshot as Record<string, Json | undefined>)
      : {};

  const { error: restoreError } = await supabase
    .from("property_themes")
    .update({
      primary_color: restoreValue(previous, "primary_color", "#183B2A"),
      secondary_color: restoreValue(previous, "secondary_color", "#8CA67C"),
      accent_color: restoreValue(previous, "accent_color", "#C97863"),
      background_color: restoreValue(previous, "background_color", "#F6F2EA"),
      text_color: restoreValue(previous, "text_color", "#302C2F"),
      heading_font: restoreValue(previous, "heading_font", "Playfair Display"),
      eyebrow_font: restoreValue(previous, "eyebrow_font", "Inter"),
      body_font: restoreValue(previous, "body_font", "Inter"),
      eyebrow_transform: restoreValue(previous, "eyebrow_transform", "uppercase"),
      eyebrow_weight: restoreValue(previous, "eyebrow_weight", "600"),
      eyebrow_spacing: restoreValue(previous, "eyebrow_spacing", "wide"),
      header_surface_key: restoreValue(
        previous,
        "header_surface_key",
        "background"
      ),
      post_hero_surface_key: restoreValue(
        previous,
        "post_hero_surface_key",
        "background"
      ),
      logo_main_url: restoreValue(previous, "logo_main_url", null),
      logo_light_url: restoreValue(previous, "logo_light_url", null),
      favicon_url: restoreValue(previous, "favicon_url", null),
      updated_at: new Date().toISOString(),
    })
    .eq("property_id", membership.property_id);

  if (restoreError) throw restoreError;

  const { error: deleteError } = await supabase
    .from("property_theme_history")
    .delete()
    .eq("id", history.id)
    .eq("property_id", membership.property_id);

  if (deleteError) throw deleteError;

  refreshIdentity();
  redirect("/admin/identidade?reset=1");
}
