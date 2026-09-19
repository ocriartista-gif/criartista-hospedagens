import { notFound } from "next/navigation";
import { AccommodationForm } from "@/components/admin/AccommodationForm";
import { deleteAccommodation, updateAccommodation } from "../actions";
import { getAdminContext } from "@/lib/data/admin";

export default async function EditAccommodationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, membership } = await getAdminContext();

  const { data: accommodation, error } = await supabase
    .from("accommodations")
    .select("*")
    .eq("id", id)
    .eq("property_id", membership.property_id)
    .maybeSingle();

  if (error) throw error;
  if (!accommodation) notFound();

  const { data: images, error: imageError } = await supabase
    .from("accommodation_images")
    .select("storage_path")
    .eq("accommodation_id", id)
    .order("sort_order");

  if (imageError) throw imageError;

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Editar acomodação</span>
          <h1>{accommodation.name}</h1>
          <p>Alterações salvas aqui serão refletidas no site público.</p>
        </div>
      </header>

      <AccommodationForm
        action={updateAccommodation}
        accommodation={accommodation}
        imageUrls={(images ?? []).map((image) => image.storage_path)}
      />

      <form action={deleteAccommodation} className="danger-zone">
        <input type="hidden" name="id" value={accommodation.id} />
        <div>
          <strong>Excluir acomodação</strong>
          <p>Esta ação remove também as imagens relacionadas.</p>
        </div>
        <button className="button button-danger" type="submit">
          Excluir
        </button>
      </form>
    </>
  );
}
