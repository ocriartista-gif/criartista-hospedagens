"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { updateBrandIdentity } from "@/app/admin/(protected)/identidade/actions";
import {
  MediaPicker,
  type MediaLibraryItem,
} from "@/components/admin/MediaPicker";
import { createClient } from "@/lib/supabase/client";

type BrandValues = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: string;
  eyebrowFont: string;
  bodyFont: string;
  eyebrowTransform: string;
  eyebrowWeight: string;
  eyebrowSpacing: string;
  logoMainPath: string;
  logoLightPath: string;
  faviconPath: string;
};

const headingFonts = [
  "Playfair Display",
  "Cormorant Garamond",
  "DM Serif Display",
  "Lora",
  "Manrope",
  "Montserrat",
  "DM Sans",
  "Sora",
  "Georgia",
];

const uiFonts = ["Inter", "Manrope", "DM Sans", "Montserrat", "Sora", "Arial"];

export function BrandEditor({
  propertyName,
  propertyId,
  libraryImages,
  initial,
}: {
  propertyName: string;
  propertyId: string;
  libraryImages: MediaLibraryItem[];
  initial: BrandValues;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [values, setValues] = useState(initial);

  const previewStyle = useMemo(
    () =>
      ({
        "--brand-primary": values.primary,
        "--brand-secondary": values.secondary,
        "--brand-accent": values.accent,
        "--brand-background": values.background,
        "--brand-text": values.text,
        "--heading-font": values.headingFont,
        "--eyebrow-font": values.eyebrowFont,
        "--body-font": values.bodyFont,
        "--eyebrow-transform": values.eyebrowTransform,
        "--eyebrow-weight": values.eyebrowWeight,
        "--eyebrow-spacing":
          values.eyebrowSpacing === "wide" ? "0.16em" : "0.05em",
      }) as CSSProperties,
    [values]
  );

  function set(key: keyof BrandValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function mediaUrl(path: string) {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
  }

  return (
    <form action={updateBrandIdentity}>
      <div className="settings-columns">
        <section className="admin-panel brand-editor-panel">
          <div className="brand-section">
            <span className="eyebrow">Arquivos da marca</span>
            <h2>Logotipos e favicon</h2>
            <p className="section-note">
              Escolha visualmente os arquivos da marca ou envie novos sem sair
              desta tela.
            </p>

            <div className="brand-media-pickers">
              <MediaPicker
                propertyId={propertyId}
                fieldName="logoMainMedia"
                initialLibrary={libraryImages}
                initialSelected={values.logoMainPath ? [values.logoMainPath] : []}
                max={1}
                title="Logo principal"
                description="Usada no cabeçalho claro do site."
                uploadCategory="Marca"
                libraryCategories={["Marca"]}
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                onSelectionChange={(paths) =>
                  set("logoMainPath", paths[0] ?? "")
                }
              />

              <MediaPicker
                propertyId={propertyId}
                fieldName="logoLightMedia"
                initialLibrary={libraryImages}
                initialSelected={values.logoLightPath ? [values.logoLightPath] : []}
                max={1}
                title="Logo clara"
                description="Usada sobre fundos escuros, especialmente no painel."
                uploadCategory="Marca"
                libraryCategories={["Marca"]}
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                onSelectionChange={(paths) =>
                  set("logoLightPath", paths[0] ?? "")
                }
              />

              <MediaPicker
                propertyId={propertyId}
                fieldName="faviconMedia"
                initialLibrary={libraryImages}
                initialSelected={values.faviconPath ? [values.faviconPath] : []}
                max={1}
                title="Favicon"
                description="Ícone pequeno exibido na aba do navegador."
                uploadCategory="Favicon"
                libraryCategories={["Favicon"]}
                accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                onSelectionChange={(paths) =>
                  set("faviconPath", paths[0] ?? "")
                }
              />
            </div>
          </div>

          <div className="brand-section">
            <span className="eyebrow">Paleta</span>
            <h2>Cores</h2>

            <div className="color-grid">
              {[
                ["primary", "Principal"],
                ["secondary", "Secundária"],
                ["accent", "Destaque"],
                ["background", "Fundo"],
                ["text", "Texto"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="color"
                    name={key}
                    value={values[key as keyof BrandValues]}
                    onChange={(event) =>
                      set(
                        key as keyof BrandValues,
                        event.target.value.toUpperCase()
                      )
                    }
                  />
                  <code>{values[key as keyof BrandValues]}</code>
                </label>
              ))}
            </div>
          </div>

          <div className="brand-section">
            <span className="eyebrow">Sistema tipográfico</span>
            <h2>Tipografia</h2>

            <div className="field-grid">
              <label>
                Títulos
                <select
                  name="headingFont"
                  value={values.headingFont}
                  onChange={(event) => set("headingFont", event.target.value)}
                >
                  {headingFonts.map((font) => (
                    <option key={font}>{font}</option>
                  ))}
                </select>
              </label>

              <label>
                Eyebrow
                <select
                  name="eyebrowFont"
                  value={values.eyebrowFont}
                  onChange={(event) => set("eyebrowFont", event.target.value)}
                >
                  {uiFonts.map((font) => (
                    <option key={font}>{font}</option>
                  ))}
                </select>
              </label>

              <label>
                Textos / interface
                <select
                  name="bodyFont"
                  value={values.bodyFont}
                  onChange={(event) => set("bodyFont", event.target.value)}
                >
                  {uiFonts.map((font) => (
                    <option key={font}>{font}</option>
                  ))}
                </select>
              </label>

              <label>
                Capitalização do eyebrow
                <select
                  name="eyebrowTransform"
                  value={values.eyebrowTransform}
                  onChange={(event) =>
                    set("eyebrowTransform", event.target.value)
                  }
                >
                  <option value="uppercase">CAIXA ALTA</option>
                  <option value="normal">Caixa normal</option>
                  <option value="capitalize">Primeira Letra Maiúscula</option>
                </select>
              </label>

              <label>
                Peso do eyebrow
                <select
                  name="eyebrowWeight"
                  value={values.eyebrowWeight}
                  onChange={(event) => set("eyebrowWeight", event.target.value)}
                >
                  <option value="400">Regular</option>
                  <option value="500">Médio</option>
                  <option value="600">Semibold</option>
                </select>
              </label>

              <label>
                Espaçamento do eyebrow
                <select
                  name="eyebrowSpacing"
                  value={values.eyebrowSpacing}
                  onChange={(event) => set("eyebrowSpacing", event.target.value)}
                >
                  <option value="wide">Amplo</option>
                  <option value="normal">Normal</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="button button-primary" type="submit">
              Salvar identidade
            </button>
          </div>
        </section>

        <aside className="admin-panel brand-preview" style={previewStyle}>
          <span className="eyebrow">Pré-visualização</span>

          <div className="brand-preview-logo">
            {values.logoMainPath ? (
              <img src={mediaUrl(values.logoMainPath)} alt={propertyName} />
            ) : (
              <strong>{propertyName}</strong>
            )}
          </div>

          <h2>Chalé Jardim</h2>
          <p>Natureza e privacidade para momentos tranquilos.</p>
          <button className="button button-primary" type="button">
            Ver disponibilidade
          </button>

          <div className="brand-assets-preview">
            <div className="brand-dark-preview">
              <small>Logo clara</small>
              {values.logoLightPath ? (
                <img src={mediaUrl(values.logoLightPath)} alt="" />
              ) : (
                <span>Sem logo clara</span>
              )}
            </div>

            <div className="favicon-preview">
              <small>Favicon</small>
              {values.faviconPath ? (
                <img src={mediaUrl(values.faviconPath)} alt="" />
              ) : (
                <span>—</span>
              )}
            </div>
          </div>

          <div className="brand-swatches">
            {[
              values.primary,
              values.secondary,
              values.accent,
              values.background,
              values.text,
            ].map((color) => (
              <span key={color} style={{ background: color }} title={color} />
            ))}
          </div>

          <div className="contrast-ok">
            ✓ Estrutura e hierarquia de conversão permanecem protegidas
          </div>
        </aside>
      </div>
    </form>
  );
}
