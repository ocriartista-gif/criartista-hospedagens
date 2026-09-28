import type { MetadataRoute } from "next";
import {
  getPublicAccommodations,
  getPublicSiteData,
} from "@/lib/data/public";
import { isPlatformHost, requestHost } from "@/lib/property-host";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await requestHost();
  const siteUrl = `https://${host}`;
  if (isPlatformHost(host)) return [{ url: siteUrl, lastModified: new Date() }];
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
