import Link from "next/link";
import type { Accommodation } from "@/types";

export function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  return (
    <article className="accommodation-card">
      <img src={accommodation.images[0]} alt={accommodation.name} />
      <div>
        <span className="eyebrow">Até {accommodation.capacity} hóspedes</span>
        <h3>{accommodation.name}</h3>
        <p>{accommodation.shortDescription}</p>
        <div className="meta-row"><span>{accommodation.sizeM2} m²</span><span>{accommodation.beds}</span></div>
        <Link className="text-link" href={`/acomodacoes/${accommodation.slug}`}>Ver detalhes →</Link>
      </div>
    </article>
  );
}
