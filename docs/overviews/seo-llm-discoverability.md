# SEO and LLM Discoverability: Overview

Build Board item #10. Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Editable copy for comments: https://claude.ai/code/artifact/9f6051cd-cbc7-4f51-be57-5359941cd516
Engineering spec: [docs/features/seo-llm-discoverability.md](../features/seo-llm-discoverability.md)

## Summary

SEO and AI discoverability makes every quality Amped bio a distinct page that Google, Bing and AI assistants can find, read and cite. Today every bio looks identical to a search engine: the same title, description and share image. The work is built and waiting in PR #1. It turns each creator's bio into a free acquisition channel for Amped. AI referrals are rising fast: BrightEdge reports ChatGPT referral traffic doubled from January to August 2026.

## What it does

**For creators**

- Their bio shows their own name, description and photo in search results.
- Links shared on X, LinkedIn, iMessage and Slack show a generated card with their name, handle and photo.
- AI assistants such as ChatGPT, Claude and Perplexity are allowed to read the bio.
- Nothing to set up. It works for every creator whose bio meets the quality bar.

**For fans and visitors**

- A search for a creator's name plus "Amped" lands on the right page.
- Shared bios and pool pages show a clear title, description and image.
- A mistyped or unclaimed handle returns a real "not found" page with an offer to claim it.

**For Amped the business**

- Sitemaps list every quality bio, every public pool and the latest 100 blog posts. New bios appear within an hour.
- robots.txt welcomes search engines and AI crawlers and keeps login and private pages out.
- An llms.txt file gives AI agents a short map of the site, as a low-cost hedge.
- Empty, thin or suspended bios stay out of the index, so they do not dilute the domain.
- Pool pages get their own titles, descriptions and share images.

## How it works

1. A search crawler, an AI crawler or a person requests amped.bio/@handle.
2. Amped builds the page on the server with the creator's title, description, preferred address and share image.
3. Structured data tells search engines this is a creator profile and links it to the creator's other channels.
4. A sitemap index points crawlers to every quality bio, public pool and the latest 100 blog posts.
5. robots.txt allows search and AI crawlers and blocks login, signup and private pages.
6. llms.txt gives AI agents a plain summary of Amped and its key pages.
7. Bios that miss the quality bar are marked "do not index" and left out of sitemaps.
8. After deploy, Rob verifies amped.bio in Google Search Console and Bing Webmaster Tools and submits the sitemap.

Under the hood, bios were already built on the server, so crawlers always got full pages. This work adds per-bio titles, share images and structured data on top. A bio qualifies when it has a handle, a verified email, is not suspended and has a description or at least one block. No email or private field ever enters metadata.

## Competition

| Competitor | What they offer | Pricing | Where Amped wins | Where they win |
|---|---|---|---|---|
| [Linktree](https://linktr.ee/help/en/articles/5434180-how-can-i-change-my-metadata) | Custom meta title and description under Settings, SEO. | Pro and Premium only. Pro is $15 per month, $12 billed annually ([pricing](https://www.elev8or.io/blog/bio/linktree-pricing)). | Per-bio title, description, share image and structured data for every quality bio at no extra cost. | Brand recognition and domain authority built over years. |
| [Beacons](https://help.beacons.ai/en/articles/4698945) | Website title and description setting and custom domains. | Free. Creator $10, Creator Plus $30 per month ([pricing](https://beacons.ai/i/pricing)). | Automatic metadata with no setup, plus an explicit welcome to AI crawlers. | Custom domains and a broader website builder. |
| [Carrd](https://www.nocode.mba/articles/carrd-pricing) | One-page sites with custom meta tags and canonical control. | Pro Lite $9, Pro Standard $19, Pro Plus $49 per year. Meta tags from Pro Standard. | Creator profile structured data, sitemaps and AI readiness without any configuration. | Custom domains and very low cost. |
| [Squarespace](https://www.tooltester.com/en/reviews/squarespace-review/pricing/) | Full websites with built-in SEO tools and blogs. | Basic $16, Core $23, Plus $39, Advanced $99 per month billed annually. | Free, set up in minutes, built for a creator's link in bio. | Full websites, blogs and the SEO depth of many pages. |
| [Stan Store](https://help.stan.store/article/151-can-i-create-a-custom-domain-for-my-stan-store) | Creator storefront at stan.store/username. No custom domains. | Creator $29, Creator Pro $99 per month ([plans](https://help.stan.store/article/31-creator-vs-creator-pro)). | Documented SEO and AI discoverability for every bio. | Checkout, courses and email tools that drive sales. |

Critics point out that Linktree limits SEO to a title and description on paid plans ([Social WP](https://socialwp.io/blog/linktree-seo/)). Stan Store documents no SEO controls. Amped can own the claim that every bio is search-ready and AI-readable by default.

## Positioning and key marketing

**Positioning statement.** For creators who want to be found by search engines and AI assistants, Amped makes every bio a search-ready, AI-readable page by default. Unlike Linktree, which reserves custom meta tags for paid plans, Amped includes it for every creator with no setup.

**Messaging pillars**

- **Found by name.** Search results and link previews show the creator's own name, words and photo.
- **Ready for AI answers.** Amped welcomes AI crawlers and describes each bio in a form assistants can read.
- **Zero setup.** Every qualifying bio gets this automatically, on day one.

**Headline options**

1. Get found. By Google and by AI.
2. Search your name. Find your Amped.
3. Every Amped bio is built to be found.
4. The link in bio that AI can read.
5. Your bio, ready for the next search engine.

**Target segments**

- Creators building a personal brand across several platforms.
- Podcasters, speakers and authors who get searched by name.
- New creators claiming handles who want a strong first search result.
- Web3 creators whose pool pages now carry their own titles and images.

**Sample copy**

Creator announcement: "Your Amped.Bio now shows up as you. Search results and link previews use your name, description and photo, and AI assistants can read your bio. No settings needed."

Social post: "Search your name. Your Amped.Bio now shows your title, your photo and your links. AI assistants can read it too. Live for every creator."

## Launch plan and metrics

| Phase | Timing | Actions | Channels |
|---|---|---|---|
| Pre-launch | Late September to early October 2026 (proposed) | Rob decides the AI crawler policy and indexing threshold, then reviews PR #1. Ship the creator email fix (D1) before or with deploy, since the email sits in each bio's page source. Prompt creators to add a description. | Email and in-app nudge to creators. Rob's LinkedIn preview of "AI-readable bios". |
| Launch | October 2026 (proposed) | Merge and deploy PR #1. Verify amped.bio in Google Search Console and Bing Webmaster Tools. Submit the sitemap index. Run the Rich Results test on sample bios. | Amped blog. X. LinkedIn. TikTok and Instagram short video "search your name". AI Leader Edge podcast segment on AI discoverability. |
| Post-launch | October to December 2026 (proposed) | Track indexed pages and impressions weekly for 4 weeks. Publish a guide on getting a bio found. Revisit llms.txt if AI traffic shows up. | Amped blog. LinkedIn and X threads with before and after search results. Apollo.io outreach using "your bio, found by AI" as the hook. |

| Metric | Target at 90 days | Why |
|---|---|---|
| Eligible bios indexed by Google | 60% (proposed) | Confirms sitemaps and the quality bar work. |
| Bios that meet the quality bar | 50% of active bios (proposed) | Only these can be indexed. Drives creator nudges. |
| Weekly organic clicks to bios | 3x the first-week baseline (proposed) | Shows bios become an acquisition channel. |
| Sessions referred by AI assistants | Tracked monthly, 2x from baseline (proposed) | Tests the AI discoverability claim. |
| Sample bios passing the Rich Results test | 100% (proposed) | Structured data must stay valid. |

## Compliance guardrails for marketing

- **Privacy blocker.** The creator email appears in the page source of every bio today (D1). Sitemaps will invite crawlers to every bio. Ship the D1 fix before or with this deploy. No email ever enters metadata or structured data.
- **Pool pages.** Titles, descriptions and share images use descriptive wording such as "Stake REVO in {pool name}". Never put yield, APY, returns or price in any title, description, image or blog post. Debug and APY diagnostic pages stay blocked from crawlers.
- **Securities.** REVO staking is under securities counsel review. SEO and launch copy must never promise returns, yield, earnings or price.
- **Banned words** in metadata, blog posts and launch copy: yield, APY, APR, returns, earn, profit, invest, investment, price, gains.
- **Approved alternatives:** creator pool, members, join, support, community, "find me on Amped".
- **No ranking promises.** Say "helps search engines and AI assistants find your bio". Never promise first-page results, rankings or AI citations.
- **AI training disclosure.** Allowing training crawlers means public bios may be used to train AI models. State this in the privacy policy before launch.
- **Gated items.** Members-only links and content never appear in structured data, sitemaps or llms.txt.
- **Account removal.** Suspended bios are marked "do not index". Deleted bios drop from sitemaps.

## Status, decisions and links

**Screens**

This feature has no new screens. The output is page metadata, share images and crawler files.

- [PR #1: SEO and LLM discoverability](https://github.com/CosimoRob/amped-bio-new/pull/1)
- [SEO spec on the feature branch](https://github.com/CosimoRob/amped-bio-new/blob/feature/seo-llm-discoverability/docs/features/seo-llm-discoverability.md)

**Open decisions for Rob**

1. **AI crawler policy.** Recommended: allow all AI crawlers, including training bots, since discovery is the goal and bios are public by design.
2. **Indexing threshold.** Recommended: index only bios with a handle, a verified email, no suspension, and a description or at least one block.

**Links**

- [Full spec on GitHub](https://github.com/CosimoRob/amped-bio-new/blob/feature/seo-llm-discoverability/docs/features/seo-llm-discoverability.md)
- [PR #1: SEO and LLM discoverability](https://github.com/CosimoRob/amped-bio-new/pull/1)
- [PR #3: Wave 1 specs](https://github.com/CosimoRob/amped-bio-new/pull/3)
- [Build Board](https://claude.ai/artifact/FK8J7ZXWEcYXg5zvHwffxh)

### Sources

- [Linktree: How can I change my metadata](https://linktr.ee/help/en/articles/5434180-how-can-i-change-my-metadata)
- [Linktree pricing 2026 breakdown (Elev8or)](https://www.elev8or.io/blog/bio/linktree-pricing)
- [Social WP: Why Linktree is bad for your bio page SEO](https://socialwp.io/blog/linktree-seo/)
- [Beacons: Website FAQs](https://help.beacons.ai/en/articles/4698945)
- [Beacons pricing](https://beacons.ai/i/pricing)
- [No Code MBA: Carrd pricing 2026](https://www.nocode.mba/articles/carrd-pricing)
- [Tooltester: Squarespace pricing 2026](https://www.tooltester.com/en/reviews/squarespace-review/pricing/)
- [Stan Store: Custom domain](https://help.stan.store/article/151-can-i-create-a-custom-domain-for-my-stan-store)
- [Stan Store: Creator vs Creator Pro](https://help.stan.store/article/31-creator-vs-creator-pro)
- [Google Search Central: ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [BrightEdge via Yahoo Finance: ChatGPT referral traffic more than doubles in 2026](https://finance.yahoo.com/technology/ai/articles/brightedge-data-chatgpt-referral-traffic-130000699.html)
- [Rankability: llms.txt adoption](https://www.rankability.com/data/llms-txt-adoption/)
