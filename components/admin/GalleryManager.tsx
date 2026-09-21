"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_CATEGORIES,
  normalizeMediaCategory,
  type MediaCategory,
} from "@/lib/media-categories";

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

type UsageFilter = "all" | "in-use" | "available" | "hidden";

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

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function GalleryManager({
  propertyId,
  initialImages,
  inUsePaths = [],
}: {
  propertyId: string;
  initialImages: GalleryImage[];
  inUsePaths?: string[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | MediaCategory>("all");
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");


  const filteredImages = useMemo(() => {
    const query = normalizeSearch(search);

    return images.filter((image) => {
      const category = normalizeMediaCategory(image.category);
      const isInUse = inUsePaths.includes(image.storage_path);

      const matchesSearch =
        !query ||
        [
          image.alt_text,
          image.caption,
          category,
          image.storage_path.split("/").at(-1),
        ].some((value) => normalizeSearch(value ?? "").includes(query));

      const matchesCategory =
        categoryFilter === "all" || category === categoryFilter;

      const matchesUsage =
        usageFilter === "all" ||
        (usageFilter === "in-use" && isInUse) ||
        (usageFilter === "available" && image.published && !isInUse) ||
        (usageFilter === "hidden" && !image.published);

      return matchesSearch && matchesCategory && matchesUsage;
    });
  }, [images, inUsePaths, search, categoryFilter, usageFilter]);

  const hasActiveFilters =
    Boolean(search.trim()) || categoryFilter !== "all" || usageFilter !== "all";

  function publicUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setUsageFilter("all");
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const files = form
      .getAll("files")
      .filter(
        (value): value is File => value instanceof File && value.size > 0
      );
    const uploadCategory = normalizeMediaCategory(
      String(form.get("uploadCategory") ?? "Geral")
    );

    if (!files.length) {
      setMessage("Selecione pelo menos uma imagem.");
      return;
    }

    const invalid = files.find(
      (file) =>
        !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024
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
        const path = `${propertyId}/gallery/${crypto.randomUUID()}-${cleanFileName(
          file.name
        )}`;

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
            category: uploadCategory,
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
      setCategoryFilter("all");
      setUsageFilter("all");
      setSearch("");
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
      category: normalizeMediaCategory(
        String(form.get("category") ?? "Geral")
      ),
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
    if (inUsePaths.includes(image.storage_path)) {
      setMessage(
        "Esta imagem está em uso no site. Remova-a da seção ou acomodação antes de excluí-la da biblioteca."
      );
      return;
    }

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
          <label className="gallery-upload-category">
            Organizar em
            <select name="uploadCategory" defaultValue="Geral">
              {MEDIA_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <small>
              Isso só organiza a Biblioteca; não publica a imagem em nenhuma seção.
            </small>
          </label>
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

      {images.length > 0 && (
        <section className="admin-panel media-library-toolbar">
          <div className="media-library-toolbar-heading">
            <div>
              <span className="eyebrow">Organização</span>
              <h2>Encontrar arquivos</h2>
            </div>
            <span className="media-result-count">
              {filteredImages.length} de {images.length}{" "}
              {images.length === 1 ? "arquivo" : "arquivos"}
            </span>
          </div>

          <div className="media-library-filters">
            <label className="media-search-field">
              Buscar
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nome ou legenda da imagem..."
              />
            </label>

            <label>
              Grupo
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as "all" | MediaCategory)
                }
              >
                <option value="all">Todos os grupos</option>
                {MEDIA_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Uso
              <select
                value={usageFilter}
                onChange={(event) =>
                  setUsageFilter(event.target.value as UsageFilter)
                }
              >
                <option value="all">Todos</option>
                <option value="in-use">Em uso no site</option>
                <option value="available">Livres para usar</option>
                <option value="hidden">Ocultas</option>
              </select>
            </label>

            <button
              className="button button-secondary media-clear-filters"
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              Limpar filtros
            </button>
          </div>

          <p className="media-library-help">
            <strong>Grupo</strong> organiza a Biblioteca. <strong>Uso</strong> mostra
            se a imagem já está aplicada no site.
          </p>
        </section>
      )}

      <div className="gallery-library">
        {filteredImages.map((image) => (
          <article className="gallery-library-card" key={image.id}>
            <div className="gallery-library-image">
              <img
                src={publicUrl(image.storage_path)}
                alt={image.alt_text ?? ""}
              />
              <span
                className={
                  inUsePaths.includes(image.storage_path)
                    ? "in-use"
                    : image.published
                      ? "published"
                      : "hidden"
                }
              >
                {inUsePaths.includes(image.storage_path)
                  ? "Em uso"
                  : image.published
                    ? "Disponível"
                    : "Oculta"}
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
                  Grupo
                  <select
                    name="category"
                    defaultValue={normalizeMediaCategory(image.category)}
                  >
                    {MEDIA_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
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
                  disabled={inUsePaths.includes(image.storage_path)}
                  title={
                    inUsePaths.includes(image.storage_path)
                      ? "Remova esta foto da seção ou acomodação antes de excluí-la."
                      : "Remover da biblioteca"
                  }
                >
                  {inUsePaths.includes(image.storage_path)
                    ? "Em uso"
                    : "Remover"}
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

      {images.length > 0 && !filteredImages.length && (
        <div className="admin-panel empty-state media-filter-empty">
          <strong>Nenhum arquivo encontrado.</strong>
          <span>Tente outro termo ou limpe os filtros aplicados.</span>
          <button
            className="button button-secondary"
            type="button"
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </>
  );
}
