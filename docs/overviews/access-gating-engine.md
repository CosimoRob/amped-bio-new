# Access Gating Engine: Overview

Build Board item #21. Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Editable copy for comments: https://claude.ai/code/artifact/dbe902c0-61bb-4957-bbe1-8a5b00e656d3
Engineering spec: [docs/features/access-gating-engine.md](../features/access-gating-engine.md)

## Summary

Access gating lets a creator lock any link, media or text on their bio so only members of their creator pool can open it. Members unlock in seconds, and everyone else sees a locked card that states what membership requires. This gives pool membership a visible, concrete benefit on day one. One engine powers gated links, members-only content and targeted broadcasts, and paid access plugs in later. Launch waits on securities counsel sign-off.

## What it does

**For creators**

- Set "Who can open this?" on any link, media or text block: Everyone, Pool members, or Members with a minimum stake.
- Save rules with a name, such as "Inner circle", and reuse them across links, content and broadcasts.
- See how many current members meet a level before saving the rule.
- Track views, unlock attempts, unlocks, unlock rate and the top reasons fans were turned away.
- Paid access, points-based access and follower access appear in the builder as "Later".

**For fans and members**

- Locked items stay visible, with a lock and a one-line requirement such as "Members with 500 REVO staked".
- One tap starts the unlock: sign in, link a wallet if needed, and get an instant answer.
- A fan who falls short sees their current stake, the required level and a link to the pool page.
- Access follows current membership. A fan who leaves the pool loses access to new opens.

**For Amped the business**

- One audited system decides every gate across the product.
- Locked destinations never appear in page source, search results, share previews or site maps.
- Every open is checked, and each pass expires after 10 minutes, so shared links stop working.
- Paid access connects to the same engine when Rob's payments work in the Revolution Network project ships.

## How it works

1. The creator opens a block in the editor and chooses who can open it.
2. They pick Pool members (platform floor of 1 REVO) or Members with a minimum stake, then save.
3. The public bio shows a locked card. The link, file or text is stripped from the page.
4. A fan taps Unlock. If needed, Amped asks them to sign in and link a wallet.
5. Amped reads the fan's stake from the Revolution Network chain, using data no older than 60 seconds.
6. If the fan qualifies, the link opens through an Amped redirect, or the media or text appears.
7. If not, the sheet shows their stake, the level, a risk disclosure and a link to the pool page.
8. Every attempt is logged, and the creator sees the totals on the rules page.

Under the hood, the engine checks membership on chain at the moment of opening, not from a stored copy. A passing check becomes a short pass tied to that fan, that item and that version of the rule. If the chain cannot be reached, items stay locked. A fan who unstakes outside Amped loses access within about 11 minutes.

## Competition

| Competitor | What they offer | Pricing | Where Amped wins | Where they win |
|---|---|---|---|---|
| [Linktree locks](https://linktr.ee/help/en/articles/6214962-nft-lock-on-links) | NFT Lock on links via MetaMask, plus Code, Subscribe and Profile locks. | Plans from free to about $35 per month ([pricing](https://www.elev8or.io/blog/bio/linktree-pricing)). | Gates on the creator's own community, not a third-party NFT. Destination hidden from page source. Unlock stats. | Huge creator base and several lock types live today. |
| [Patreon](https://support.patreon.com/hc/en-us/articles/37807653033997-Setting-post-access-for-your-Patreon-audience) | Posts locked to free members, paid members, specific tiers, or sold one at a time. | [10% platform fee](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025) for new creators plus processing. | Gate any item on the bio itself. No platform cut on membership access. | Paid tiers and single-post sales work today. |
| [Guild.xyz](https://guild.xyz/pricing) | Roles from on-chain and social requirements across 60+ EVM chains, with points and leaderboards. | Starter $29, Pro $99, Growth $399 per month. | Built into the creator's bio. No Discord or Telegram setup. No monthly tool fee for the creator. | AND and OR logic, many chains, social requirements and points. |
| [Collab.Land](https://collab.land/pricing) | Token-gated roles in Discord and Telegram. | Free up to 25 verified members. $17.99 up to 100. $35 up to 1,000. $149 up to 2,500. $449 up to 7,500. | Checks at the moment of opening (60 seconds), not every 24 hours. No per-member pricing. | 50+ chains, 35+ wallets and a standard place in crypto communities. |
| [Shopify tokengating](https://www.shopify.com/blog/token-gating) | Merchants gate products, discounts and content through tokengating apps. | Shopify plan plus third-party app fees. | Made for creators, not stores. No app stitching. | Commerce, checkout and discounts are live. |
| [Discord server subscriptions](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ) | Paid access to gated channels and roles. | Creators keep 90%. US creators only, 18+. | Gates live on the public bio fans already visit. | Paid access and real-time community work today. |

Link-in-bio tools lock links with NFTs or codes but know nothing about the creator's community. Web3 gating tools verify wallets but live inside Discord and Telegram. Amped gates the bio itself, on the creator's own membership, with a live check on every open.

## Positioning and key marketing

**Positioning statement.** For creators who want pool membership to matter on day one, Amped Access turns any link, video or file into a members-only item. Unlike Linktree locks or Collab.Land roles, the gate lives on the creator's own bio and knows who their members are.

**Messaging pillars**

- **Members see more.** Every locked item on a bio is a clear benefit of joining the creator's community.
- **Nothing leaks.** Locked links and files never appear in page source, search results or previews.
- **Live, not stale.** Membership is checked when the fan opens the item, not once a day.

**Headline options**

1. Members only. Right on your bio.
2. Lock it. Your members open it.
3. Membership you can see.
4. Your best work, for the people who back you.
5. One tap in for members. A clear path for everyone else.

**Target segments**

- Musicians who share unreleased tracks, demos or presale links with core fans.
- Podcasters and video creators with bonus episodes and behind-the-scenes cuts.
- Educators and coaches with members-only guides, templates and session links.
- Web3-native creators who run token-gated Discord or Telegram groups today.

**Sample copy**

Creator announcement: "You can now mark any link on your bio as members only. Your pool members open it in one tap. Everyone else sees a lock and what membership requires."

Social post: "Members-only links are coming to Amped.Bio. Lock a link, a track or a file. Your members open it. Nobody else sees where it goes."

## Launch plan and metrics

| Phase | Timing | Actions | Channels |
|---|---|---|---|
| Pre-launch | October to November 2026 (proposed) | Securities counsel reviews rule types, copy and the stats screen. This is a launch blocker. Fix the creator email exposure (D1). Recruit 10 pilot creators with counsel-approved outreach copy. | Creator outreach via Apollo.io. Direct messages on X. Rob's LinkedIn, framed as membership, no mechanics. |
| Launch | December 2026, after counsel sign-off (proposed) | Link gating for 10 pilot creators behind a feature flag. Leak test passes before any public post. Publish the launch post and a 30-second unlock demo. | Amped blog. X. LinkedIn. TikTok and Instagram short video. AI Leader Edge podcast segment. |
| Post-launch | January to February 2027 (proposed) | Add media and text gating and the rules and stats page. Open to all pool owners. Connect members-only content and broadcasts. Paid access waits for payments. | Amped blog pilot stories. LinkedIn and X threads. Short video creator demos. Apollo.io sequences to Web3 creators. |

| Metric | Target at 90 days | Why |
|---|---|---|
| Pool owners with at least one gated item | 30% (proposed) | Shows creators see gating as a membership benefit. |
| Unlock success rate (unlocks divided by attempts) | 45% (proposed) | Tests whether the requirement and the flow are clear. |
| Locked views that lead to an unlock attempt | 8% (proposed) | Measures how well the locked card draws interest. |
| Visits to the pool page from a locked item | 10% of denied attempts (proposed) | Shows the path forward works without a one-tap stake. |
| Denials because the chain was unreachable | Under 1% (proposed) | Reliability of the live check. |
| Leaked destinations in public pages | 0 (proposed) | The core trust promise to creators. |

## Compliance guardrails for marketing

- **Counsel sign-off first.** Stake-based gates cannot launch or be marketed publicly until securities counsel approves the rule types, copy and stats screen.
- **Securities.** Never promise returns, yield, earnings or price movement. Gates unlock creator content only. They never grant tokens, revenue share, discounts or any economic benefit, and marketing must not imply otherwise.
- **Banned words** near a gate and in gating marketing: earn, yield, return, returns, reward for staking, profit, APY, APR, invest, investment, passive income, price, gains, unlock value.
- **Approved alternatives:** member, membership, members only, access, join, support, back, "members of my pool".
- **Required disclosure.** The unlock sheet shows "Staking carries risk. Membership access is not a return on your stake." Keep it in screenshots and demo videos.
- **Placement.** Never show gate benefits next to APY or pool performance figures. Ads and posts link to the pool page and never to a one-tap stake.
- **Privacy.** Stats show public handles or shortened wallets, never emails. Demo screenshots use test accounts. The creator email exposure (D1) must be fixed before public launch.
- **Later features.** Describe paid access as "later" with no date. Points are "points" with no cash value, never "tokens".
- **FTC.** Pilot creators who promote gating in exchange for early access or perks must disclose it.

## Screens, decisions and links

**Screens**

- [Rule builder in the block editor](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/access-gating-engine-rule-builder.png)
- [Locked item on a public bio](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/access-gating-engine-locked-bio.png)
- [Fan unlock flow](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/access-gating-engine-unlock-flow.png)
- [Creator rules and stats](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/access-gating-engine-rules-stats.png)

**Open decisions for Rob**

1. **Stake data source.** Recommended: read the chain at open time (no older than 60 seconds) and use a short cache only for page display.
2. **Combined rules.** Recommended: one rule per item in v1, with "any" and "all" combinations reserved for v2.
3. **Which pools a creator can gate on.** Recommended: only the creator's own pool, so gating never looks like promotion of another staking position.
4. **Membership floor.** Recommended: a platform floor of 1 REVO to block near-zero stakes.
5. **Pass lifetime.** Recommended: 10 minutes, long enough to finish a video and short enough to end access quickly.
6. **Who can unlock.** Recommended: signed-in Amped users with a linked wallet, with outside wallets later.
7. **Link destinations.** Recommended: accept that a fan sees the final URL after the redirect, and point creators who need more control to hosted content.
8. **Counsel review.** Required before launch of stake-based gates.

**Links**

- [Full spec on GitHub](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/access-gating-engine.md)
- [PR #3: Wave 1 specs](https://github.com/CosimoRob/amped-bio-new/pull/3)
- [Build Board](https://claude.ai/artifact/FK8J7ZXWEcYXg5zvHwffxh)

### Sources

- [Linktree: NFT Lock on links](https://linktr.ee/help/en/articles/6214962-nft-lock-on-links)
- [Linktree pricing 2026 breakdown (Elev8or)](https://www.elev8or.io/blog/bio/linktree-pricing)
- [Patreon: Setting post access](https://support.patreon.com/hc/en-us/articles/37807653033997-Setting-post-access-for-your-Patreon-audience)
- [Patreon: Standard platform fee for new creators](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025)
- [Guild pricing](https://guild.xyz/pricing)
- [Guild: What is Guild](https://docs.guild.xyz/guild/)
- [Collab.Land pricing](https://collab.land/pricing)
- [Shopify: Token gated commerce guide](https://www.shopify.com/blog/token-gating)
- [Discord: Creator Revenue FAQ](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ)
