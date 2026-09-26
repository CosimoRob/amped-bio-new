# Fan Loyalty: Fan Graph, Rewards Programs, Superfans

Status: overview for review. Build Board items #22, #23, #24.
Owner: Rob Frasca. Drafted by Claude, 2026-09-26.

This overview replaces two Lovable prototypes (`CosimoRob/revolution-rewards-hub`, `CosimoRob/revo-superfans`). They are rebuilt natively in Amped. No separate user base, wallet or database. The detailed spec follows once the decisions in section 6 are settled.

## 1. Research summary

Full research: project doc `claude/fan-rewards-superfans-research.md`.

### 1.1 Legacy prototypes

| Keep as design | Discard |
|---|---|
| Program, quest, enrollment, completion, review queue | Separate Supabase auth, profiles and roles |
| Quest template library with a verification method per template | Browser wallets. Private keys in localStorage under XOR "encryption" |
| Verification methods: auto, AI screenshot, URL proof, manual, honor | Payouts signed in the creator's browser. Widget payout txHash is a TODO |
| Trust score, speed and rate-limit fraud flags, soft bans | Paid X follow, like and repost quests on honor system |
| Creator review queue and participant detail | Marketplace, landing pages, billing, API keys |

### 1.2 Market

- No link-in-bio product has fan-side loyalty, a fan score or a fan balance. Linktree's Rewards Program pays creators, not fans. Linktree shut down Koji and Bento.
- Web3 quest platforms (Galxe, Zealy, Layer3, TaskOn, Guild) are commoditized. Intract closed in January 2026. Zealy paywalls X quests because of X API cost.
- Creator platforms (Patreon, YouTube, TikTok, Weverse) sell subscriptions. None ship creator-defined quests with a portable fan score. Fave's FanFinder is the closest analog to a fan score.
- Durable loyalty models (Smile, Yotpo, SparkLoop, beehiiv) verify economic events, not social actions.
- Creator tokens failed: Rally and Friend.tech closed, Zora creator coins are down 99.8%.

### 1.3 Constraints

- X bans compensated follows, likes and reposts, and revoked API access for apps that pay users to post (January 2026). YouTube API policy III.F.3.c, Meta Developer Policy 2.7 and TikTok rules prohibit rewarded engagement. Spotify penalizes artificial streams.
- SEC/CFTC interpretation (March 2026): tokens for tasks are bargained-for consideration. Non-transferable memberships fall in the "tools" class.
- The CLARITY Act failed cloture 49 to 50 on 2026-09-15. The GENIUS Act covers payment stablecoins only and does not change the REVO analysis.
- Sybil farming follows transferable rewards. Rewards for real usage raise retention. Rewards for frequency lower it.

### 1.4 Current code

- `UserWallet` is server-verified through Web3Auth. `CreatorPool`, `StakedPool` and `StakeEvent` mirror staking.
- `Referral` pays REVO on chain through `SIMPLE_BATCH_SEND`. The faucet pays REVO every 24 hours (`wallet.getFaucetAmount`, `UserWallet.last_airdrop_request`) once a bio meets set requirements.
- The access gating engine (#21) defines `reward_points` and `follower` rule kinds as not live. Its section 3.1.6 specifies a points ledger.
- No follow graph exists. Broadcast (#1) and the gating engine both note the gap.

## 2. The model: two ledgers

One points balance cannot measure commitment and act as currency at the same time. We split them.

| | Fan Score | Creator Points |
|---|---|---|
| Purpose | Status. How committed a fan is | Currency. What a fan can spend |
| Scope | Per creator, plus a platform Passport total | Per creator only |
| Spent | Never | In that creator's perk shop |
| Transferable | No | No |
| Cash value | None | None |
| Drives | Tiers, badges, leaderboards, gated access, broadcast audiences | Perk redemptions |
| Lifecycle | Seasonal. Tier held for the season, score decays after | Expires after 12 months without activity |

Airlines use the same split: miles are spent, status is earned.

Points are scoped to one creator. Amped never sets an exchange rate between creators. Nothing becomes a platform-wide currency that looks like stored value or a security.

## 3. Items

### #22 Fan Graph

A free Follow between any Amped user and a creator.

- Follow button on every bio. One tap for signed-in users. Email sign-up for visitors.
- Follower counts and lists for creators. Fans control visibility.
- Unlocks the gating engine `follower` rule kind.
- Adds "Followers" as a broadcast (#1) audience.
- Following is the enrollment step for a creator's rewards program. No separate join.

### #23 Rewards Programs

One program per creator. It holds quests, the points ledger and the perk shop.

**Quests.** Only actions Amped verifies first party:

| Quest | Verification | Default Creator Points | Fan Score weight |
|---|---|---|---|
| Follow on Amped | Follow record | 50 | 1 |
| Bio visit streak (7 days) | Signed-in visits | 30 | 1 |
| Email or SMS opt-in (confirmed) | Double opt-in | 50 | 2 |
| Referral that converts (new follower with verified email) | Referral record | 100 | 4 |
| Poll or survey answer | Native form | 20 | 1 |
| UGC submission | Creator review queue | 100 | 3 |
| Event check-in | Rotating QR code, optional geofence | 150 | 6 |
| Link placement on a social profile (#13) | Profile fetch and periodic re-check | 100 | 3 |
| Stake in the creator's pool | `StakedPool` mirror | none | 8 |
| Purchase (after payments ship) | Payment record | per dollar | 10 |

Staking earns Fan Score only, never Creator Points. It keeps staking out of any reward-for-staking framing. Counsel confirms.

Off-platform social links stay on the bio as "encouraged, not rewarded". Connecting an X account through OAuth (#4) can be rewarded once. It is an Amped account action, not engagement on X.

**Perk shop.** Creators list perks priced in their points:

- Creator perks at no cost to the creator: gated links and content through `reward_points` rules (#17), early access, vote on next content, shoutout, DM reply, merch discount codes, ticket presales, name in credits.
- Amped perks: premium themes (#3), featured placement. Amped funds these from a platform budget.
- Brand perks (with #7): brands fund products, codes and sponsored quests shown to high-score fans.
- Raffles allowed. Points are earned free, which satisfies no-purchase-necessary. Counsel reviews official rules per raffle.

Redemption is atomic. Points are debited only if stock remains. Delivery is a code, an unlocked item or a creator-fulfilled task with a status the fan can see.

**Creator controls.** Quest templates, point values within platform bounds, monthly issuance cap, perk pricing guidance, review queue.

### #24 Superfans

- **Fan Score** per creator, computed from the weights above, multiplied by identity level: verified email 1.0, wallet linked 1.2, 2FA or passkey 1.4, KYC 1.6 (later).
- **Tiers** per creator. Default three: Fan, Core, Inner Circle. Thresholds set by the creator as score values or top percentiles.
- **Badges** for milestones: first 100 followers, event attended, one year following, founding staker.
- **Leaderboards** per creator, per season, top 100. Fans opt in to appear by name.
- **Superfan Passport.** A fan's cross-creator profile: tiers held, badges, seasons active. Creators see it when a fan follows them. Non-transferable. No token.
- **Superfan CRM** for creators: filter fans by tier, location, activity and badges. Export and broadcast to a segment.
- Tiers become a gating engine rule kind (`tier_min`) and a broadcast audience.

## 4. Anti-abuse

- Carry forward from `revo-superfans`: minimum realistic time per quest, 5 completions per 60 seconds soft ban, per-quest cooldowns and daily limits, trust score.
- One program balance per verified account. Verified email required to earn. Phone or passkey required for Inner Circle.
- Issuance caps per creator per month. Points expire. Redemption holds on new accounts for 72 hours.
- Weighting favors staking, purchases and attendance over repeat actions.

## 5. REVO and USDC

- **Phase 1:** no REVO for quests. Points and Fan Score only.
- **Phase 2:** USDC rewards on brand-sponsored quests once Revolution payments ship. A brand pays. A fan is compensated. Never framed as earning on holdings.
- **Phase 3:** REVO rewards after counsel classifies REVO under the March 2026 interpretation. Until then REVO moves only through discretionary drops and open platform campaigns counsel approves.
- **Faucet migration.** The signup, referral and daily faucets move from REVO to Amped platform points and Fan Score. This addresses the existing counsel flag on those faucets. Timing is a decision for Rob (section 6).

## 6. Decisions for Rob

1. **Faucet migration.** Recommended: move signup, referral and daily faucets to points when #23 ships. Stop new REVO faucet issuance at the same time.
2. **Platform points.** Recommended: Amped holds its own program (like a creator) so faucet replacements and Amped perks have a home.
3. **Tier names.** Recommended defaults: Fan, Core, Inner Circle. Creators can rename.
4. **Staking in Fan Score.** Recommended: staking counts toward Fan Score, never Creator Points. Counsel confirms.
5. **Season length.** Recommended: quarterly.

## 7. Dependencies

- #21 gating engine: `reward_points`, `follower` and new `tier_min` kinds plug into its contract.
- #1 broadcast: Followers and tier audiences.
- #13 link placement rewards becomes a quest type in #23.
- #17 reward-gated links runs on #23 points.
- #7 brand portal: brand-funded perks and sponsored quests.
- #15 payments: purchase quests and USDC rewards.

Build order: #22, then #23, then #24.

## 8. Counsel review before launch

- Points and perks terms: no cash value, non-transferable, expiry, modification rights.
- Staking weight in Fan Score.
- Raffle official rules.
- Faucet migration and the end of REVO faucet issuance.
- USDC sponsored quests: tax reporting and sanctions screening.
- REVO classification before any REVO reward.

## Sources

- https://help.x.com/en/rules-and-policies/platform-manipulation
- https://www.coindesk.com/business/2026/01/15/kaito-to-sunset-yaps-as-x-cracks-down-on-infofi-apps-token-falls-17
- https://developers.google.com/youtube/terms/developer-policies
- https://developers.facebook.com/devpolicy/
- https://www.federalregister.gov/documents/2026/03/23/2026-05635/application-of-the-federal-securities-laws-to-certain-types-of-crypto-assets-and-certain
- https://www.fintechweekly.com/news/clarity-act-cloture-vote-fails-49-50-september-2026
- https://www.federalregister.gov/documents/2026/08/18/2026-16796/genius-act-regulations-on-payment-stablecoin-issuance-offer-and-sale
- https://www.musicbusinessworldwide.com/fandom-platform-fave-launches-ai-supported-tool-for-artists-to-identify-and-reach-their-biggest-fans/
- https://techcrunch.com/2025/04/23/linktree-rolls-out-a-suite-of-monetization-features-for-creators/
