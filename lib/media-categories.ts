export const MEDIA_CATEGORIES = [
  "Geral",
  "Hero",
  "Acomodações",
  "Experiências",
  "Marca",
  "Favicon",
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

function key(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeMediaCategory(
  value: string | null | undefined
): MediaCategory {
  switch (key(value ?? "")) {
    case "hero":
      return "Hero";
    case "acomodacoes":
    case "acomodacao":
      return "Acomodações";
    case "experiencias":
    case "experiencia":
      return "Experiências";
    case "marca":
      return "Marca";
    case "favicon":
      return "Favicon";
    default:
      return "Geral";
  }
}
