import { MediaPicker, type MediaLibraryItem } from "@/components/admin/MediaPicker";
import type { Tables } from "@/types/database";

type AccommodationRow = Tables<"accommodations">;

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  propertyId: string;
  libraryImages: MediaLibraryItem[];
  accommodation?: AccommodationRow | null;
  imageUrls?: string[];
  submitLabel?: string;
};

export function AccommodationForm({
  action,
  propertyId,
  libraryImages,
  accommodation,
  imageUrls = [],
  submitLabel = "Salvar acomodação",
}: Props) {
  const amenities = Array.isArray(accommodation?.amenities)
    ? accommodation.amenities
        .filter((item): item is string => typeof item === "string")
        .join("\n")
    : "";

  return (
    <form action={action} className="admin-panel accommodation-form">
      {accommodation?.id && (
        <input type="hidden" name="id" value={accommodation.id} />
      )}

      <div className="field-grid">
        <label>
          Nome
          <input name="name" required defaultValue={accommodation?.name ?? ""} />
        </label>

        <label>
          Slug
          <input
            name="slug"
            placeholder="gerado-automaticamente"
            defaultValue={accommodation?.slug ?? ""}
          />
        </label>

        <label className="field-full">
          Descrição curta
          <input
            name="shortDescription"
            defaultValue={accommodation?.short_description ?? ""}
          />
        </label>

        <label className="field-full">
          Descrição completa
          <textarea
            name="description"
            defaultValue={accommodation?.description ?? ""}
          />
        </label>

        <label>
          Capacidade total
          <input
            name="capacity"
            type="number"
            min="1"
            defaultValue={accommodation?.capacity ?? 2}
          />
        </label>

        <label>
          Adultos
          <input
            name="adults"
            type="number"
            min="1"
            defaultValue={accommodation?.adults ?? 2}
          />
        </label>

        <label>
          Crianças
          <input
            name="children"
            type="number"
            min="0"
            defaultValue={accommodation?.children ?? 0}
          />
        </label>

        <label>
          Metragem (m²)
          <input
            name="sizeM2"
            type="number"
            min="0"
            step="0.1"
            defaultValue={accommodation?.size_m2 ?? ""}
          />
        </label>

        <label className="field-full">
          Camas
          <input name="beds" defaultValue={accommodation?.beds ?? ""} />
        </label>

        <label className="field-full">
          Comodidades
          <textarea
            name="amenities"
            placeholder={"Wi-Fi\nAr-condicionado\nFrigobar"}
            defaultValue={amenities}
          />
          <small>Uma comodidade por linha.</small>
        </label>

        <label>
          Ordem
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={accommodation?.sort_order ?? 0}
          />
        </label>

        <label className="checkbox-field">
          <input
            name="published"
            type="checkbox"
            defaultChecked={accommodation?.published ?? false}
          />
          Publicado no site
        </label>
      </div>

      <section className="form-section">
        <MediaPicker
          propertyId={propertyId}
          fieldName="imageSelection"
          initialLibrary={libraryImages}
          initialSelected={imageUrls}
          max={5}
          title="Fotos da acomodação"
          description="Escolha até 5 fotos. Clique nas miniaturas para selecionar; a primeira será usada como capa."
          uploadCategory="Acomodações"
          coverLabel
        />
      </section>

      <div className="form-actions">
        <a className="button button-secondary" href="/admin/acomodacoes">
          Cancelar
        </a>
        <button className="button button-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
