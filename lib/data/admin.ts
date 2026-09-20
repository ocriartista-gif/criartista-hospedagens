import { createClient } from "@/lib/supabase/server";
import type { PropertyTheme } from "@/types";

function assetUrl(path: string | null) {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/property-media/${path}`
    : path;
}

const fallbackTheme: PropertyTheme = {
  primary: "#183B2A",
  secondary: "#8CA67C",
  accent: "#C97863",
  background: "#F6F2EA",
  text: "#302C2F",
  headingFont: "Georgia",
  eyebrowFont: "Arial",
  bodyFont: "Arial",
  eyebrowTransform: "uppercase",
  eyebrowWeight: "600",
  eyebrowSpacing: "wide",
};

export async function getAdminContext() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    throw new Error("Admin session not found.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("property_members")
    .select("property_id, user_id, role, display_name, email")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (membershipError || !membership) {
    throw new Error("Admin user has no property membership.");
  }

  const [{ data: property, error: propertyError }, { data: themeRow }] =
    await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("id", membership.property_id)
        .single(),
      supabase
        .from("property_themes")
        .select("*")
        .eq("property_id", membership.property_id)
        .maybeSingle(),
    ]);

  if (propertyError || !property) {
    throw new Error("Property not found.");
  }

  const theme: PropertyTheme = themeRow
    ? {
        primary: themeRow.primary_color,
        secondary: themeRow.secondary_color,
        accent: themeRow.accent_color,
        background: themeRow.background_color,
        text: themeRow.text_color,
        headingFont: themeRow.heading_font,
        eyebrowFont: themeRow.eyebrow_font,
        bodyFont: themeRow.body_font,
        eyebrowTransform: themeRow.eyebrow_transform as PropertyTheme["eyebrowTransform"],
        eyebrowWeight: themeRow.eyebrow_weight as PropertyTheme["eyebrowWeight"],
        eyebrowSpacing: themeRow.eyebrow_spacing as PropertyTheme["eyebrowSpacing"],
        logoMainUrl: assetUrl(themeRow.logo_main_url),
        logoLightUrl: assetUrl(themeRow.logo_light_url),
        faviconUrl: assetUrl(themeRow.favicon_url),
      }
    : fallbackTheme;

  return { supabase, membership, property, theme };
}
