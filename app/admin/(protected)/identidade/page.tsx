import { BrandEditor } from "@/components/admin/BrandEditor";
import { getAdminContext } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function BrandPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    reset?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const { supabase, membership, property } = await getAdminContext();

  const [
    { data: theme, error },
    { data: library, error: libraryError },
    { data: lastHistory, error: historyError },
  ] = await Promise.all([
    supabase
      .from("property_themes")
      .select("*")
      .eq("property_id", membership.property_id)
      .single(),
    supabase
      .from("gallery_images")
      .select("id, storage_path, alt_text, caption, category, sort_order")
      .eq("property_id", membership.property_id)
      .eq("published", true)
      .order("sort_order")
      .order("created_at", { ascending: false }),
    supabase
      .from("property_theme_history")
      .select("id")
      .eq("property_id", membership.property_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (error) throw error;
  if (libraryError) throw libraryError;
  if (historyError) throw historyError;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">White-label protegido</span>
          <h1>Identidade da marca</h1>
          <p>
            Personalize a marca e a aplicação da paleta. Estrutura e contraste
            continuam protegidos pelo sistema.
          </p>
        </div>
      </header>

      {params.saved === "1" && (
        <div className="feedback-box feedback-success">
          Identidade atualizada no site e no painel.
        </div>
      )}

      {params.reset === "1" && (
        <div className="feedback-box feedback-success">
          A última alteração da identidade foi desfeita.
        </div>
      )}

      {params.error && (
        <div className="feedback-box feedback-error">{params.error}</div>
      )}

      <BrandEditor
        propertyName={property.name}
        propertyId={membership.property_id}
        libraryImages={library ?? []}
        canReset={Boolean(lastHistory)}
        initial={{
          primary: theme.primary_color,
          secondary: theme.secondary_color,
          accent: theme.accent_color,
          background: theme.background_color,
          text: theme.text_color,
          headingFont: theme.heading_font,
          eyebrowFont: theme.eyebrow_font,
          bodyFont: theme.body_font,
          eyebrowTransform:
            theme.eyebrow_transform as "uppercase" | "normal" | "capitalize",
          eyebrowWeight: theme.eyebrow_weight as "400" | "500" | "600",
          eyebrowSpacing: theme.eyebrow_spacing as "normal" | "wide",
          headerSurfaceKey:
            theme.header_surface_key as
              | "primary"
              | "secondary"
              | "accent"
              | "background"
              | "text",
          postHeroSurfaceKey:
            theme.post_hero_surface_key as
              | "primary"
              | "secondary"
              | "accent"
              | "background"
              | "text",
          logoMainPath: theme.logo_main_url ?? "",
          logoLightPath: theme.logo_light_url ?? "",
          faviconPath: theme.favicon_url ?? "",
        }}
      />
    </>
  );
}
