import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";
import { locales } from "@/i18n/config";
import { navPaths } from "@/i18n/nav";
import { prisma } from "@/lib/prisma";

// Built on demand so room detail URLs reflect the live database.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const seg of Object.values(navPaths)) {
      const url = seg ? `${base}/${locale}/${seg}` : `${base}/${locale}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: seg === "" ? "weekly" : "monthly",
        priority: seg === "" ? 1 : 0.7,
      });
    }
  }

  // Per-room detail pages — tolerate a missing database (e.g. at build time).
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { sortOrder: "asc" },
    });
    for (const locale of locales) {
      for (const room of rooms) {
        entries.push({
          url: `${base}/${locale}/${navPaths.rooms}/${room.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // Database unavailable — return the static entries only.
  }

  return entries;
}
