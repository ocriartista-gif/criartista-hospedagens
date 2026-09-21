import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingArea } from "@/components/site/BookingArea";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  getPublicAccommodationBySlug,
  getPublicAccommodations,
  getPublicSiteData,
} from "@/lib/data/public";
import { themeStyle } from "@/lib/theme";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { property } = await getPublicSiteData();
  const accommodation = await getPublicAccommodationBySlug(property.id, slug);

  if (!accommodation) {
    return { title: "Acomodação não encontrada" };
  }

  const description =
    accommodation.shortDescription ||
    accommodation.description ||
    `Conheça ${accommodation.name} em ${property.name}.`;

  return {
    title: accommodation.name,
    description,
    alternates: { canonical: `/acomodacoes/${accommodation.slug}` },
    openGraph: {
      type: "website",
      url: `/acomodacoes/${accommodation.slug}`,
      title: `${accommodation.name} | ${property.name}`,
      description,
      images: accommodation.images[0]
        ? [{ url: accommodation.images[0] }]
        : undefined,
    },
  };
}

export default async function AccommodationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { property, content } = await getPublicSiteData();
  const [accommodation, accommodations] = await Promise.all([
    getPublicAccommodationBySlug(property.id, slug),
    getPublicAccommodations(property.id),
  ]);

  if (!accommodation) notFound();

  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: accommodation.name,
    description: accommodation.description || accommodation.shortDescription,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: accommodation.capacity,
    },
    image: accommodation.images,
  };

  return (
    <main style={themeStyle(property.theme)}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(roomJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader property={property} />
      <section className="room-hero container">
        <div className="room-gallery">
          {accommodation.images.length ? (
            <>
              <img
                className="room-main-image"
                src={accommodation.images[0]}
                alt={accommodation.name}
              />
              {accommodation.images.slice(1).map((image) => (
                <img key={image} src={image} alt="" />
              ))}
            </>
          ) : (
            <div className="public-image-placeholder room-main-image">
              Foto em breve
            </div>
          )}
        </div>
        <div className="room-copy">
          <span className="eyebrow">Acomodação</span>
          <h1>{accommodation.name}</h1>
          <p>{accommodation.description}</p>
          <div className="facts">
            <span>{accommodation.capacity} hóspedes</span>
            {accommodation.sizeM2 > 0 && <span>{accommodation.sizeM2} m²</span>}
            {accommodation.beds && <span>{accommodation.beds}</span>}
            <span>Check-in {property.checkInTime.slice(0, 5)}</span>
            <span>Check-out {property.checkOutTime.slice(0, 5)}</span>
          </div>
          <h2>Comodidades</h2>
          <ul className="amenities">
            {accommodation.amenities.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {(property.childrenPolicy ||
            property.petsPolicy ||
            property.cancellationPolicy) && (
            <div className="room-policies">
              <h2>Informações importantes</h2>
              {property.childrenPolicy && <p><strong>Crianças:</strong> {property.childrenPolicy}</p>}
              {property.petsPolicy && <p><strong>Pets:</strong> {property.petsPolicy}</p>}
              {property.cancellationPolicy && <p><strong>Cancelamento:</strong> {property.cancellationPolicy}</p>}
            </div>
          )}
        </div>
      </section>
      <div className="container">
        <BookingArea
          propertyId={property.id}
          propertyWhatsapp={property.whatsapp}
          accommodations={accommodations}
          accommodationId={accommodation.id}
          content={content.direct_booking}
        />
      </div>
    </main>
  );
}
