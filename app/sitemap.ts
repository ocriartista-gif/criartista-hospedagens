import type { MetadataRoute } from "next";
import {
  getPublicAccommodations,
  getPublicSiteData,
} from "@/lib/data/public";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://criartista-hospedagens.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { property } = await getPublicSiteData();
  const accommodations = await getPublicAccommodations(property.id);

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/acomodacoes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...accommodations.map((room) => ({
      url: `${siteUrl}/acomodacoes/${room.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
