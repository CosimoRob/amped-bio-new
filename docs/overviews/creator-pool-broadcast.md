# Creator Pool Broadcast: Overview

Build Board item #1. Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Editable copy for comments: https://claude.ai/code/artifact/12207cb0-d072-478c-8d61-d9d82ca29e42
Engineering spec: [docs/features/creator-pool-broadcast.md](../features/creator-pool-broadcast.md)

## Summary

Broadcast gives every creator a direct, one-way line to the members of their creator pool. The creator writes an update once. It lands in each member's Amped inbox and, for members who opt in, in their email. Pools need a reason for members to come back after they join, and Amped needs a retention loop before payments ship. Broadcast also builds the inbox, consent and email systems that gating, content and messaging reuse.

## What it does

**For creators (pool owners)**

- Write a titled update of up to 5,000 characters with bold, italics, up to 5 links and one file from their content library.
- Send to all members, or only to members who meet a rule such as "500 REVO staked or more".
- See the exact member count and email reach before sending. Schedule up to 30 days ahead.
- Preview as inbox and as email, and send a test to themselves.
- See totals after sending: recipients, inbox reads, emails delivered, attachment opens, opt-outs and reports. No tracking of individual members.

**For fans and members**

- One inbox for updates from every creator they back, on desktop and mobile, with unread badges.
- Email is opt in, per creator. The box at join is unticked, and the same toggle sits in the inbox.
- One-click unsubscribe, a 30-day mute and a report button on every message.
- Turning off email never removes membership or inbox access.

**For Amped the business**

- A weekly reason for fans to return to Amped, and a reason for creators to grow their pools.
- A counsel-approved word list holds any message that mentions returns, yield or price for admin review. Every creator's first broadcast is reviewed too.
- Rate limits of 3 broadcasts per pool per 24 hours and 10 per 7 days. Sending pauses automatically on high reports or complaints.
- A separate sending domain keeps login and password emails safe if broadcast mail draws complaints.
- The inbox becomes the base for two-way messaging (Build Board item #2).

## How it works

1. The creator opens Broadcast in the editor. Only pool owners see it.
2. They pick an audience: all members, or members who meet an access rule. Amped shows how many members match and how many will get email.
3. They write the update. A content check highlights banned phrases as they type.
4. They preview, send a test, then send now or schedule.
5. Clean messages go out at once. Flagged messages, and each creator's first broadcast, wait for admin review.
6. Amped locks the recipient list at send time and posts the message to every member's inbox. A 10,000-member pool is covered within 60 seconds.
7. Opted-in members get an email from "{Creator} via Amped.Bio". Attached files stay behind sign-in and never travel in the email.
8. The creator sees delivery totals. Reports and spam complaints feed the automatic pause.

Under the hood, the audience comes from Amped's record of each member's stake in the pool. Every email goes to one person only, so no member ever sees another member's address. A background queue sends email at a steady rate, retries temporary failures and never sends the same email twice. Bounces and complaints add the address to a do-not-send list automatically.

## Competition

| Competitor | What they offer | Pricing | Where Amped wins | Where they win |
|---|---|---|---|---|
| [Patreon](https://support.patreon.com/hc/en-us/articles/37807653033997-Setting-post-access-for-your-Patreon-audience) | Posts targeted to free members, paid members or specific tiers. Members get app and email notifications. | [10% platform fee](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025) for creators who launched after August 4, 2025, plus 2.9% + $0.30 processing. | No platform cut on broadcast. Audience is a verified on-chain membership. Compliance checks built in. | Paid tiers work today. Large existing member base and mature mobile apps. |
| [Substack](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost) | Free newsletters to any list size, with paid subscriptions and a discovery network. | Free to publish. 10% of paid subscriptions plus Stripe fees. | Lives on the same bio fans already visit. Members without a working email still get the inbox copy. | Recognized newsletter brand, paid subscriptions and reader discovery. |
| [beehiiv](https://www.beehiiv.com/pricing) | Newsletter platform with unlimited sends, automations, ad network and paid subscriptions. | Launch free up to 2,500 subscribers. Scale $43 per month. Max $96 per month. 0% take on paid subscriptions. | No subscriber tiers to outgrow. Messages tied to membership, not a bare email list. | Segmentation, automations, ad network and deliverability at scale. |
| [Ghost](https://ghost.org/pricing/) | Publishing site plus member newsletters, with paid memberships on higher plans. | Starter $18 per month (1,000 members, no paid subs). Publisher $29. Business $199 (10,000 members). 0% transaction fee. | No per-member plan limits for creators. Sits inside the link in bio. | Full publishing website, themes, SEO and open-source hosting. |
| [Discord](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ) | Server subscriptions and announcement channels for communities. | Creators keep 90% of subscription revenue. US creators only, 18+. | One quiet inbox plus email reach. No chat to moderate. Works beyond the US. | Real-time chat and a daily-use habit for communities. |
| [Beacons](https://beacons.ai/i/pricing) | Link in bio with built-in email marketing, store and media kit. | Free: 50 email sends per month. Creator $10: 500 sends. Creator Plus $30: unlimited. 9% sales fee on Free and Creator. | Audience is verified pool members. Guardrails keep financial promotion out of messages. | Full email marketing suite and paid products live today. |

Newsletter tools reach email addresses, not verified members. Web3 community tools verify members but push messaging into Discord or Telegram. Amped joins the two on the creator's own bio, with compliance checks on every message.

## Positioning and key marketing

**Positioning statement.** For pool owners who need to reach members without an algorithm, Amped Broadcast delivers every update to each member's inbox and, with consent, email. Unlike Patreon or Substack, the audience is the creator's verified membership, on the same page fans already visit.

**Messaging pillars**

- **Direct line.** Every member gets every update in their Amped inbox, and no feed decides who sees it.
- **Member control.** Members choose email per creator and can mute or unsubscribe in one tap without leaving the community.
- **Built safe.** Counsel-approved content checks, first-send review and rate limits protect creators, members and Amped.

**Headline options**

1. Talk to your members. Not the algorithm.
2. One update. Every member. No feed.
3. Your community has an inbox now.
4. Broadcast: the direct line to the people who back you.
5. Every creator you support. One inbox.

**Target segments**

- Pool owners with 50 or more members who already post weekly on X, Instagram or TikTok.
- Musicians and podcasters who announce drops, shows and new episodes.
- Web3-native creators who run Telegram or Discord announcement channels today.
- Coaches and educators who share session notes and resources with a core group.

**Sample copy**

Creator announcement: "Broadcast is live for invited pool owners. Write one update and it reaches every member of your pool in their Amped inbox. You see the count before you send and the totals after."

Social post: "New on Amped.Bio: Broadcast. Send updates straight to your members' inbox. No algorithm. No feed. Just your community. Invite only this month."

## Launch plan and metrics

| Phase | Timing | Actions | Channels |
|---|---|---|---|
| Pre-launch | October 2026 (proposed) | Fix the public creator email exposure (D1). Stop logging recipient addresses. Counsel approves the policy text and word list. Set up the send.amped.bio sending domain. Recruit 15 pilot pool owners. | Creator outreach via Apollo.io. Direct messages on X. Teaser on Rob's LinkedIn. |
| Launch | November 2026 (proposed) | Inbox-only Broadcast for invited creators, sending to all members. Publish the launch post and a 60-second creator walkthrough. | Amped blog. X. LinkedIn. TikTok and Instagram short video. AI Leader Edge podcast segment. |
| Post-launch | December 2026 to January 2027 (proposed) | Turn on email opt-in, one-click unsubscribe and stats. Add rule-based audiences once gating ships. Open to all pool owners. Publish 3 pilot case studies. | Amped blog case studies. LinkedIn and X threads. Short video creator testimonials. Apollo.io sequences to similar creators. |

| Metric | Target at 90 days | Why |
|---|---|---|
| Active pool owners who sent at least one broadcast | 40% (proposed) | Shows creators value a direct line to members. |
| Inbox read rate within 7 days | 55% (proposed) | Measures whether members come back to Amped. |
| Member email opt-in rate | 30% (proposed) | Sizes email reach under explicit consent. |
| Held broadcasts rejected at review | Under 10% (proposed) | Shows creators understand the content policy. |
| Spam complaint rate | Under 0.1% (proposed) | Gmail and Yahoo require under 0.3%. Protects deliverability. |
| Reports per broadcast | Under 0.5% of recipients (proposed) | Early warning before the 1% automatic pause. |

## Compliance guardrails for marketing

- **Securities.** REVO staking is under securities counsel review. No marketing or creator message may promise returns, yield, earnings or price movement. Describe joining a pool as membership in, and support for, a creator's community.
- **Banned words** in marketing, templates and creator broadcasts: yield, APY, APR, returns, ROI, profit, earn, passive income, rewards grow, guaranteed, double your, 10x, moon, pump, price target, going up, invest, investment, investors, dividend, buy REVO, stake more, add to your stake.
- **Approved alternatives:** member, membership, join, back, support, community update, member access, "members of my pool".
- **Fixed footer.** Every broadcast carries: "{Creator} wrote this message. Amped.Bio delivers it and does not endorse it. Nothing in a broadcast is financial advice." Keep it visible in screenshots and demos.
- **Privacy.** Creators never see member emails. Demo screenshots use test accounts only. Do not promote Broadcast publicly until the creator email exposure (D1) is fixed.
- **Consent claims.** Say "members who opt in get email". Never say "email all your fans". Email is opt in, unticked by default, and every consent is logged.
- **CAN-SPAM.** Every email names the sender, carries a postal address and a working one-click unsubscribe. Amped honors opt-outs immediately. Subject lines must not mislead.
- **GDPR and ePrivacy.** Opt-in consent for EU and UK members. No open tracking in v1. Do not claim open-rate analytics.
- **Bulk sender rules.** SPF, DKIM and DMARC on send.amped.bio, one-click unsubscribe, and complaint rate under 0.3%.
- **FTC.** Pilot creators who post about Broadcast for early access or any perk must disclose it, for example "#ad" or "Amped partner".

## Screens, decisions and links

**Screens**

- [Composer with audience picker, content check and preview](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-broadcast-composer.png)
- [Sent broadcasts and delivery stats](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-broadcast-stats.png)
- [Fan inbox on mobile](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-broadcast-fan-inbox.png)
- [Broadcast detail with preferences and report](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-broadcast-fan-detail.png)
- [Broadcast email in a mail client](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/creator-pool-broadcast-email.png)

**Open decisions for Rob**

1. **Audience in v1.** Recommended: pool members only, since followers do not exist yet.
2. **Email consent.** Recommended: explicit opt in, with an unticked box at join and a toggle in the inbox.
3. **Flagged content.** Recommended: hold flagged broadcasts for admin review, with the option to edit and send at once.
4. **Rate limits.** Recommended: 3 broadcasts per pool per 24 hours, 10 per 7 days, and admin review of each creator's first broadcast.
5. **Access after leaving.** Recommended: members who unstake keep the text already delivered, but attachments lock.
6. **Email provider.** Recommended: Amazon SES or Postmark on a dedicated send.amped.bio stream with bounce and complaint feedback.
7. **Stats detail.** Recommended: totals only, with no per-member read, click or unsubscribe data.
8. **Word list owner.** Recommended: securities counsel approves the initial list and every change.

**Links**

- [Full spec on GitHub](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/creator-pool-broadcast.md)
- [PR #3: Wave 1 specs](https://github.com/CosimoRob/amped-bio-new/pull/3)
- [Build Board](https://claude.ai/artifact/FK8J7ZXWEcYXg5zvHwffxh)

### Sources

- [Patreon: Setting post access](https://support.patreon.com/hc/en-us/articles/37807653033997-Setting-post-access-for-your-Patreon-audience)
- [Patreon: Standard platform fee for new creators](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025)
- [Substack: How much does Substack cost](https://support.substack.com/hc/en-us/articles/360037607131-How-much-does-Substack-cost)
- [beehiiv pricing](https://www.beehiiv.com/pricing)
- [beehiiv: 2026 guide to beehiiv prices](https://www.beehiiv.com/blog/email-marketing-pricing)
- [Ghost pricing](https://ghost.org/pricing/)
- [Discord: Creator Revenue FAQ](https://creator-support.discord.com/hc/en-us/articles/10424143128343-Creator-Revenue-FAQ)
- [Beacons pricing](https://beacons.ai/i/pricing)
- [Linktree pricing](https://linktr.ee/s/pricing)
