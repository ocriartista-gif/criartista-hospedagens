import Link from "next/link";
import { getAdminContext } from "@/lib/data/admin";

export default async function AdminAccommodations() {
  const { supabase, membership } = await getAdminContext(["owner", "manager", "marketing", "technical_admin"]);

  const { data: accommodations, error } = await supabase
    .from("accommodations")
    .select("*")
    .eq("property_id", membership.property_id)
    .order("sort_order");

  if (error) throw error;

  const ids = (accommodations ?? []).map((item) => item.id);
  const { data: images } = ids.length
    ? await supabase
        .from("accommodation_images")
        .select("accommodation_id, storage_path, is_cover, sort_order")
        .in("accommodation_id", ids)
        .order("sort_order")
    : { data: [] };

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Hospedagem</span>
          <h1>Acomodações</h1>
          <p>Cadastre e publique os quartos sem alterar a estrutura do site.</p>
        </div>
        <Link className="button button-primary" href="/admin/acomodacoes/nova">
          + Nova acomodação
        </Link>
      </header>

      <div className="admin-card-grid">
        {(accommodations ?? []).map((item) => {
          const roomImages = (images ?? []).filter(
            (image) => image.accommodation_id === item.id
          );
          const cover =
            roomImages.find((image) => image.is_cover)?.storage_path ??
            roomImages[0]?.storage_path;

          return (
            <article className="admin-card" key={item.id}>
              {cover ? <img src={cover} alt="" /> : <div className="admin-image-placeholder">Sem foto</div>}
              <div>
                <span className="eyebrow">
                  {item.published ? "Publicado" : "Oculto"}
                </span>
                <h2>{item.name}</h2>
                <p>{item.short_description}</p>
                <div className="meta-row">
                  <span>{item.capacity} hóspedes</span>
                  <span>{roomImages.length}/5 fotos</span>
                </div>
                <Link
                  className="button button-secondary"
                  href={`/admin/acomodacoes/${item.id}`}
                >
                  Editar
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
