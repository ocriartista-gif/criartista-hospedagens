import type { MetadataRoute } from "next";
import { requestHost } from "@/lib/property-host";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = `https://${await requestHost()}`;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
