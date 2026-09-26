import type { MetadataRoute } from "next";
import { fetchProfileSitemapCount, fetchProfileSitemapEntries } from "@/lib/getSitemapData";
import { PROFILE_SITEMAP_PAGE_SIZE, canonicalProfileUrl } from "@/lib/seo";

export const revalidate = 3600;

/** One sitemap file per 10,000 indexable profiles. Always at least one file. */
export async function generateSitemaps() {
  const total = await fetchProfileSitemapCount();
  const files = Math.max(1, Math.ceil(total / PROFILE_SITEMAP_PAGE_SIZE));
  return Array.from({ length: files }, (_, id) => ({ id }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const page = Number.parseInt(await props.id, 10);
  if (!Number.isInteger(page) || page < 0) return [];

  const entries = await fetchProfileSitemapEntries(page);
  return entries.map(entry => ({
    url: canonicalProfileUrl(entry.handle),
    lastModified: new Date(entry.lastModified),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}
