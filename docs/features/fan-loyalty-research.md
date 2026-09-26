# Fan Rewards and Superfans: Research and Legacy Review

Status: research stage. Drafted by Claude, 2026-09-26. Pending Rob's direction before overview and spec.

## 1. Legacy repos reviewed

| | revolution-rewards-hub | revo-superfans |
|---|---|---|
| Built | Lovable, Feb 2026 | Lovable, Jan to Feb 2026 |
| Size | about 19,000 lines | about 22,600 lines |
| Stack | Vite, React, Supabase, Web3Auth, viem | Vite, React, Supabase, RainbowKit, MetaMask |
| Core model | loyalty_programs, tasks, enrollments, completions, reward_wallets, reward_transactions, token_prices | programs, tasks, program_participants, task_completions, verification_logs, fraud_detections, rate_limits, verification_config |
| Reward | REVO on Libertas (chain 73863), paid from a creator "Reward Bank" wallet | REVO amounts per task |
| Amped link | Widget page | iframe embed pasted into an Amped custom HTML block |

### Worth keeping (as design, not code)
- Domain model: program, task, enrollment, completion, review queue.
- Task template library with a verification method per template.
- Verification taxonomy: honor system, smart auto, AI screenshot, AI URL proof, manual.
- Trust score with tiers, speed and rate-limit fraud flags, soft bans (verify-task, about 1,000 lines).
- Creator review queue and participant detail views.

### Discard
- Separate Supabase user base, auth, profiles and roles. Amped already has better-auth and Web3Auth.
- Browser wallets: private keys stored in localStorage with XOR "encryption". Creator reward bank keys held the same way.
- Client-side payouts: creator's browser signs raw REVO transfers (usePendingCompletions). Widget payout txHash is a TODO.
- Paid X follow, like and repost tasks on honor system. Violates X, YouTube, Meta, TikTok policy and pays convertible REVO for tasks.
- Landing pages, marketplace, pricing, billing, API keys. All duplicative of Amped.

Verdict: full rewrite inside amped-bio-new. Reuse the concepts, not the code.

## 2. What Amped already has
- UserWallet (Web3Auth, server-verified address), CreatorPool, StakedPool, StakeEvent.
- Referral model with on-chain payout (SIMPLE_BATCH_SEND contract), faucet via UserWallet.last_airdrop_request.
- Access gating engine spec (#21) already defines `reward_points` and `follower` rule kinds as "defined, not live". Section 3.1.6 specifies a RewardPointsLedger. No follow graph exists (#21, #1 both note this).

## 3. Competitive landscape (summary)
- Web3 quests (Galxe, Zealy, Layer3, TaskOn, Guild): alive but commoditized. Intract shut down Jan 2026. Layer3 pivoting to a wallet. Zealy paywalls X quests because of X API cost.
- Creator platforms (Patreon, Passes, YouTube, TikTok, Weverse): monetize subscriptions and drops. None ship a creator-defined quest engine with a portable fan score. Spotify superfan tier still unlaunched.
- Superfan tools (Fave, Laylo, EVEN): Fave's AI FanFinder is the closest to a fan score. Laylo rewards high-intent drop moments. EVEN sells direct to fan (UMG deal Feb 2026).
- Loyalty SaaS (Smile, Yotpo, Social Snowball, SparkLoop, beehiiv): durable models verify economic events (orders, confirmed subscribers), not social actions.
- Link-in-bio (Linktree, Beacons, Stan, Komi): no fan-side loyalty, fan score or wallet balance. Linktree's Rewards Program pays creators, not fans. Linktree killed Koji and Bento.
- Social and creator tokens: Rally, Friend.tech dead. Zora creator coins down 99.8%; Base called the creator-coin bet "definitively wrong" (Jul 2026). Speculative fandom does not retain.

## 4. Constraints
- X banned apps that pay users to post (Jan 2026, Kaito Yaps sunset). X rules ban compensated follows, likes, reposts. X API is pay-per-use ($0.005 to $0.010 per read).
- YouTube API policy prohibits rewards for viewing, liking, subscribing, commenting. Meta Developer Policy 2.7 and TikTok rules prohibit incentivized engagement. Spotify penalizes artificial streams.
- SEC/CFTC March 2026 interpretation: airdrops with no bargained-for consideration are not securities offers; task-for-token is bargained-for. Non-transferable memberships fall in the "tools" class. Consistent with the project's existing posture: non-convertible perks for engagement loops; convertible REVO only through open platform campaigns reviewed by counsel.
- Sybil farming is structural where rewards are transferable. Frequency rewards lower retention; real-usage rewards raise it (Optimism Airdrop 5).

## 5. White space
Amped owns the creator's highest-intent surface (the bio link), first-party fan identity, and a wallet. No competitor combines all three. The opening is a creator-branded loyalty layer on the bio page that rewards first-party verifiable behavior, with fan standing held in the Amped account and portable across creators.

## Sources
Key links:
- https://docs.x.com/x-api/getting-started/pricing
- https://help.x.com/en/rules-and-policies/platform-manipulation
- https://www.coindesk.com/business/2026/01/15/kaito-to-sunset-yaps-as-x-cracks-down-on-infofi-apps-token-falls-17
- https://developers.google.com/youtube/terms/developer-policies
- https://developers.facebook.com/devpolicy/
- https://www.federalregister.gov/documents/2026/03/23/2026-05635/application-of-the-federal-securities-laws-to-certain-types-of-crypto-assets-and-certain
- https://www.musicbusinessworldwide.com/fandom-platform-fave-launches-ai-supported-tool-for-artists-to-identify-and-reach-their-biggest-fans/
- https://techcrunch.com/2025/04/23/linktree-rolls-out-a-suite-of-monetization-features-for-creators/
- https://beincrypto.com/jesse-pollak-base-zora-social-bet/
- https://www.dlnews.com/articles/defi/friend-tech-shuts-down-after-revenue-and-users-plummet/
- https://zealy.io/docs/start-guide/billing-and-plans
