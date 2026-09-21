"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  resetLastBrandIdentity,
  updateBrandIdentity,
} from "@/app/admin/(protected)/identidade/actions";
import {
  MediaPicker,
  type MediaLibraryItem,
} from "@/components/admin/MediaPicker";
import { createClient } from "@/lib/supabase/client";
import {
  bestPaletteText,
  getThemeContrastIssues,
  isDarkColor,
  PALETTE_KEYS,
  PALETTE_LABELS,
  resolvePaletteColor,
} from "@/lib/theme";
import type { PaletteKey } from "@/types";

type BrandValues = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: string;
  eyebrowFont: string;
  bodyFont: string;
  eyebrowTransform: "uppercase" | "normal" | "capitalize";
  eyebrowWeight: "400" | "500" | "600";
  eyebrowSpacing: "normal" | "wide";
  headerSurfaceKey: PaletteKey;
  ctaSurfaceKey: PaletteKey;
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

function SurfaceSelector({
  title,
  description,
  name,
  value,
  values,
  onChange,
}: {
  title: string;
  description: string;
  name: string;
  value: PaletteKey;
  values: BrandValues;
  onChange: (value: PaletteKey) => void;
}) {
  return (
    <div className="surface-selector">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <div className="surface-options">
        {PALETTE_KEYS.map((key) => {
          const background = resolvePaletteColor(values, key);
          const foreground = bestPaletteText(background, values);

          return (
            <label
              className={`surface-option ${value === key ? "selected" : ""}`}
              key={key}
              style={
                {
                  "--surface-swatch": background,
                  "--surface-swatch-text": foreground.color,
                } as CSSProperties
              }
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={value === key}
                onChange={() => onChange(key)}
              />
              <span className="surface-swatch">Aa</span>
              <small>{PALETTE_LABELS[key]}</small>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function BrandEditor({
  propertyName,
  propertyId,
  libraryImages,
  canReset,
  initial,
}: {
  propertyName: string;
  propertyId: string;
  libraryImages: MediaLibraryItem[];
  canReset: boolean;
  initial: BrandValues;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [values, setValues] = useState(initial);

  const contrastIssues = useMemo(
    () => getThemeContrastIssues(values),
    [values]
  );

  const headerBackground = resolvePaletteColor(
    values,
    values.headerSurfaceKey
  );
  const headerText = bestPaletteText(headerBackground, values).color;
  const ctaBackground = resolvePaletteColor(values, values.ctaSurfaceKey);
  const ctaText = bestPaletteText(ctaBackground, values).color;
  const headerUsesDarkSurface = isDarkColor(headerBackground);
  const headerLogoPath = headerUsesDarkSurface
    ? values.logoLightPath || values.logoMainPath
    : values.logoMainPath || values.logoLightPath;

  const previewStyle = useMemo(
    () =>
      ({
        "--brand-primary": values.primary,
        "--brand-secondary": values.secondary,
        "--brand-accent": values.accent,
        "--brand-background": values.background,
        "--brand-text": values.text,
        "--header-bg": headerBackground,
        "--header-text": headerText,
        "--footer-bg": headerBackground,
        "--footer-text": headerText,
        "--cta-bg": ctaBackground,
        "--cta-text": ctaText,
        "--heading-font": values.headingFont,
        "--eyebrow-font": values.eyebrowFont,
        "--body-font": values.bodyFont,
        "--eyebrow-transform": values.eyebrowTransform,
        "--eyebrow-weight": values.eyebrowWeight,
        "--eyebrow-spacing":
          values.eyebrowSpacing === "wide" ? "0.16em" : "0.05em",
      }) as CSSProperties,
    [values, headerBackground, headerText, ctaBackground, ctaText]
  );

  function set<K extends keyof BrandValues>(key: K, value: BrandValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function mediaUrl(path: string) {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
  }

  return (
    <form action={updateBrandIdentity} className="brand-editor-form">
      <div className="brand-editor-toolbar">
        <div>
          <strong>Proteção de contraste ativa</strong>
          <span>Você personaliza a marca; o sistema protege a leitura.</span>
        </div>

        <button
          className="button button-secondary"
          type="submit"
          formAction={resetLastBrandIdentity}
          formNoValidate
          disabled={!canReset}
        >
          ↶ Resetar última alteração
        </button>
      </div>

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
                description="Usada preferencialmente em superfícies claras."
                uploadCategory="Marca"
                libraryCategories={["Marca"]}
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                displayMode="brand"
                uploadLabel="+ Enviar arquivo"
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
                description="Usada automaticamente quando cabeçalho e rodapé forem escuros."
                uploadCategory="Marca"
                libraryCategories={["Marca"]}
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                displayMode="brand"
                uploadLabel="+ Enviar arquivo"
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
                displayMode="brand"
                uploadLabel="+ Enviar arquivo"
                onSelectionChange={(paths) =>
                  set("faviconPath", paths[0] ?? "")
                }
              />
            </div>
          </div>

          <div className="brand-section">
            <span className="eyebrow">Paleta</span>
            <h2>Cores da marca</h2>
            <p className="section-note">
              A cor Fundo passa a ser o fundo geral de todo o site. As outras
              cores alimentam botões, cabeçalho, rodapé e detalhes.
            </p>

            <div className="color-grid">
              {[
                ["primary", "Principal"],
                ["secondary", "Secundária"],
                ["accent", "Destaque"],
                ["background", "Fundo geral"],
                ["text", "Texto"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="color"
                    name={key}
                    value={values[key as keyof BrandValues] as string}
                    onChange={(event) =>
                      set(
                        key as
                          | "primary"
                          | "secondary"
                          | "accent"
                          | "background"
                          | "text",
                        event.target.value.toUpperCase()
                      )
                    }
                  />
                  <code>{values[key as keyof BrandValues] as string}</code>
                </label>
              ))}
            </div>

            {contrastIssues.length ? (
              <div className="contrast-alert">
                <strong>Essa combinação ainda não pode ser salva.</strong>
                {contrastIssues.map((issue) => (
                  <span key={issue}>{issue}</span>
                ))}
              </div>
            ) : (
              <div className="contrast-ok">
                ✓ Paleta aprovada para leitura e conversão.
              </div>
            )}
          </div>

          <div className="brand-section">
            <span className="eyebrow">Aplicação</span>
            <h2>Duas escolhas para o site</h2>
            <p className="section-note">
              O restante acompanha automaticamente o Fundo geral e a hierarquia
              visual do layout.
            </p>

            <div className="surface-selector-stack">
              <SurfaceSelector
                title="Cabeçalho + Rodapé"
                description="Os dois usam a mesma cor para dar unidade ao site."
                name="headerSurfaceKey"
                value={values.headerSurfaceKey}
                values={values}
                onChange={(value) => set("headerSurfaceKey", value)}
              />

              <SurfaceSelector
                title="Botões + CTAs"
                description="Cor dos principais botões de ação e reserva."
                name="ctaSurfaceKey"
                value={values.ctaSurfaceKey}
                values={values}
                onChange={(value) => set("ctaSurfaceKey", value)}
              />
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
                    set(
                      "eyebrowTransform",
                      event.target.value as BrandValues["eyebrowTransform"]
                    )
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
                  onChange={(event) =>
                    set(
                      "eyebrowWeight",
                      event.target.value as BrandValues["eyebrowWeight"]
                    )
                  }
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
                  onChange={(event) =>
                    set(
                      "eyebrowSpacing",
                      event.target.value as BrandValues["eyebrowSpacing"]
                    )
                  }
                >
                  <option value="wide">Amplo</option>
                  <option value="normal">Normal</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={contrastIssues.length > 0}
            >
              Salvar identidade
            </button>
          </div>
        </section>

        <aside className="admin-panel brand-preview" style={previewStyle}>
          <span className="eyebrow">Pré-visualização</span>

          <div className="brand-mini-site">
            <div className="brand-mini-header">
              {headerLogoPath ? (
                <img src={mediaUrl(headerLogoPath)} alt={propertyName} />
              ) : (
                <strong>{propertyName}</strong>
              )}
              <span>Menu</span>
            </div>

            <div className="brand-mini-hero">
              <small>Hero / foto</small>
            </div>

            <div className="brand-mini-body">
              <span className="eyebrow">Acomodações</span>
              <h3>Seu canto entre o verde.</h3>
              <p>O fundo desta área representa o fundo geral do site.</p>
              <button className="brand-mini-cta" type="button">
                Consultar disponibilidade
              </button>
            </div>

            <div className="brand-mini-footer">
              <strong>{propertyName}</strong>
              <small>Rodapé</small>
            </div>
          </div>

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
        </aside>
      </div>
    </form>
  );
}
