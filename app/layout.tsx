import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/data/public";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { property } = await getPublicSiteData();

    return {
      title: `${property.name} | Criartista Hospedagens`,
      description: property.description || property.tagline,
      icons: property.theme.faviconUrl
        ? { icon: property.theme.faviconUrl }
        : undefined,
    };
  } catch {
    return {
      title: "Criartista Hospedagens",
      description: "Site de hospedagem e reserva direta.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&family=Inter:wght@400;500;600&family=Lora:wght@400;500;600&family=Manrope:wght@400;500;600&family=Montserrat:wght@400;500;600&family=Playfair+Display:wght@400;500;600&family=Sora:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
