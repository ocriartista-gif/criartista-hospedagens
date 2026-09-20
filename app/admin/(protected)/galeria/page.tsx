import { GalleryManager } from "@/components/admin/GalleryManager";
import { getAdminContext } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { supabase, membership } = await getAdminContext();

  const { data: images, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("property_id", membership.property_id)
    .order("sort_order")
    .order("created_at");

  if (error) throw error;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Mídia</span>
          <h1>Galeria</h1>
          <p>
            Biblioteca visual da propriedade para fotos de ambiente, experiências,
            acomodações e peças da marca.
          </p>
        </div>
      </header>

      <GalleryManager
        propertyId={membership.property_id}
        initialImages={images ?? []}
      />
    </>
  );
}
