import { HANDLE_BASE_URL, type PlatformId } from "@repo/constants";
import { stripHtml } from "./blog";
import type { ProfilePageData } from "./profilePageData";

/** Public origin of the site, without a trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? HANDLE_BASE_URL).replace(/\/+$/, "");

export const SITE_NAME = "Amped.Bio";
export const SITE_TAGLINE = "Your digital identity, amplified.";

/** Official accounts used in Organization structured data. */
export const ORGANIZATION_SAME_AS = [
  "https://x.com/amped_bio",
  "https://github.com/amplifydigital-web3",
];

/** Maximum length of a meta description, in characters. */
export const META_DESCRIPTION_MAX = 160;

/** Number of profiles per profile sitemap file. Must not exceed the server page size. */
export const PROFILE_SITEMAP_PAGE_SIZE = 10000;

/** Revalidation window for sitemaps and share images, in seconds. */
export const SEO_REVALIDATE_SECONDS = 3600;

/** Link platforms that identify the same person elsewhere (schema.org sameAs). */
const SAME_AS_PLATFORMS: ReadonlySet<PlatformId> = new Set<PlatformId>([
  "twitter",
  "telegram",
  "discord",
  "instagram",
  "lens",
  "facebook",
  "tiktok",
  "github",
  "linkedin",
  "medium",
  "mirror",
  "warpcast",
  "zora",
  "youtube",
  "patreon",
]);

/** Canonical public URL for a profile, e.g. https://amped.bio/@gustavo */
export function canonicalProfileUrl(handle: string): string {
  return `${SITE_URL}/@${handle.toLowerCase()}`;
}

/** Cut text at a word boundary so it fits in `max` characters. */
export function truncateText(text: string, max: number = META_DESCRIPTION_MAX): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function profileTitle(name: string, handle: string): string {
  return name.trim() ? `${name.trim()} (@${handle}) | ${SITE_NAME}` : `@${handle} | ${SITE_NAME}`;
}

export function profileDescription(name: string, handle: string, bio: string): string {
  const text = truncateText(bio);
  if (text) return text;
  const who = name.trim() || `@${handle}`;
  return `${who} on ${SITE_NAME}. Links, creator pool and more.`;
}

/** Social profile URLs taken from the profile's link blocks. */
export function profileSameAs(data: ProfilePageData): string[] {
  const urls = new Set<string>();
  for (const block of data.blocks) {
    if (block.type !== "link") continue;
    const { platform, url } = block.config;
    if (!SAME_AS_PLATFORMS.has(platform)) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") urls.add(parsed.toString());
    } catch {
      // Ignore malformed URLs
    }
  }
  return [...urls];
}

/** schema.org ProfilePage for a public profile. Never includes email. */
export function buildProfileJsonLd(data: ProfilePageData, handle: string) {
  const url = canonicalProfileUrl(handle);
  const { name, bio, photoUrl } = data.profile;
  const description = truncateText(bio, 500);
  const sameAs = profileSameAs(data);

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    mainEntity: {
      "@type": "Person",
      name: name.trim() || `@${handle}`,
      alternateName: `@${handle}`,
      url,
      ...(description ? { description } : {}),
      ...(photoUrl ? { image: photoUrl } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
  };
}

/** schema.org WebSite and Organization for the home page. */
export function buildSiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_TAGLINE,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      sameAs: ORGANIZATION_SAME_AS,
    },
  ];
}

/**
 * Serialize structured data for a script tag. Escapes "<" so user text
 * cannot close the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
