# SEO and LLM Discoverability

Status: spec for review. Build Board item #10.
Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Business overview: [docs/overviews/seo-llm-discoverability.md](../overviews/seo-llm-discoverability.md)

## 1. Research

### How public bios are served today

- Public bios are server-rendered by the Next.js app in `apps/landingpage` at `src/app/[handle]/page.tsx` (`force-dynamic`). Crawlers receive full HTML. This is the right foundation.
- `/@handle` is rewritten to `/handle` by `src/proxy.ts`. Both URLs return the same page. No canonical tag tells search engines which one is primary.
- The page has no `generateMetadata`. Every bio inherits the root layout meta: title "Amped.Bio", description "Your digital identity, amplified.", and the generic `/og` image. To a search engine, every bio looks like the same page.
- An unknown handle calls `redirect("/")`, which returns HTTP 307. Search engines treat this as a soft 404.
- `apps/landingpage/public` holds only `logo.svg`. There is no `robots.txt`, no sitemap and no `llms.txt`.
- There is no structured data (JSON-LD) on any page.
- The pool detail page `/i/pools/[address]` is a client component with no metadata. The pools list and blog already have metadata.
- `handle.getHandle` has everything a bio needs for metadata: name, description, image, blocks, theme.

### How search and AI systems read pages in 2026

- Google, Bing and the AI assistants rank and cite from the HTML they fetch. Title, description, canonical, Open Graph and JSON-LD are what they read.
- AI crawlers fall into three groups:
  - **Training:** GPTBot, ClaudeBot, Google-Extended (a token, not a separate crawler), Applebot-Extended, meta-externalagent, CCBot.
  - **Search and retrieval:** OAI-SearchBot, Claude-SearchBot, PerplexityBot.
  - **User-triggered fetches:** ChatGPT-User, Claude-User, Perplexity-User.

  Blocking the search group removes Amped bios from AI answers.
- `llms.txt` is a proposed Markdown index for AI agents. About 10% of domains publish one. Measured fetches by major crawlers are very low, and Google does not support it. It costs little to publish, so we ship it as a hedge, not as the primary lever.
- Sitemaps are capped at 50,000 URLs per file. Next.js 16 `generateSitemaps` splits a sitemap into `/.../sitemap/[id].xml` files, passes `id` as a Promise, and does not generate an index file.

### Findings outside this item

1. **Email exposure.** `handle.getHandle` is a public endpoint and returns `user.email`. The bio page also passes that email to the browser inside the page data, so it appears in the HTML source of every bio. Any visitor or crawler can read a creator's email. This is a privacy exposure (D1). It is fixed as a separate change. Sitemaps invite crawlers to every bio, so the D1 fix is a deploy gate for this feature (section 3.12). This spec does not put email into any metadata or structured data.
2. **Suspended users.** `User.block` appears to mark suspended users. `getHandle` does not check it, so suspended bios still render. This spec excludes them from the sitemap and marks them `noindex`, but does not change what they render.

## 2. Overview

Make every public Amped bio a distinct, indexable page that search engines and AI assistants can find, understand and cite.

**Outcome for a creator.** Searching their name plus "Amped bio" returns their bio with their own title, description and share image. Asking an AI assistant about them can cite their bio.

**Outcome for Amped.** Every quality bio is listed in a sitemap within an hour of being created or edited. Thin, empty or suspended bios stay out of the index so they do not dilute the domain.

### In scope

1. Per-bio title, description, canonical URL, Open Graph and X card.
2. Per-bio share image generated from the creator's name, handle and photo.
3. `ProfilePage` and `Person` JSON-LD on every bio. `WebSite` and `Organization` JSON-LD on the home page.
4. HTTP 404 for unknown handles, with a page that offers to claim the handle.
5. `robots.txt` that allows search engines and AI crawlers and blocks private routes.
6. Sitemaps for static pages, blog posts, pools and bios, split into chunks with an index file.
7. `llms.txt` at the site root.
8. Metadata for pool detail pages.

### Out of scope

- The email exposure fix (finding 1). Tracked separately. It is a deploy gate for this feature.
- Google Analytics events. That is Build Board item #11. KPIs use Search Console, Bing Webmaster Tools and the GA4 page views already on the site (section 3.13).
- Per-bio Markdown endpoints for agents. We can revisit this if `llms.txt` shows real traffic.
- Keyword or content strategy.

### Decisions for Rob

1. **AI crawler policy.** Recommended: allow all AI crawlers, including training bots. Discovery is the goal, and bios are public by design. The alternative is to block training bots (GPTBot, ClaudeBot, Google-Extended, CCBot, meta-externalagent) and allow only search bots. The build ships "allow all" and changes with one line. "Allow all" requires the AI training disclosure in the privacy policy before launch (section 3.10).
2. **Indexing threshold.** Recommended: index a bio only when it has a handle, is not suspended, has a verified email, and has either a description or at least one block. Everything else gets `noindex` and is left out of the sitemap.

## 3. Detailed spec

### 3.1 Canonical URL

- The canonical bio URL is `https://amped.bio/@{handle}`. This matches `getHandlePublicUrl` and `HANDLE_BASE_URL` in `@repo/constants`.
- Both `/@handle` and `/handle` emit `<link rel="canonical" href="https://amped.bio/@{handle}">`.

### 3.2 Bio metadata (`src/app/[handle]/page.tsx`)

- Add `generateMetadata`. Wrap `fetchProfilePageData` in React `cache()` so metadata and page share one API call per request.
- **Title:** `{name} (@{handle}) | Amped.Bio`. If the name is empty, use `@{handle} | Amped.Bio`.
- **Description:** the bio text, with HTML stripped and whitespace collapsed, cut at 160 characters on a word boundary. If the bio is empty: `{name} on Amped.Bio. Links, creator pool and more.`
- **Open Graph:** type `profile`, `url` set to the canonical URL, `username` set to the handle, and the image from 3.3.
- **X card:** `summary_large_image`.
- **Robots:** `index, follow` when the bio meets the indexing threshold (decision 2). Otherwise `noindex, follow`.
- **Unknown handle:** call `notFound()`, which returns HTTP 404. The `landingpage` default handle keeps its current behaviour.

### 3.3 Bio share image (`src/app/[handle]/opengraph-image.tsx`)

- Use the Next.js `opengraph-image` file convention. The route loads the bio through `fetchProfilePageData`. No user-supplied query parameters are accepted, so the endpoint cannot be used to render arbitrary content.
- The image is 1200 x 630 and uses the existing `/og` visual style: gradient ground and Amped.Bio mark.
- It shows the creator photo (circle, 220 px) when present, the name (or `@handle` when the name is empty), `@handle`, and the bio cut at 110 characters on a word boundary.
- The photo is used only when it is served over HTTPS as PNG or JPEG, is under 2 MB and loads within 3 seconds. Otherwise the image falls back to the first letter of the displayed name.
- The image is cached by Next.js with a 1 hour revalidation.

### 3.4 Structured data

On the bio page, one `<script type="application/ld+json">`:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "url": "https://amped.bio/@handle",
  "mainEntity": {
    "@type": "Person",
    "name": "Name",
    "alternateName": "@handle",
    "description": "Bio text",
    "image": "https://.../avatar.png",
    "url": "https://amped.bio/@handle",
    "sameAs": ["https://x.com/...", "https://instagram.com/..."]
  }
}
```

- `sameAs` lists the http or https URLs of `link` blocks whose platform is a social network: twitter, instagram, tiktok, linkedin, youtube, facebook, github, telegram, discord, medium, mirror, warpcast, zora, lens or patreon. `email`, `document` and `custom` links are excluded. Media blocks are not read.
- `description` is the bio cut at 500 characters. `name` falls back to `@handle` when empty. Empty `description`, `image` and `sameAs` are omitted.
- Email is never included.
- JSON is serialized with `<` escaped, to prevent script injection from user text.

On the home page:

- `WebSite` with `name`, `url` and `description`. `potentialAction` is omitted, since there is no site search.
- `Organization` with name, url, logo, and `sameAs` pointing to the official X and GitHub accounts.

### 3.5 Server: sitemap data (`apps/server/src/trpc/handle.ts`)

Add two public procedures. They return public data only.

- `getSitemapCount()` returns `{ total }`. This is the number of users that meet the indexing threshold.
- `getSitemapEntries({ page, pageSize })` returns `[{ handle, lastModified }]`.
  - Ordered by `id` ascending, so pages are stable.
  - `pageSize` is at most 10,000.
  - `lastModified` is the latest of the user's `created_at` and `updated_at` and the newest block `created_at` or `updated_at` for that user.
  - `handle` is returned lowercased.

The threshold filter is:

```
handle IS NOT NULL
AND block = "no"
AND email_verified = true
AND (description is not empty OR at least one block exists)
```

This filter lives in `apps/server/src/utils/indexable.ts` as `indexableUserWhere` (Prisma filter) and `isUserIndexable` (in-memory check), so the sitemap and the page `robots` decision cannot drift apart. The page gets the flag from a new `indexable` boolean on the `getHandle` output. The brand portal spec reuses the same function.

### 3.6 Sitemaps

| Path | Source | Contents |
|---|---|---|
| `/sitemap.xml` | `src/app/sitemap.ts` | `/`, `/i/pools`, `/i/blog`, `/i/network`, blog posts (latest 100), public pool detail pages |
| `/i/sitemaps/profiles/sitemap/{n}.xml` | `src/app/i/sitemaps/profiles/sitemap.ts` | Indexable bios, 10,000 per file, canonical `@` URLs |
| `/sitemap-index.xml` | `src/app/sitemap-index.xml/route.ts` | Index listing the two sources above |

- Profile sitemaps sit under `/i/` because `/i` is already reserved. A top-level folder would block a user from claiming that handle.
- All three revalidate every hour.
- If the API is unreachable, the sitemap files return what they have.
- Bio pages return 404 only when the API says the handle does not exist. If the API is unreachable, the page returns a server error, which crawlers retry, instead of a 404, which would drop the bio from the index. The index still lists at least `/sitemap.xml`, and the build does not fail.

### 3.7 robots.txt (`src/app/robots.ts`)

```
User-agent: *
Allow: /
Disallow: /auth/
Disallow: /login
Disallow: /register
Disallow: /sign
Disallow: /i/ndau-conversion/receipt/
Disallow: /i/pools/*/debug
Sitemap: https://amped.bio/sitemap-index.xml
```

- The `/i/pools/*/debug` rule also covers `debug-apy`.
- Decision 1 is applied here. Blocking training bots means adding one `User-agent` group per bot with `Disallow: /`.

### 3.8 llms.txt (`src/app/llms.txt/route.ts`)

- Served as `text/plain; charset=utf-8` and revalidated daily.
- Content:
  - H1 `Amped.Bio`
  - A one-line blockquote summary
  - Short prose on what an Amped bio is, the `/@handle` URL pattern, and what a creator pool page shows
  - H2 sections with absolute links: Key pages (home, creator pools, blog, network) and Discovery (sitemap index)
  - A review date, set in `REVIEWED_ON`
- The file is static. It lists no individual bios and no gated content.

### 3.9 Pool detail metadata (`src/app/i/pools/[address]/page.tsx`)

- Split the page. `page.tsx` becomes a server component that exports `generateMetadata` and renders a new client component, `PoolDetailPageClient`, which holds the current code.
- **Title:** `{pool name} creator pool | Amped.Bio`.
- **Description:** the pool description cut at 160 characters, or `Stake REVO in {pool name} on Amped.Bio.`
- **Image:** the pool image when present, otherwise `/og?title={pool name}`.
- **Canonical:** `/i/pools/{address}`.
- Unknown pools get `noindex`. Hidden pools are already excluded from the sitemap because `getPools` filters them out.

### 3.10 Security and compliance

- No endpoint returns email or private fields. The new procedures return handle and date only.
- JSON-LD escapes user text.
- The share-image route takes no user parameters.
- "Stake REVO" wording on pool pages stays descriptive. It contains no yield or return claims.
- `robots.txt` blocks the pool debug and APY diagnostic pages (`/i/pools/*/debug` matches `debug-apy`).
- Suspended bios render `noindex` and are left out of sitemaps. Deleted bios return 404 and drop out of sitemaps at the next hourly revalidation.

**Pre-launch requirements and deploy gates**

- **D1 email fix (deploy gate).** The creator email sits in the page data of every bio today. PR #1 does not deploy until the D1 fix is deployed, or ships in the same deploy. Verify on a sample bio that the HTML contains no creator email.
- **AI training disclosure (pre-launch).** Decision 1 allows training crawlers, so public bios may be used to train AI models. The privacy policy at `https://ampedbio.com/privacy-policy/` must state this before launch. The policy is hosted outside this repo.
- **Securities.** REVO staking is under securities counsel review. No title, description, share image, llms.txt line or blog post promises returns, yield, earnings or price.

**Copy rules (product and marketing)**

One list applies to Amped-authored metadata templates, share images, llms.txt, the 404 page, blog posts and launch copy.

- **Banned words:** yield, APY, APR, returns, earn, profit, invest, investment, price, gains.
- **Approved alternatives:** creator pool, members, join, support, community, "find me on Amped". Pool pages use descriptive wording such as "Stake REVO in {pool name}".
- **No ranking promises.** Say "helps search engines and AI assistants find your bio". Never promise first-page results, rankings or AI citations.
- **Required disclosure:** the AI training statement in the privacy policy (above).

The built Amped-authored strings contain no banned word. Known gap: pool descriptions and bios are written by creators and pass into metadata as written. The build does not filter them for banned words.

**Gated items**

- The code has no members-only links or content today. When the access gating engine ships, gated blocks must stay out of `sameAs`, share images, sitemaps and llms.txt.

### 3.11 Acceptance criteria

1. `curl -s https://amped.bio/@{handle}` returns a `<title>` containing the creator name, a canonical link to the `@` URL, `og:image` pointing at the bio's share image, and valid `ProfilePage` JSON-LD.
2. `curl -I https://amped.bio/doesnotexist123` returns 404.
3. `/robots.txt`, `/sitemap-index.xml`, `/sitemap.xml`, `/i/sitemaps/profiles/sitemap/0.xml` and `/llms.txt` all return 200 with the correct content type.
4. A bio that fails the threshold renders `noindex` and does not appear in any sitemap.
5. Google Rich Results Test passes on 10 sample bios (100%), including one with no photo and one with no bio text.
6. `pnpm run typecheck` passes for server and landingpage, and `pnpm run build` passes for landingpage.
7. `/robots.txt` disallows `/i/pools/*/debug`, and Search Console URL Inspection shows a pool `debug-apy` URL as blocked by robots.txt.
8. An unknown pool address renders `noindex`.
9. No metadata, JSON-LD, share image, sitemap or llms.txt output contains a creator email. After the D1 fix, the full HTML of a sample bio contains no creator email.
10. Amped-authored strings in metadata templates, share images, llms.txt and the 404 page contain no banned word from section 3.10.
11. The privacy policy states that public bios may be used to train AI models before the launch date.
12. Every KPI in section 3.13 has a working source on launch day: Search Console and Bing verified, the sitemap index submitted, and the GA4 "AI assistants" channel group saved.

### 3.12 After deploy (Rob)

Timing follows the business overview. All dates are proposed.

**Pre-launch, late September to early October 2026 (proposed)**

1. Decide the AI crawler policy (decision 1) and the indexing threshold (decision 2). Review PR #1.
2. Confirm the D1 email fix is deployed or ships with this deploy. This is a deploy gate.
3. Publish the AI training disclosure in the privacy policy.
4. Prompt creators to add a description, by email and in-app nudge.

**Launch, October 2026 (proposed)**

1. Merge and deploy PR #1.
2. Verify `amped.bio` in Google Search Console and Bing Webmaster Tools.
3. Submit `https://amped.bio/sitemap-index.xml` to both.
4. Run the Rich Results Test on 10 sample bios.
5. Save the GA4 "AI assistants" channel group and record the baselines in section 3.13.

**Post-launch, October to December 2026 (proposed)**

1. Track indexed pages and bio impressions weekly for 4 weeks.
2. Publish a guide on getting a bio found.
3. Revisit llms.txt and per-bio Markdown endpoints if AI referral traffic shows up.
4. Review the 90-day KPIs in section 3.13.

### 3.13 Measurement

No new events are built. KPIs come from Search Console, Bing Webmaster Tools, GA4 page views (property `G-SK6H61G3S1`, already loaded in the landingpage root layout) and read-only database queries.

- **Active bio:** a user with a handle, `block = "no"`, and a user or block `created_at` or `updated_at` in the last 90 days.
- **AI assistants channel group (GA4):** session source matches `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com` or `copilot.microsoft.com`, or `utm_source` contains one of them.

| KPI (90-day target, proposed) | Source | Calculation |
|---|---|---|
| Eligible bios indexed by Google (60%) | Search Console Page indexing report, filtered to the profile sitemaps; `getSitemapCount` | Indexed profile URLs divided by `total` from `getSitemapCount`. |
| Bios that meet the quality bar (50% of active bios) | Read-only SQL on production | Active bios that match `indexableUserWhere`, divided by active bios. |
| Weekly organic clicks to bios (3x the first-week baseline) | Search Console Performance, pages containing `/@`; GA4 organic search sessions as a cross-check | Clicks in week 13 divided by clicks in the first full week after sitemap submission. |
| Sessions referred by AI assistants (tracked monthly, 2x from baseline) | GA4 "AI assistants" channel group | Monthly sessions divided by the last full month before deploy. |
| Sample bios passing the Rich Results Test (100%) | Rich Results Test on 10 sample bios; Search Console Profile page enhancement report | Passing samples divided by samples, run at launch and monthly. Zero invalid items in the enhancement report. |

## Revision log

2026-09-26: aligned with business overview (added overview link; made the D1 email fix a deploy gate; added the AI training disclosure as a pre-launch requirement; added securities rules and one banned-word list with approved alternatives and no ranking promises; added gated item and account removal rules; corrected share image, sameAs, lastModified, blog post limit and llms.txt details to match the built code; added acceptance criteria 7 to 12; split after-deploy steps into proposed pre-launch, launch and post-launch phases; added a measurement section with a KPI to source table).
