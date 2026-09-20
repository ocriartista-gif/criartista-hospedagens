import type { Accommodation, Lead, Property, Review } from "@/types";

export const property: Property = {
  id: "villa-ipe",
  name: "Villa Ipê",
  slug: "villa-ipe",
  tagline: "Dias leves. Memórias que ficam.",
  description:
    "Um refúgio entre o verde, com conforto, atendimento próximo e reserva direta.",
  phone: "(19) 99999-9999",
  whatsapp: "5519999999999",
  email: "reservas@villaipe.demo",
  address: "Interior de São Paulo",
  theme: {
    primary: "#183B2A",
    secondary: "#8CA67C",
    accent: "#C97863",
    background: "#F6F2EA",
    text: "#302C2F",
    headingFont: "Georgia",
    eyebrowFont: "Arial",
    bodyFont: "Arial",
    eyebrowTransform: "uppercase",
    eyebrowWeight: "600",
    eyebrowSpacing: "wide",
    headerSurfaceKey: "background",
    postHeroSurfaceKey: "background"
  }
};

export const accommodations: Accommodation[] = [
  {
    id: "chale-jardim",
    propertyId: property.id,
    name: "Chalé Jardim",
    slug: "chale-jardim",
    shortDescription: "Varanda privativa e silêncio para até 4 hóspedes.",
    description:
      "Um chalé cercado de verde, com varanda privativa e espaço para desacelerar com conforto.",
    capacity: 4,
    adults: 2,
    children: 2,
    sizeM2: 35,
    beds: "1 cama queen + 2 camas de solteiro",
    amenities: ["Wi-Fi", "Ar-condicionado", "Frigobar", "Varanda", "Smart TV"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=80"
    ],
    published: true,
    order: 1
  },
  {
    id: "suite-ipe",
    propertyId: property.id,
    name: "Suíte Ipê",
    slug: "suite-ipe",
    shortDescription: "Conforto essencial para duas pessoas.",
    description: "Uma suíte acolhedora para casais que valorizam conforto e tranquilidade.",
    capacity: 2,
    adults: 2,
    children: 0,
    sizeM2: 28,
    beds: "1 cama queen",
    amenities: ["Wi-Fi", "Ar-condicionado", "Frigobar", "Smart TV"],
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=80"
    ],
    published: true,
    order: 2
  },
  {
    id: "chale-familia",
    propertyId: property.id,
    name: "Chalé Família",
    slug: "chale-familia",
    shortDescription: "Mais espaço para viver bons dias juntos.",
    description: "Acomodação ampla para famílias, com ambientes confortáveis e integração com a natureza.",
    capacity: 6,
    adults: 4,
    children: 2,
    sizeM2: 48,
    beds: "1 queen + 4 solteiros",
    amenities: ["Wi-Fi", "Ar-condicionado", "Frigobar", "Varanda", "Smart TV"],
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=80"
    ],
    published: true,
    order: 3
  }
];

export const reviews: Review[] = [
  {
    id: "review-1",
    propertyId: property.id,
    guestName: "Mariana S.",
    rating: 5,
    text: "A sensação é de estar longe da correria sem abrir mão do conforto. O atendimento fez toda a diferença.",
    source: "Google",
    date: "2026-08-14",
    featured: true,
    published: true
  },
  {
    id: "review-2",
    propertyId: property.id,
    guestName: "Carlos H.",
    rating: 5,
    text: "Quarto muito confortável, café excelente e equipe muito atenciosa.",
    source: "Booking",
    date: "2026-07-29",
    featured: false,
    published: true
  }
];

export const leads: Lead[] = [
  {
    id: "lead-1",
    propertyId: property.id,
    name: "Mariana Souza",
    whatsapp: "5519999991111",
    email: "mariana@example.com",
    checkIn: "2026-10-22",
    checkOut: "2026-10-25",
    nights: 3,
    adults: 2,
    children: 1,
    accommodationId: "chale-jardim",
    source: "Instagram",
    campaign: "feriado_outubro",
    medium: "paid_social",
    status: "novo",
    createdAt: "2026-09-19T12:00:00-03:00"
  },
  {
    id: "lead-2",
    propertyId: property.id,
    name: "Carlos Lima",
    whatsapp: "5519999992222",
    checkIn: "2026-11-02",
    checkOut: "2026-11-05",
    nights: 3,
    adults: 2,
    children: 0,
    accommodationId: "suite-ipe",
    source: "Google",
    status: "contatado",
    assignedTo: "Juliana",
    createdAt: "2026-09-18T16:20:00-03:00"
  }
];
