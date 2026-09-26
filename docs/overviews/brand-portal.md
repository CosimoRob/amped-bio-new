# Brand Portal: Overview

Build Board item #7. Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Editable copy for comments: https://claude.ai/code/artifact/34624f2f-878a-49a7-91fd-0df0009c8a3b
Engineering spec: [docs/features/brand-portal.md](../features/brand-portal.md)

## Summary

The brand portal lets verified brands search opted-in Amped creators and send them structured collaboration requests. Creators decide whether they appear, what brands see and who can reach them. Their email stays private. It gives Amped a second customer, brands, and shows pool member counts as an on-chain signal no other link-in-bio product offers. It cannot launch until the public creator email exposure (D1) is fixed.

## What it does

**For brands**

- Sign up with a work email on the same domain as the company website. Amped reviews each brand within 1 business day.
- Search opted-in creators by niche, platform, audience range, pool member count, country and language.
- Open a creator profile: bio, channels, audience with source and date, on-chain member count, preferences and response record.
- Send structured requests from templates (product seeding, sponsored post, event invite) with an FTC disclosure acknowledgment.
- Track every request as sent, viewed, accepted or declined. Beta brands get 25 requests per month free.

**For creators**

- Turn on "Open to brand collaborations" with one switch. It is off by default and requires an 18+ attestation.
- Receive requests in a separate Brand requests inbox, with accept, decline, block and report.
- Share a business contact only when they accept. Their login email is never shared.
- Cap new requests at 20 per week, pause for 1 to 4 weeks, and exclude categories. Crypto and trading promotions are excluded by default.

**For Amped the business**

- A two-sided reason to join: deal flow for creators and discovery for brands.
- Pool member counts become a verifiable proof of community that brands can filter on.
- The brand account becomes the advertiser identity for the future brand ad unit (Build Board item #8).
- 90 days of accept-rate data to set brand pricing.

## How it works

1. A creator turns on brand collaborations and fills a short brand profile: niches, audience ranges, what they are open to.
2. A brand signs up with a work email. Amped checks the domain, the website and reviews the account.
3. The approved brand searches and filters opted-in creators.
4. The brand opens a profile and sends a request from a template, confirming its FTC disclosure duties.
5. The request lands in the creator's Brand requests inbox. The brand sees "Viewed" once the creator opens it.
6. The creator accepts, declines, blocks or reports. On accept, they may share a business contact.
7. Both sides get a confirmation email with an FTC disclosure reminder.
8. Monthly quotas, cooldowns after a decline and automatic pause on reports keep outreach clean.

Under the hood, only opted-in creators who meet Amped's bio quality bar are searchable. Search runs on a separate index, so private fields never enter it. An automated test fails the build if any brand-facing response contains an email or a wallet address. Every audience number carries a source badge: Self-reported, Verified or On-chain.

## Competition

| Competitor | What they offer | Pricing | Where Amped wins | Where they win |
|---|---|---|---|---|
| [Linktree Brand Deals](https://linktr.ee/help/en/articles/12135302-create-your-brand-deals-profile) | Opt-in creator profile with stats from connected Instagram or TikTok. Brands search by metrics and past collaborations. | Brand fees not published. Creator plans from free to about $35 per month. US only. Direct messaging only for Gold tier in Linktree Rewards. | Structured requests for every opted-in creator, not only a loyalty tier. On-chain member counts. | Verified platform stats today and a far larger creator base. |
| [Beacons](https://beacons.ai/i/pricing) | Auto-updating media kit and an AI brand outreach email generator. | Free. Creator $10, Creator Plus $30, Creator Max $100 per month. | Brands come to the creator through one inbox, and only verified brands can send. | Media kit with live social stats and a full creator suite. |
| [Passionfroot](https://help.passionfroot.me/en/articles/11552638-pricing) | Creator storefront and B2B sponsorship workflow with a partner network. | Free for creators. 5% charged to the partner on creator-sourced deals. 15% on partner network deals. | Free to both sides in beta. No cut of deals. | Payments, scheduling, and a $50M ad network ([creators page](https://www.passionfroot.me/creators)). |
| [Collabstr](https://collabstr.com/pricing) | Open marketplace of 1.2M+ creators with escrow, campaigns and analytics. | Free with 10% fee. Pro $249 per month. Premium $333 per month with 5% fee. | No hiring fee. Every creator opted in and has a verifiable community. | Escrow payments, campaign posting and live post analytics. |
| [Modash](https://www.modash.io/pricing) | Discovery database of 380M+ profiles with metered profile opens and email unlocks. | Essentials $199 per month (300 profiles, 150 email unlocks). Performance $499 per month. | Lists only creators who opt in. Never sells or reveals creator emails. | Scale and deep audience analytics. |
| [TikTok One](https://stackinfluence.com/blog/tiktok-marketplace-requirements) | TikTok's first-party creator marketplace. | No platform minimum for brands. Creators need around 10,000 followers and must be 18+. | No follower floor, so small and mid-size creators can be found. | First-party data and direct TikTok reach. |

Brand tools either index creators who never opted in or set follower floors that shut out small creators. Amped offers consent-first discovery of small and mid-size creators, with a community signal brands can verify on chain.

## Positioning and key marketing

**Positioning statement.** For brands that want creators with real, engaged communities, the Amped brand portal finds opted-in creators and verifies community size on chain. Unlike Modash or Collabstr, every creator chose to be found, and no brand ever sees a creator's email.

**Messaging pillars**

- **Consent first.** Every creator in search said yes to brands and controls what brands see.
- **Proof of community.** Pool member counts come from the chain, and every audience number shows its source.
- **Clean outreach.** Verified brands, structured requests and fair quotas keep creator inboxes useful.

**Headline options**

1. Find creators whose communities are real.
2. Every creator here said yes to brands.
3. Community you can verify.
4. Brand deals on the creator's terms.
5. One inbox for brand deals. Your email stays private.

**Target segments**

- Direct-to-consumer brands running product seeding with small creators.
- Agencies managing micro-creator programs for several clients.
- Music, events and lifestyle brands looking for engaged local communities.
- Web3 and fintech brands seeking crypto-native creators, after manual review only.

**Sample copy**

Creator announcement: "Brands can now find you on Amped.Bio, but only if you say yes. Turn on brand collaborations, set what you are open to, and review requests in one inbox. Your email is never shared."

Social post: "Brands: find creators who opted in and whose communities are verified on chain. The Amped.Bio brand portal private beta opens soon. 20 spots."

## Launch plan and metrics

| Phase | Timing | Actions | Channels |
|---|---|---|---|
| Pre-launch | October to November 2026 (proposed) | Fix the creator email exposure (D1). This is the blocker. Ship the bio quality rule from SEO PR #1. Publish the amped.bio/i/brands explainer and a creator waitlist switch. Counsel reviews the Brand Terms. Line up 20 beta brands. | Brand outreach via Apollo.io. Rob's LinkedIn. AI Leader Edge podcast guest invites to brand marketers. |
| Launch | December 2026 (proposed) | Private beta: 20 invited brands, creator opt-in, search, profiles, requests, inbox and pipeline. Accept shares a business contact. | Amped blog. LinkedIn. X. TikTok and Instagram short video aimed at creators. |
| Post-launch | First quarter 2027, once 200 creators opt in, accept rate tops 20% and reports stay under 2 per 100 (proposed) | Open brand signup. In-app message thread. Weekly creator digest. Domain verified badge. Decide brand pricing after 90 days of data. | Amped blog case studies. LinkedIn thought leadership from Rob. Apollo.io sequences to agencies and DTC brands. |

| Metric | Target at 90 days | Why |
|---|---|---|
| Opted-in creators | 200 (proposed, the spec's open-beta gate) | Enough supply for brands to find a fit. |
| Active brands (sent at least one request) | 20 (proposed) | Confirms demand from the private beta. |
| Accept rate of answered requests | Above 20% (proposed) | Shows search and templates produce relevant requests. |
| Reports per 100 requests | Under 2 (proposed) | Keeps creator trust intact. |
| Median time to creator reply | Under 72 hours (proposed) | Brands judge the channel on speed. |
| Requests per active brand per month | 8 (proposed) | Early read on willingness to pay. |

## Compliance guardrails for marketing

- **Privacy blocker.** Do not market the portal until the creator email exposure (D1) is fixed. Never promise brands "direct email access". Say "contact through Amped".
- **GDPR.** Listing is consent based, off by default and withdrawn with one switch. Marketing says "opt in" and "you control what brands see".
- **CCPA and CPRA.** If brands later pay for access, the privacy policy must list the categories of creator data brands receive.
- **FTC endorsements.** Both sides get disclosure reminders, and templates include "#ad", "Paid partnership" and "Gifted by [brand]". Amped does not review posts. Never claim deals are "FTC compliant".
- **Honest numbers.** Never call self-reported audience figures "verified". Use the source label every time.
- **Securities.** Show pool size as a member count only. Never describe it as value, amount staked, market cap or returns, and never pair it with price, yield or APY.
- **Banned words** when describing pools to brands: returns, yield, APY, earn, profit, investment, price, stakers as a financial metric.
- **Approved alternatives:** community size, members, on-chain verified member count, engaged community.
- **Token promotions.** Brands that promote tokens or trading products need manual review, and creators exclude the category by default. Do not market the portal as a channel for token promotion.
- **Data sourcing.** Amped never scrapes other platforms. Do not imply follower counts come from anywhere other than the creator or official APIs.
- **Age.** Only creators who attest they are 18+ can opt in.
- **Payments.** Amped does not process collaboration payments. Say so wherever deals are described.

## Screens, decisions and links

**Screens**

- [Brand signup and verification](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/brand-portal-signup.png)
- [Creator search](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/brand-portal-search.png)
- [Creator profile drawer](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/brand-portal-drawer.png)
- [Request composer](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/brand-portal-composer.png)
- [Creator inbox (mobile)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/brand-portal-inbox.png)
- [Brand request pipeline](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/brand-portal-pipeline.png)

**Open decisions for Rob**

1. **Where the portal lives.** Recommended: app.amped.bio/brands inside the existing app, with a public explainer at amped.bio/i/brands.
2. **Verification bar.** Recommended: medium, meaning a work email on the website's domain plus admin review within 1 business day.
3. **Pricing.** Recommended: free during beta with 25 requests per brand per month, then decide after 90 days of accept-rate data, with creators always free.
4. **Messaging.** Recommended: share a business contact on accept in Phase 1, and add an in-app thread in Phase 2.
5. **Crypto and token promotions.** Recommended: allow only after manual review, and exclude the category for creators by default.

**Links**

- [Full spec on GitHub](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/brand-portal.md)
- [PR #3: Wave 1 specs](https://github.com/CosimoRob/amped-bio-new/pull/3)
- [Build Board](https://claude.ai/artifact/FK8J7ZXWEcYXg5zvHwffxh)

### Sources

- [Linktree: Create your Brand Deals profile](https://linktr.ee/help/en/articles/12135302-create-your-brand-deals-profile)
- [Linktree pricing 2026 breakdown (Elev8or)](https://www.elev8or.io/blog/bio/linktree-pricing)
- [Beacons pricing](https://beacons.ai/i/pricing)
- [Passionfroot: Pricing](https://help.passionfroot.me/en/articles/11552638-pricing)
- [Passionfroot: Where creators do brand deals](https://www.passionfroot.me/creators)
- [Collabstr pricing](https://collabstr.com/pricing)
- [Modash pricing](https://www.modash.io/pricing)
- [Stackinfluence: TikTok Marketplace requirements in 2026](https://stackinfluence.com/blog/tiktok-marketplace-requirements)
