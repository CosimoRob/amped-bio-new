import { trpcClient } from "./trpc";
import { PROFILE_SITEMAP_PAGE_SIZE } from "./seo";

/** Number of indexable profiles. Returns 0 when the API is unreachable. */
export async function fetchProfileSitemapCount(): Promise<number> {
  try {
    const { total } = await trpcClient.handle.getSitemapCount.query();
    return total;
  } catch (error) {
    console.error("[sitemap] Failed to load profile count:", error);
    return 0;
  }
}

/** One page of indexable profiles. Returns [] when the API is unreachable. */
export async function fetchProfileSitemapEntries(
  page: number
): Promise<Array<{ handle: string; lastModified: string }>> {
  try {
    return await trpcClient.handle.getSitemapEntries.query({
      page,
      pageSize: PROFILE_SITEMAP_PAGE_SIZE,
    });
  } catch (error) {
    console.error(`[sitemap] Failed to load profile page ${page}:`, error);
    return [];
  }
}
