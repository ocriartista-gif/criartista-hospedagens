import Link from "next/link";
import type { Accommodation } from "@/types";

export function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  const cover = accommodation.images[0];

  return (
    <article className="accommodation-card">
      {cover ? (
        <img src={cover} alt={accommodation.name} />
      ) : (
        <div className="public-image-placeholder" aria-label="Foto ainda não disponível">
          Foto em breve
        </div>
      )}
      <div>
        <span className="eyebrow">Até {accommodation.capacity} hóspedes</span>
        <h3>{accommodation.name}</h3>
        <p>{accommodation.shortDescription}</p>
        <div className="meta-row">
          {accommodation.sizeM2 > 0 && <span>{accommodation.sizeM2} m²</span>}
          {accommodation.beds && <span>{accommodation.beds}</span>}
        </div>
        <Link className="text-link" href={`/acomodacoes/${accommodation.slug}`}>
          Ver detalhes →
        </Link>
      </div>
    </article>
  );
}
