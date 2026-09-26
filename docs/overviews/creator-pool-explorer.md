# Creator Pool Explorer: Overview

Build Board item #9. Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Editable copy for comments: https://claude.ai/code/artifact/e5c2cd95-9f82-4501-bef9-3776cdc351c7
Engineering spec: [docs/features/creator-pool-explorer.md](../features/creator-pool-explorer.md)

## Summary

The Creator Pool Explorer is one place to find every creator pool on the REVO network, verify its numbers and join it. It ships as a public explorer at amped.bio/pools, with no account needed, and as the Explore panel inside the Amped app. Most of it exists today. But the main "Stake in this Pool" button is broken, and pool pages show reward rates counsel has not cleared. Fixing that and indexing the whole network makes the explorer Amped's public discovery surface.

## What it does

**For creators**

- Their pool is findable by pool name, handle, display name, category and address.
- Each pool gets a server-built page that ranks in search and shares cleanly on social.
- The pool page lists what members get, read from the creator's access rules.
- A published completeness score (image, description, handle, at least one perk) rewards creators who finish their profile with better placement.

**For fans and members**

- Browse all pools in a sortable table or grid, with category chips and a "Rising" view based on 30-day member growth.
- Verify every figure: each page shows the block height, and every number links to Revoscan.
- Stake from the pool page in one flow. Logged-out fans return to the same page after login.
- Inside the app: a "Your stakes" summary, a watchlist, and stake and unstake without leaving the panel.
- Their handle appears next to their stake only if they turn on "Show my stakes publicly". It is off by default.

**For Amped the business**

- A public, indexable surface that feeds sign-ups and new pools.
- A working funnel from pool page to stake, which is broken today.
- Network-wide coverage, including stakes and pools made outside Amped, through a chain indexer.
- One data layer and one set of components serve both the public site and the app.

## How it works

1. A chain indexer reads every pool creation and every stake, unstake and claim event on the network, every 30 seconds.
2. It updates each pool's totals and member count, and saves a daily snapshot for 30-day trends.
3. A visitor opens amped.bio/pools and sees network totals, search, category chips and the pool table.
4. They sort by total staked, members or Rising, or filter by category, member count or take rate.
5. They open a pool page: creator identity, stats, a total staked chart, recent activity and member perks.
6. They tap Stake REVO. Logged-in users get the stake modal. Logged-out users sign in and return to the same page.
7. The modal explains in three plain lines what staking does, shows the take rate and network fee, and hands off to the wallet.
8. The stake appears in the pool's totals and activity within seconds.

Under the hood, the indexer reads the chain directly, so a stake from any wallet counts, whether or not it has an Amped account. Where chain values and event totals disagree, the chain wins and the mismatch is logged. Totals are stored in sortable form, so large lists load in under 150 ms. Empty test pools stay out of the default view until they meet the listing floor.

## Competition

| Competitor | What they offer | Pricing | Where Amped wins | Where they win |
|---|---|---|---|---|
| [DefiLlama Yields](https://defillama.com/yields) | Sortable table of yield pools across 498 protocols on 101 chains, with categories and filters. | Free, with premium features by subscription. | Leads with creators and communities, not rates. Compliant by design. | Breadth across chains and deep data tooling. |
| [Uniswap Explore](https://support.uniswap.org/hc/en-us/articles/9818094509453-How-to-use-the-Uniswap-Explore-page) | Tokens, Pools and Transactions tabs. Top 100 pools sortable by TVL, APR and volume. Network filter. | Free to browse. No fees stated for Explore. | Human identity on every row. No APR column or APR sort. | Brand trust, liquidity and a live transactions feed. |
| [validators.app](https://www.validators.app/validators?locale=en&network=mainnet) | Solana validator table with scores, share of network stake, a watchlist and a timestamped data snapshot. | Free. Funded by a request to delegate to the operator's validator. | Built for fans, not node operators. Plain-language columns. | Technical depth and a long public track record. |
| [Stakewiz](https://docs.stakewiz.com/reference/api-reference/wiz-score) | Validator explorer with a published Wiz Score of weighted factors and penalties. | No pricing published on the page I opened. | Completeness score that ranks profile quality, never financial quality. | Transparent, well-known scoring for stakers. |
| [Substack leaderboards](https://support.substack.com/hc/en-us/articles/5999320475412-What-are-Substack-leaderboards) | Category leaderboards with Rising (paid growth) and Top Bestsellers (ranked by annual revenue). | Free to browse. Substack takes 10% of paid subscriptions ([pricing](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost)). | Ranks by community size and member growth, never by money earned. On-chain verifiable. | Huge reader base and proven discovery habit. |
| [Farcaster channels](https://docs.farcaster.xyz/learn/what-is-farcaster/channels) | Topic communities that users follow, with host moderation tools. | Channel creation carries a fee against name squatting. | Membership is verifiable on chain, and each community is tied to one creator. | Open social graph and active conversation. |
| [friend.tech](https://www.dlnews.com/articles/defi/socialfi-rose-in-popularity-last-year-before-falling/) | Traded "keys" to back individual creators on chain. | Speculative trading model. Revenue fell 90% from September to December 2023. | Presents pools as community membership, with no price charts. | Proved demand for backing creators on chain, at 800,000 accounts at its peak. |

DeFi explorers rank pools by rates, and creator directories rank by revenue. friend.tech showed that speculation-led creator backing collapses. Amped can own the compliant middle: a creator-first directory, verifiable on chain, ranked by community size and growth.

## Positioning and key marketing

**Positioning statement.** For fans who want to find and back creators on REVO, the Amped Pool Explorer lists every creator pool with verifiable numbers. Unlike DeFi pool lists, it ranks communities by members and growth, never by rates.

**Messaging pillars**

- **Every creator, one place.** Every pool on the network appears, including pools made outside Amped.
- **Check it yourself.** Every page shows its block height, and every figure links to Revoscan.
- **Community first.** Pools are ranked by members and growth, and each page shows what members get.

**Headline options**

1. Find the creators the REVO network backs.
2. Every creator pool. One explorer.
3. Communities you can verify.
4. Discover creators by community, not by hype.
5. See who is building, and who is backing them.

**Target segments**

- REVO holders and former ndau holders looking for creators to support.
- Fans who follow a creator and want to see their pool community.
- Creators researching how other pools present themselves before launching their own.
- Web3 media and community builders who track creator activity on chain.

**Sample copy**

Creator announcement: "Your pool now has a public home at amped.bio/pools. Fans can find you by name, handle or category, see what members get and join in one flow. Finish your profile to rank higher."

Social post: "Every creator pool on the REVO network, in one place. Search by name, browse by category, check every number on chain. amped.bio/pools"

## Launch plan and metrics

| Phase | Timing | Actions | Channels |
|---|---|---|---|
| Pre-launch | October 2026, hotfix within days (proposed) | Fix the creator email exposure (D1). Fix the broken Stake link. Remove the fake leaderboard APR and all "earn" copy. Hide APR on every surface. Move debug pages behind admin login. Build the chain indexer and backfill from the factory deployment block. Counsel reviews the disclaimer and stake modal copy. | No public marketing yet. Creator nudges in app to complete profiles. |
| Launch | December 2026 (proposed) | Public explorer at amped.bio/pools with redirects from /i/pools. Server-built pool pages, categories, disclaimer and reserved handles. Announce with a walkthrough video. | Amped blog. X. LinkedIn. TikTok and Instagram short video. AI Leader Edge podcast segment on community-first discovery. |
| Post-launch | First quarter 2027 (proposed) | In-app explorer with "Your stakes" and watchlist. Opt-in public staker identity. Perks panel, Rising view, Creators and Activity tabs. Pool sitemap entries. | Amped blog "Rising creators" roundups. LinkedIn and X threads. Apollo.io outreach to creators with pools that miss the listing floor. |

| Metric | Target at 90 days | Why |
|---|---|---|
| Pool page views that lead to a Stake click | 5% (proposed) | Measures whether the repaired funnel works. |
| Stake clicks that complete | 40% (proposed) | Shows the modal and login return path are clear. |
| Pools meeting the listing floor | 60% of pools with a creator handle (proposed) | Keeps the public view full of real communities. |
| Organic search sessions to explorer pages | 1,000 per month (proposed) | Tests the explorer as a discovery surface. |
| Indexer lag behind the chain | Under 2 minutes, 99% of the time (proposed) | The spec's promise that any stake appears fast. |
| Banned words found on pool surfaces | 0 (proposed) | Enforced by an automated check in every build. |

## Compliance guardrails for marketing

- **APR stays hidden.** Show no reward rate, APR or APY anywhere until securities counsel signs off. The card reads "Not shown while under compliance review". If counsel approves, the label is "Historical reward rate, trailing 30 days. Variable. Not a forecast or a promise of future rewards."
- **Securities.** REVO staking is under securities counsel review. Never promise returns, yield, earnings or price movement. Describe staking as backing a creator and joining their membership.
- **Banned words** on pool surfaces and in explorer marketing: earn, earning, earnings, yield, returns, passive income, APY, APR, profit, invest, investment, gains, moon, key price.
- **Approved alternatives:** stake, unstake, claim, back, support, join, members, community, take rate, "rewards the network distributes to the pool".
- **No ranking by money.** Never sort, rank or highlight pools by rewards paid or reward rate. Rising is based on member growth only.
- **No price charts.** The only chart is total staked and member count over time. Never describe a stake as gaining value.
- **Required disclaimer** on every explorer page and in screenshots: "Amped.Bio shows on-chain pool data for information only. It is not investment advice or an offer of any financial product. Staking locks REVO in a smart contract. Rewards the network distributes to a pool are variable and not guaranteed."
- **Regulatory references.** The SEC's May 2025 staking statement is background for counsel only. Never cite it in marketing as clearance.
- **Privacy.** Staker handles appear only with "Show my stakes publicly" turned on. No explorer response ever contains an email. Screenshots use sample data and test accounts.
- **Perks.** Show perks as member access to creator content only, never as an economic benefit.
- **Disclaimer exemption.** The required disclaimer is the only place the words "investment advice" may appear. The automated banned-word check exempts it.

## Screens, decisions and links

**Screens**

- [Public explorer list (desktop)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-explorer-home.png)
- [Pool detail (desktop)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-explorer-pool-detail.png)
- [In-app explorer with stake modal](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-explorer-in-app.png)
- [Pool detail (mobile)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-explorer-mobile-detail.png)
- [Explorer list (mobile)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-explorer-mobile-list.png)

**Open decisions for Rob**

1. **Where the public explorer lives.** Recommended: amped.bio/pools with redirects from /i/pools, so pools and bios share one domain's search strength.
2. **Reward rate display.** Recommended: hide APR on both surfaces until securities counsel signs off, and never use it as a column or sort.
3. **Staker identity.** Recommended: show shortened wallets by default, and a handle only when the member opts in.
4. **Listing floor.** Recommended: list pools with a name, an image or description, a creator handle and at least one member besides the creator.
5. **Pools not created through Amped.** Recommended: show them marked "No Amped profile", never on the first page of the default sort.
6. **"Fans" or "Stakers".** Recommended: "Stakers" in the explorer, with "Supporters" allowed on the creator's own bio.
7. **Leaderboard panel.** Recommended: delete the mock panel and point it to the in-app explorer sorted by members.

**Links**

- [Full spec on GitHub](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/creator-pool-explorer.md)
- [PR #3: Wave 1 specs](https://github.com/CosimoRob/amped-bio-new/pull/3)
- [Build Board](https://claude.ai/artifact/FK8J7ZXWEcYXg5zvHwffxh)

### Sources

- [DefiLlama Yields](https://defillama.com/yields)
- [Uniswap: How to use the Explore page](https://support.uniswap.org/hc/en-us/articles/9818094509453-How-to-use-the-Uniswap-Explore-page)
- [validators.app: Solana validators](https://www.validators.app/validators?locale=en&network=mainnet)
- [Stakewiz: Wiz Score reference](https://docs.stakewiz.com/reference/api-reference/wiz-score)
- [Substack: What are Substack leaderboards](https://support.substack.com/hc/en-us/articles/5999320475412-What-are-Substack-leaderboards)
- [Substack: How much does Substack cost](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost)
- [Farcaster: Channels](https://docs.farcaster.xyz/learn/what-is-farcaster/channels)
- [DL News: SocialFi rose in popularity before falling](https://www.dlnews.com/articles/defi/socialfi-rose-in-popularity-last-year-before-falling/)
