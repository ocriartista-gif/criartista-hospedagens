"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type GalleryImage = {
  id: string;
  property_id: string;
  storage_path: string;
  alt_text: string | null;
  caption: string | null;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

function cleanFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function labelFromFile(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function GalleryManager({
  propertyId,
  initialImages,
}: {
  propertyId: string;
  initialImages: GalleryImage[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function publicUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const files = form.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);

    if (!files.length) {
      setMessage("Selecione pelo menos uma imagem.");
      return;
    }

    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024
    );

    if (invalid) {
      setMessage("Use apenas imagens de até 10 MB.");
      return;
    }

    setUploading(true);

    try {
      let order =
        images.reduce((max, image) => Math.max(max, image.sort_order), 0) + 1;

      const created: GalleryImage[] = [];

      for (const file of files) {
        const path = `${propertyId}/gallery/${crypto.randomUUID()}-${cleanFileName(file.name)}`;

        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        const { data, error: insertError } = await supabase
          .from("gallery_images")
          .insert({
            property_id: propertyId,
            storage_path: path,
            alt_text: labelFromFile(file.name),
            caption: null,
            category: "Geral",
            sort_order: order,
            published: true,
          })
          .select("*")
          .single();

        if (insertError) {
          await supabase.storage.from("property-media").remove([path]);
          throw insertError;
        }

        created.push(data);
        order += 1;
      }

      setImages((current) => [...current, ...created]);
      setMessage(
        created.length === 1
          ? "Imagem adicionada à biblioteca."
          : `${created.length} imagens adicionadas à biblioteca.`
      );
      formElement.reset();
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar as imagens."
      );
    } finally {
      setUploading(false);
    }
  }

  async function updateImage(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      alt_text: String(form.get("altText") ?? "").trim() || null,
      caption: String(form.get("caption") ?? "").trim() || null,
      category: String(form.get("category") ?? "").trim() || null,
      sort_order: Number(form.get("sortOrder") ?? 0) || 0,
      published: form.get("published") === "on",
    };

    const { data, error } = await supabase
      .from("gallery_images")
      .update(payload)
      .eq("id", id)
      .eq("property_id", propertyId)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setImages((current) =>
      current
        .map((image) => (image.id === id ? data : image))
        .sort((a, b) => a.sort_order - b.sort_order)
    );
    setMessage("Imagem atualizada.");
    router.refresh();
  }

  async function removeImage(image: GalleryImage) {
    const confirmed = window.confirm(
      "Remover esta imagem da biblioteca? Essa ação não pode ser desfeita."
    );

    if (!confirmed) return;

    setMessage("");

    const { error: deleteError } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", image.id)
      .eq("property_id", propertyId);

    if (deleteError) {
      setMessage(deleteError.message);
      return;
    }

    if (!/^https?:\/\//.test(image.storage_path)) {
      await supabase.storage.from("property-media").remove([image.storage_path]);
    }

    setImages((current) => current.filter((item) => item.id !== image.id));
    setMessage("Imagem removida da biblioteca.");
    router.refresh();
  }

  return (
    <>
      <section className="admin-panel gallery-upload-panel">
        <div>
          <span className="eyebrow">Upload</span>
          <h2>Adicionar imagens</h2>
          <p>
            JPG, PNG, WebP, AVIF ou SVG. Até 10 MB por arquivo. Você pode
            selecionar várias imagens de uma vez.
          </p>
        </div>

        <form className="gallery-upload-form" onSubmit={upload}>
          <input
            type="file"
            name="files"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            multiple
            required
          />
          <button
            className="button button-primary"
            type="submit"
            disabled={uploading}
          >
            {uploading ? "Enviando..." : "Enviar imagens"}
          </button>
        </form>
      </section>

      {message && (
        <div className="feedback-box feedback-success gallery-feedback">
          {message}
        </div>
      )}

      <div className="gallery-library">
        {images.map((image) => (
          <article className="gallery-library-card" key={image.id}>
            <div className="gallery-library-image">
              <img
                src={publicUrl(image.storage_path)}
                alt={image.alt_text ?? ""}
              />
              <span className={image.published ? "published" : "hidden"}>
                {image.published ? "Disponível" : "Oculta"}
              </span>
            </div>

            <form
              className="gallery-library-form"
              onSubmit={(event) => updateImage(event, image.id)}
            >
              <label>
                Texto alternativo
                <input
                  name="altText"
                  defaultValue={image.alt_text ?? ""}
                  placeholder="Descreva a imagem"
                />
              </label>

              <label>
                Legenda
                <input
                  name="caption"
                  defaultValue={image.caption ?? ""}
                  placeholder="Legenda opcional"
                />
              </label>

              <div className="field-grid">
                <label>
                  Categoria
                  <input
                    name="category"
                    defaultValue={image.category ?? ""}
                    placeholder="Geral"
                  />
                </label>

                <label>
                  Ordem
                  <input
                    type="number"
                    min="0"
                    name="sortOrder"
                    defaultValue={image.sort_order}
                  />
                </label>
              </div>

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={image.published}
                />
                Disponível para uso no site
              </label>

              <div className="gallery-card-actions">
                <button className="button button-secondary" type="submit">
                  Salvar
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() => removeImage(image)}
                >
                  Remover
                </button>
              </div>
            </form>
          </article>
        ))}
      </div>

      {!images.length && (
        <div className="admin-panel empty-state">
          A biblioteca ainda não possui imagens.
        </div>
      )}
    </>
  );
}
