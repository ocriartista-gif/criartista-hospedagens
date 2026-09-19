import type { CSSProperties } from "react";
import type { PropertyTheme } from "@/types";

export function themeStyle(theme: PropertyTheme): CSSProperties {
  return {
    "--brand-primary": theme.primary,
    "--brand-secondary": theme.secondary,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background,
    "--brand-text": theme.text,
    "--heading-font": theme.headingFont,
    "--eyebrow-font": theme.eyebrowFont,
    "--body-font": theme.bodyFont,
    "--eyebrow-transform": theme.eyebrowTransform,
    "--eyebrow-weight": theme.eyebrowWeight,
    "--eyebrow-spacing": theme.eyebrowSpacing === "wide" ? "0.16em" : "0.05em"
  } as CSSProperties;
}
