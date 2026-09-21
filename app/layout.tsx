import type { Metadata } from "next";
import { getPublicSiteData } from "@/lib/data/public";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://criartista-hospedagens.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { property, content } = await getPublicSiteData();
    const heroImage = content.hero?.image;

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: `${property.name} | Hospedagem`,
        template: `%s | ${property.name}`,
      },
      description: property.description || property.tagline,
      alternates: {
        canonical: "/",
      },
      openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "/",
        siteName: property.name,
        title: property.name,
        description: property.description || property.tagline,
        images: heroImage ? [{ url: heroImage }] : undefined,
      },
      icons: property.theme.faviconUrl
        ? { icon: property.theme.faviconUrl }
        : undefined,
    };
  } catch {
    return {
      metadataBase: new URL(siteUrl),
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
