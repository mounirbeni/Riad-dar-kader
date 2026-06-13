import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";
import { locales } from "@/i18n/config";
import { navPaths } from "@/i18n/nav";

export default function sitemap(): MetadataRoute.Sitemap {
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
  return entries;
}
