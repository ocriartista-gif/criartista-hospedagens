import type { CSSProperties } from "react";
import type { PaletteKey, PropertyTheme } from "@/types";

type ThemePalette = Pick<
  PropertyTheme,
  "primary" | "secondary" | "accent" | "background" | "text"
>;

type ContrastTheme = ThemePalette &
  Pick<PropertyTheme, "headerSurfaceKey" | "ctaSurfaceKey">;

export const PALETTE_KEYS: PaletteKey[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "text",
];

export const PALETTE_LABELS: Record<PaletteKey, string> = {
  primary: "Principal",
  secondary: "Secundária",
  accent: "Destaque",
  background: "Fundo",
  text: "Texto",
};

export function resolvePaletteColor(
  theme: ThemePalette,
  key: PaletteKey
): string {
  return theme[key];
}

function rgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string) {
  const { r, g, b } = rgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string) {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b));
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

export function isDarkColor(color: string) {
  return relativeLuminance(color) < 0.36;
}

export function bestPaletteText(background: string, theme: ThemePalette) {
  const candidates = [
    { key: "text" as const, color: theme.text },
    { key: "background" as const, color: theme.background },
  ];

  return candidates
    .map((candidate) => ({
      ...candidate,
      ratio: contrastRatio(background, candidate.color),
    }))
    .sort((a, b) => b.ratio - a.ratio)[0];
}

export function getThemeContrastIssues(theme: ContrastTheme) {
  const issues: string[] = [];

  if (contrastRatio(theme.background, theme.text) < 4.5) {
    issues.push(
      "Fundo e Texto precisam ter contraste mínimo de 4,5:1 para leitura."
    );
  }

  const headerBackground = resolvePaletteColor(theme, theme.headerSurfaceKey);
  const headerText = bestPaletteText(headerBackground, theme);
  if (headerText.ratio < 4.5) {
    issues.push(
      "Cabeçalho e rodapé não possuem uma cor de texto segura dentro da paleta."
    );
  }

  const ctaBackground = resolvePaletteColor(theme, theme.ctaSurfaceKey);
  const ctaText = bestPaletteText(ctaBackground, theme);
  if (ctaText.ratio < 4.5) {
    issues.push(
      "Botões e CTAs não possuem uma cor de texto segura dentro da paleta."
    );
  }

  if (contrastRatio(ctaBackground, theme.background) < 2) {
    issues.push(
      "A cor dos botões precisa se diferenciar mais do fundo geral do site."
    );
  }

  return issues;
}

export function themeStyle(theme: PropertyTheme): CSSProperties {
  const headerBackground = resolvePaletteColor(theme, theme.headerSurfaceKey);
  const headerText = bestPaletteText(headerBackground, theme).color;
  const ctaBackground = resolvePaletteColor(theme, theme.ctaSurfaceKey);
  const ctaText = bestPaletteText(ctaBackground, theme).color;
  const onPrimary = bestPaletteText(theme.primary, theme).color;

  return {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-text": theme.text,
    "--brand-on-primary": onPrimary,
    "--header-bg": headerBackground,
    "--header-text": headerText,
    "--footer-bg": headerBackground,
    "--footer-text": headerText,
    "--cta-bg": ctaBackground,
    "--cta-text": ctaText,
    "--heading-font": theme.headingFont,
    "--eyebrow-font": theme.eyebrowFont,
    "--body-font": theme.bodyFont,
    "--eyebrow-transform": theme.eyebrowTransform,
    "--eyebrow-weight": theme.eyebrowWeight,
    "--eyebrow-spacing":
      theme.eyebrowSpacing === "wide" ? "0.16em" : "0.05em",
  } as CSSProperties;
}
