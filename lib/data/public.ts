import { createPublicClient } from "@/lib/supabase/public";
import type { Accommodation, Property, PropertyTheme, Review } from "@/types";
import type { Tables } from "@/types/database";

type ContentRow = Tables<"content_sections">;
type SocialRow = Tables<"social_links">;

export type PublicContent = Record<string, {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
}>;

export type PublicSiteData = {
  property: Property;
  content: PublicContent;
  social: SocialRow | null;
};

const fallbackTheme: PropertyTheme = {
  primary: "#183B2A",
  secondary: "#8CA67C",
  accent: "#C97863",
  background: "#F6F2EA",
  text: "#302C2F",
  headingFont: "Playfair Display",
  eyebrowFont: "Inter",
  bodyFont: "Inter",
  eyebrowTransform: "uppercase",
  eyebrowWeight: "600",
  eyebrowSpacing: "wide",
};

export const DEFAULT_PROPERTY_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_SLUG ?? "villa-ipe";

function mapTheme(row: Tables<"property_themes"> | null): PropertyTheme {
  if (!row) return fallbackTheme;
  return {
    primary: row.primary_color,
    secondary: row.secondary_color,
    accent: row.accent_color,
    background: row.background_color,
    text: row.text_color,
    headingFont: row.heading_font,
    eyebrowFont: row.eyebrow_font,
    bodyFont: row.body_font,
    eyebrowTransform: row.eyebrow_transform as PropertyTheme["eyebrowTransform"],
    eyebrowWeight: row.eyebrow_weight as PropertyTheme["eyebrowWeight"],
    eyebrowSpacing: row.eyebrow_spacing as PropertyTheme["eyebrowSpacing"],
    logoMainUrl: row.logo_main_url ?? undefined,
    logoLightUrl: row.logo_light_url ?? undefined,
    faviconUrl: row.favicon_url ?? undefined,
  };
}

function mapContent(rows: ContentRow[]): PublicContent {
  return Object.fromEntries(
    rows.map((row) => {
      const extra =
        row.extra && typeof row.extra === "object" && !Array.isArray(row.extra)
          ? (row.extra as Record<string, unknown>)
          : {};
      const imagePath =
        typeof extra.hero_image === "string" && extra.hero_image
          ? extra.hero_image
          : undefined;

      return [
        row.section_key,
        {
          eyebrow: row.eyebrow ?? "",
          title: row.title ?? "",
          description: row.description ?? "",
          image: imagePath ? imageUrl(imagePath) : undefined,
        },
      ];
    })
  );
}

function normalizeAmenities(value: Tables<"accommodations">["amenities"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function imageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url ? `${url}/storage/v1/object/public/property-media/${path}` : path;
}

export async function getPublicSiteData(
  slug = DEFAULT_PROPERTY_SLUG
): Promise<PublicSiteData> {
  const supabase = createPublicClient();

  const { data: propertyRow, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (propertyError || !propertyRow) {
    throw new Error(`Property "${slug}" not found or unavailable.`);
  }

  const [{ data: theme }, { data: content }, { data: social }] = await Promise.all([
    supabase.from("property_themes").select("*").eq("property_id", propertyRow.id).maybeSingle(),
    supabase.from("content_sections").select("*").eq("property_id", propertyRow.id).eq("enabled", true),
    supabase.from("social_links").select("*").eq("property_id", propertyRow.id).maybeSingle(),
  ]);

  return {
    property: {
      id: propertyRow.id,
      name: propertyRow.name,
      slug: propertyRow.slug,
      tagline: propertyRow.tagline ?? "",
      description: propertyRow.description ?? "",
      phone: propertyRow.phone ?? "",
      whatsapp: propertyRow.whatsapp ?? "",
      email: propertyRow.email ?? "",
      address: propertyRow.address ?? "",
      theme: mapTheme(theme),
    },
    content: mapContent(content ?? []),
    social,
  };
}

export async function getPublicAccommodations(
  propertyId: string
): Promise<Accommodation[]> {
  const supabase = createPublicClient();
  const { data: rooms, error } = await supabase
    .from("accommodations")
    .select("*")
    .eq("property_id", propertyId)
    .eq("published", true)
    .order("sort_order");

  if (error) throw error;
  if (!rooms?.length) return [];

  const ids = rooms.map((room) => room.id);
  const { data: images, error: imageError } = await supabase
    .from("accommodation_images")
    .select("*")
    .in("accommodation_id", ids)
    .order("sort_order");

  if (imageError) throw imageError;

  return rooms.map((room) => ({
    id: room.id,
    propertyId: room.property_id,
    name: room.name,
    slug: room.slug,
    shortDescription: room.short_description ?? "",
    description: room.description ?? "",
    capacity: room.capacity,
    adults: room.adults,
    children: room.children,
    sizeM2: Number(room.size_m2 ?? 0),
    beds: room.beds ?? "",
    amenities: normalizeAmenities(room.amenities),
    images: (images ?? [])
      .filter((image) => image.accommodation_id === room.id)
      .map((image) => imageUrl(image.storage_path)),
    published: room.published,
    order: room.sort_order,
  }));
}

export async function getPublicAccommodationBySlug(
  propertyId: string,
  slug: string
): Promise<Accommodation | null> {
  const rooms = await getPublicAccommodations(propertyId);
  return rooms.find((room) => room.slug === slug) ?? null;
}

export async function getPublicReviews(propertyId: string): Promise<Review[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("property_id", propertyId)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("review_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    propertyId: row.property_id,
    guestName: row.guest_name,
    rating: row.rating,
    text: row.review_text,
    source: row.source ?? "",
    sourceUrl: row.source_url ?? undefined,
    date: row.review_date ?? "",
    featured: row.featured,
    published: row.published,
  }));
}
