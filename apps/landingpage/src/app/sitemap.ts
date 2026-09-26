import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";
import { fetchPoolsPageData } from "@/lib/getPoolsData";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const BLOG_POST_LIMIT = 100;

/** Static pages, blog posts and public pools. Profiles live in their own sitemaps. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/i/pools`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/i/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/i/network`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const [posts, pools] = await Promise.all([
    getBlogPosts(BLOG_POST_LIMIT).catch(() => []),
    fetchPoolsPageData(),
  ]);

  const postEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${SITE_URL}/i/blog/${post.slug}`,
    lastModified: new Date(post.modified || post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const poolEntries: MetadataRoute.Sitemap = (pools ?? []).map(pool => ({
    url: `${SITE_URL}/i/pools/${pool.address}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...poolEntries];
}
