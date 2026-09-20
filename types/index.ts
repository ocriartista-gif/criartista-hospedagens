export type PaletteKey =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "text";

export type BookingMode = "criartista" | "external_link" | "widget" | "embed" | "popup";

export type LeadStatus =
  | "novo"
  | "contatado"
  | "cotacao_enviada"
  | "follow_up"
  | "reservado"
  | "perdido";

export type PropertyTheme = {
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
  postHeroSurfaceKey: PaletteKey;
  logoMainUrl?: string;
  logoLightUrl?: string;
  faviconUrl?: string;
};

export type Property = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  theme: PropertyTheme;
};

export type Accommodation = {
  id: string;
  propertyId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  capacity: number;
  adults: number;
  children: number;
  sizeM2: number;
  beds: string;
  amenities: string[];
  images: string[];
  published: boolean;
  order: number;
};

export type Review = {
  id: string;
  propertyId: string;
  guestName: string;
  rating: number;
  text: string;
  source: string;
  sourceUrl?: string;
  date: string;
  featured: boolean;
  published: boolean;
};

export type Lead = {
  id: string;
  propertyId: string;
  name: string;
  whatsapp: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  accommodationId?: string;
  source: string;
  campaign?: string;
  medium?: string;
  status: LeadStatus;
  assignedTo?: string;
  quotedValue?: number;
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
};
