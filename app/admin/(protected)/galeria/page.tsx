import { GalleryManager } from "@/components/admin/GalleryManager";
import { getAdminContext } from "@/lib/data/admin";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";

function heroImage(extra: Json) {
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return null;
  const value = (extra as Record<string, Json | undefined>).hero_image;
  return typeof value === "string" && value ? value : null;
}

export default async function GalleryPage() {
  const { supabase, membership } = await getAdminContext(["owner", "manager", "marketing", "technical_admin"]);

  const [
    { data: images, error },
    { data: accommodations, error: accommodationsError },
    { data: sections, error: sectionsError },
    { data: theme, error: themeError },
  ] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("*")
      .eq("property_id", membership.property_id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("accommodations")
      .select("id")
      .eq("property_id", membership.property_id),
    supabase
      .from("content_sections")
      .select("section_key, extra")
      .eq("property_id", membership.property_id),
    supabase
      .from("property_themes")
      .select("logo_main_url, logo_light_url, favicon_url")
      .eq("property_id", membership.property_id)
      .maybeSingle(),
  ]);

  if (error) throw error;
  if (accommodationsError) throw accommodationsError;
  if (sectionsError) throw sectionsError;
  if (themeError) throw themeError;

  const accommodationIds = (accommodations ?? []).map((item) => item.id);

  const { data: accommodationImages, error: accommodationImagesError } =
    accommodationIds.length
      ? await supabase
          .from("accommodation_images")
          .select("storage_path")
          .in("accommodation_id", accommodationIds)
      : { data: [], error: null };

  if (accommodationImagesError) throw accommodationImagesError;

  const inUsePaths = new Set(
    (accommodationImages ?? []).map((item) => item.storage_path)
  );

  for (const section of sections ?? []) {
    if (section.section_key === "hero") {
      const path = heroImage(section.extra);
      if (path) inUsePaths.add(path);
    }
  }

  if (theme?.logo_main_url) inUsePaths.add(theme.logo_main_url);
  if (theme?.logo_light_url) inUsePaths.add(theme.logo_light_url);
  if (theme?.favicon_url) inUsePaths.add(theme.favicon_url);

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Biblioteca de mídia</span>
          <h1>Galeria</h1>
          <p>
            Aqui ficam os arquivos disponíveis. A escolha de quais fotos aparecem
            no site acontece dentro de cada seção ou acomodação.
          </p>
        </div>
      </header>

      <div className="integration-runtime-note">
        <strong>Como usar as fotos</strong>
        <span>
          Para trocar o Hero, vá em Conteúdo → Hero. Para fotos de quartos, abra
          Acomodações. Logos e favicon ficam em Identidade. As miniaturas desta
          biblioteca aparecem diretamente em cada um desses lugares.
        </span>
      </div>

      <GalleryManager
        propertyId={membership.property_id}
        initialImages={images ?? []}
        inUsePaths={[...inUsePaths]}
      />
    </>
  );
}
