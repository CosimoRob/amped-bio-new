import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const revalidate = 86400;

const REVIEWED_ON = "2026-09-26";

/** llms.txt index for AI agents. See https://llmstxt.org */
export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_NAME} is a link-in-bio platform. Each creator has one public profile page with their links, media, and an optional creator pool on Revolution Network.

Every public profile lives at ${SITE_URL}/@{handle}. Profile pages are server-rendered HTML and include schema.org ProfilePage data with the creator's name, bio, photo and social accounts.

Creator pools let fans stake REVO with a creator. Each pool has a public page with its creator, description and staking totals.

## Key pages

- [Home](${SITE_URL}/): What ${SITE_NAME} is and how to create a profile.
- [Creator pools](${SITE_URL}/i/pools): Browse and search every public creator pool.
- [Blog](${SITE_URL}/i/blog): Product news and guides.
- [Network](${SITE_URL}/i/network): Network statistics for Revolution Network.

## Discovery

- [Sitemap index](${SITE_URL}/sitemap-index.xml): Every indexable profile, pool and blog post.

Last reviewed: ${REVIEWED_ON}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
