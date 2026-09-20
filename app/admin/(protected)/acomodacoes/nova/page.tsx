import { AccommodationForm } from "@/components/admin/AccommodationForm";
import { getAdminContext } from "@/lib/data/admin";
import { createAccommodation } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewAccommodationPage() {
  const { supabase, membership } = await getAdminContext();

  const { data: library, error } = await supabase
    .from("gallery_images")
    .select("id, storage_path, alt_text, caption, category, sort_order")
    .eq("property_id", membership.property_id)
    .eq("published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Nova acomodação</span>
          <h1>Cadastrar acomodação</h1>
          <p>As informações publicadas aqui alimentam automaticamente o site.</p>
        </div>
      </header>

      <AccommodationForm
        action={createAccommodation}
        propertyId={membership.property_id}
        libraryImages={library ?? []}
        submitLabel="Criar acomodação"
      />
    </>
  );
}
