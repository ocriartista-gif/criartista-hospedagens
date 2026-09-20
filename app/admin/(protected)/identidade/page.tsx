import { BrandEditor } from "@/components/admin/BrandEditor";
import { getAdminContext } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function BrandPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { supabase, membership, property } = await getAdminContext();

  const { data: theme, error } = await supabase
    .from("property_themes")
    .select("*")
    .eq("property_id", membership.property_id)
    .single();

  if (error) throw error;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">White-label protegido</span>
          <h1>Identidade da marca</h1>
          <p>A marca pode mudar. A jornada de reserva não.</p>
        </div>
      </header>

      {saved === "1" && (
        <div className="feedback-box feedback-success">
          Identidade atualizada no site e no painel.
        </div>
      )}

      <BrandEditor
        propertyName={property.name}
        initial={{
          primary: theme.primary_color,
          secondary: theme.secondary_color,
          accent: theme.accent_color,
          background: theme.background_color,
          text: theme.text_color,
          headingFont: theme.heading_font,
          eyebrowFont: theme.eyebrow_font,
          bodyFont: theme.body_font,
          eyebrowTransform: theme.eyebrow_transform,
          eyebrowWeight: theme.eyebrow_weight,
          eyebrowSpacing: theme.eyebrow_spacing,
          logoMainUrl: theme.logo_main_url ?? "",
          logoLightUrl: theme.logo_light_url ?? "",
          faviconUrl: theme.favicon_url ?? "",
        }}
      />
    </>
  );
}
