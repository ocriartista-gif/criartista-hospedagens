"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MediaLibraryItem = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  caption: string | null;
  category: string | null;
  sort_order: number;
};

type Props = {
  propertyId: string;
  fieldName: string;
  initialLibrary: MediaLibraryItem[];
  initialSelected?: string[];
  max?: number;
  title?: string;
  description?: string;
  uploadCategory?: string;
  coverLabel?: boolean;
  libraryCategories?: string[];
  accept?: string;
  onSelectionChange?: (paths: string[]) => void;
};

function cleanFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function fileLabel(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function MediaPicker({
  propertyId,
  fieldName,
  initialLibrary,
  initialSelected = [],
  max = 1,
  title = "Imagens",
  description,
  uploadCategory = "Geral",
  coverLabel = false,
  libraryCategories,
  accept = "image/jpeg,image/png,image/webp,image/avif,image/svg+xml",
  onSelectionChange,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const filteredLibrary = useMemo(
    () =>
      libraryCategories?.length
        ? initialLibrary.filter((item) =>
            item.category ? libraryCategories.includes(item.category) : false
          )
        : initialLibrary,
    [initialLibrary, libraryCategories]
  );
  const [library, setLibrary] = useState(filteredLibrary);
  const [selected, setSelected] = useState(initialSelected.slice(0, max));
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function publicUrl(path: string) {
    if (/^https?:\/\//.test(path)) return path;
    return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
  }

  const libraryWithSelected = useMemo(() => {
    const known = new Set(library.map((item) => item.storage_path));
    const missing = selected
      .filter((path) => !known.has(path))
      .map((path, index) => ({
        id: `selected-${index}`,
        storage_path: path,
        alt_text: null,
        caption: null,
        category: "Selecionada anteriormente",
        sort_order: -1,
      }));

    return [...missing, ...library];
  }, [library, selected]);

  function toggle(path: string) {
    setMessage("");

    setSelected((current) => {
      if (current.includes(path)) {
        const next = current.filter((item) => item !== path);
        onSelectionChange?.(next);
        return next;
      }

      if (current.length >= max) {
        setMessage(
          max === 1
            ? "Escolha apenas uma imagem para esta seção."
            : `Você pode selecionar até ${max} imagens.`
        );
        return current;
      }

      const next = [...current, path];
      onSelectionChange?.(next);
      return next;
    });
  }

  function move(index: number, direction: -1 | 1) {
    setSelected((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      onSelectionChange?.(next);
      return next;
    });
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024
    );

    if (invalid) {
      setMessage("Use imagens JPG, PNG, WebP, AVIF ou SVG de até 10 MB.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      let order =
        library.reduce((highest, image) => Math.max(highest, image.sort_order), 0) + 1;
      const created: MediaLibraryItem[] = [];

      for (const file of files) {
        const path = `${propertyId}/library/${crypto.randomUUID()}-${cleanFileName(file.name)}`;

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
            alt_text: fileLabel(file.name),
            caption: null,
            category: uploadCategory,
            sort_order: order,
            published: true,
          })
          .select("id, storage_path, alt_text, caption, category, sort_order")
          .single();

        if (insertError) {
          await supabase.storage.from("property-media").remove([path]);
          throw insertError;
        }

        created.push(data);
        order += 1;
      }

      setLibrary((current) => [...created, ...current]);
      setSelected((current) => {
        const available = Math.max(0, max - current.length);
        const next = [
          ...current,
          ...created.slice(0, available).map((item) => item.storage_path),
        ];
        onSelectionChange?.(next);
        return next;
      });

      setMessage(
        created.length === 1
          ? "Imagem enviada e selecionada."
          : "Imagens enviadas. As primeiras disponíveis já foram selecionadas."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível enviar a imagem."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="media-picker">
      <input type="hidden" name={fieldName} value={JSON.stringify(selected)} />

      <div className="media-picker-heading">
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>

        <label className="button button-secondary media-upload-button">
          {uploading ? "Enviando..." : "+ Enviar nova foto"}
          <input
            type="file"
            accept={accept}
            multiple={max > 1}
            disabled={uploading}
            onChange={uploadFiles}
          />
        </label>
      </div>

      <div className="media-selection-summary">
        <strong>
          {selected.length} de {max} selecionada{max === 1 ? "" : "s"}
        </strong>
        <span>
          {coverLabel && selected.length
            ? "A primeira imagem será a capa."
            : "Clique nas miniaturas abaixo para escolher."}
        </span>
      </div>

      {selected.length > 0 && (
        <div className="media-selected-strip">
          {selected.map((path, index) => (
            <article className="media-selected-card" key={path}>
              <div className="media-selected-image">
                <img src={publicUrl(path)} alt="" />
                <span>
                  {coverLabel && index === 0 ? "Capa" : index + 1}
                </span>
              </div>

              <div className="media-selected-actions">
                {max > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      title="Mover para a esquerda"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === selected.length - 1}
                      title="Mover para a direita"
                    >
                      →
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => toggle(path)}
                  title="Remover seleção"
                >
                  ×
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="media-library-inline">
        {libraryWithSelected.map((image) => {
          const selectedIndex = selected.indexOf(image.storage_path);
          const active = selectedIndex >= 0;

          return (
            <button
              type="button"
              className={`media-library-thumb ${active ? "selected" : ""}`}
              key={image.id}
              onClick={() => toggle(image.storage_path)}
              aria-pressed={active}
            >
              <img
                src={publicUrl(image.storage_path)}
                alt={image.alt_text ?? image.caption ?? ""}
              />
              <span className="media-thumb-overlay">
                {active
                  ? coverLabel && selectedIndex === 0
                    ? "Capa"
                    : `Selecionada ${selectedIndex + 1}`
                  : "Selecionar"}
              </span>
              {(image.caption || image.category) && (
                <small>{image.caption || image.category}</small>
              )}
            </button>
          );
        })}
      </div>

      {!libraryWithSelected.length && (
        <div className="media-empty">
          Nenhuma imagem ainda. Use “Enviar nova foto” para começar.
        </div>
      )}

      {message && <p className="media-picker-message">{message}</p>}
    </div>
  );
}
