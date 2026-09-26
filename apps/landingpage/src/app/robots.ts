import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Search engines and AI crawlers are all allowed. Profiles are public by
 * design and discovery is the goal. To block AI training crawlers, add one
 * rule per user agent (GPTBot, ClaudeBot, Google-Extended, CCBot,
 * meta-externalagent) with `disallow: "/"`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/auth/",
          "/login",
          "/register",
          "/sign",
          "/i/ndau-conversion/receipt/",
          "/i/pools/*/debug",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap-index.xml`,
  };
}
