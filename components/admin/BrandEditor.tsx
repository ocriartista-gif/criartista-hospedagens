"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { updateBrandIdentity } from "@/app/admin/(protected)/identidade/actions";

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
  logoMainUrl: string;
  logoLightUrl: string;
  faviconUrl: string;
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
  initial,
}: {
  propertyName: string;
  initial: BrandValues;
}) {
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
        "--eyebrow-spacing": values.eyebrowSpacing === "wide" ? "0.16em" : "0.05em",
      }) as CSSProperties,
    [values]
  );

  function set(key: keyof BrandValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form action={updateBrandIdentity}>
      <div className="settings-columns">
        <section className="admin-panel brand-editor-panel">
          <div className="brand-section">
            <span className="eyebrow">Arquivos da marca</span>
            <h2>Logotipos</h2>
            <p className="section-note">
              Nesta V1 usamos URLs de arquivos. O upload direto entra junto da
              biblioteca de mídia na próxima etapa.
            </p>

            <div className="field-grid">
              <label className="field-full">
                Logo principal
                <input
                  type="url"
                  name="logoMainUrl"
                  value={values.logoMainUrl}
                  onChange={(event) => set("logoMainUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="field-full">
                Logo clara
                <input
                  type="url"
                  name="logoLightUrl"
                  value={values.logoLightUrl}
                  onChange={(event) => set("logoLightUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="field-full">
                Favicon
                <input
                  type="url"
                  name="faviconUrl"
                  value={values.faviconUrl}
                  onChange={(event) => set("faviconUrl", event.target.value)}
                  placeholder="https://..."
                />
              </label>
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
                      set(key as keyof BrandValues, event.target.value.toUpperCase())
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
                  onChange={(event) => set("eyebrowTransform", event.target.value)}
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
          <div className="brand-preview-logo">
            {values.logoMainUrl ? (
              <img src={values.logoMainUrl} alt={propertyName} />
            ) : (
              <strong>{propertyName}</strong>
            )}
          </div>

          <span className="eyebrow">Acomodação</span>
          <h2>Chalé Jardim</h2>
          <p>Natureza e privacidade para momentos tranquilos.</p>
          <button className="button button-primary" type="button">
            Ver disponibilidade
          </button>

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
