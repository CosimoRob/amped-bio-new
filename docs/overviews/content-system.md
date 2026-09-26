# Content System: Overview

Build Board item #20. Owner: Rob Frasca. Drafted by Claude, 2026-09-26.
Editable copy for comments: https://claude.ai/code/artifact/1276820d-b90e-430a-8ed3-bda24d430d92
Engineering spec: [docs/features/content-system.md](../features/content-system.md)

## Summary

The content system lets creators upload media once, then show it on the bio, keep it for members, or attach it to broadcasts. Today Amped bios only link out, so hosted content keeps fans on Amped and gives membership something to open. Version 1 ships free and members-only content, and paid content plugs in later with no rebuild. Every upload is checked before it goes live: known child sexual abuse material matching on images and video, and malware scanning on documents and downloadable files.

## What it does

**For creators**

- Upload video up to 2 GB from a phone. Uploads resume after a dropped connection.
- Manage a library with search, filters and a storage meter. Proposed defaults: 5 GB storage and 300 video minutes per creator.
- Set each item to Public or Members only. Choose the preview: 30 seconds of audio or video, a document's first page, or a blurred cover.
- Allow or block downloads per item. Documents open in a browser viewer by default.
- Place items on the bio as a featured item, a grid or a list. Each item also gets its own page.

**For fans and members**

- Play public content inline with no login.
- See locked items with a blurred preview, a short clip and exactly what unlocks them.
- Open the item without reloading once they qualify.
- Report any item from the item or the bio footer.

**For Amped the business**

- Keeps fans on amped.bio instead of sending them to other sites.
- No file is visible before its checks pass: known-CSAM hash matching and an adult content check on images and video, and malware scanning on documents and downloads. Images and video are re-encoded before serving.
- Cost scales with use. The spec estimates about $30 per month at 1,000 creators, $1,120 at 10,000 and $12,150 at 100,000.
- A DMCA notice process and repeat infringer policy protect Amped's legal safe harbor.
- Content becomes the attachment for broadcasts and the product for paid unlocks later.

## How it works

1. The creator drops files into the upload screen. It lists allowed formats and size limits up front.
2. Files go straight to private storage in small parts. Amped's web servers never handle the file itself.
3. Amped checks the real file type, scans for malware, matches against known CSAM hashes and strips location data from images.
4. Video and audio are prepared for streaming. Amped creates thumbnails, blurred covers and preview clips.
5. The creator adds a title, description, cover and visibility. Publish unlocks when the item shows Ready.
6. Fans see the item on the bio or its own page. Public items play at once.
7. For members-only items, the access engine checks membership and issues a link that expires in minutes.
8. A deleted item stops showing at once. Its files are purged within 30 days.

Under the hood, nothing is public by default. Files are served from a separate domain, so a harmful file cannot reach amped.bio accounts. Video plays through a signed stream, so a copied link stops working quickly. The recommended stack is AWS private storage and CDN, Mux for video and audio, AWS GuardDuty for malware and Microsoft PhotoDNA for CSAM.

## Competition

| Competitor | What they offer | Pricing | Where Amped wins | Where they win |
|---|---|---|---|---|
| [Patreon](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025) | Member posts with video, audio and attachments. Video hosting up to 100 hours per month. | 10% platform fee for creators who launched after August 4, 2025, plus 2.9% + $0.30 processing. | Content sits on the link in bio. No platform cut on members-only access. | Paid memberships and single-post sales work today. Mature apps. |
| [Gumroad](https://gumroad.com/pricing) | Digital product sales with Gumroad as merchant of record. | No monthly fee. 10% + $0.50 per direct sale. 30% on Discover marketplace sales. | Free and members-only hosting with streaming and previews. Files scanned before publish. | Payments, global tax handling and a marketplace. |
| [Stan Store](https://help.stan.store/article/14-sell-a-digital-download-product) | Digital downloads up to 5 GB (500 MB recommended), nearly any file type. Courses and bookings. | Creator $29 per month. Creator Pro $99 per month ([plans](https://help.stan.store/article/31-creator-vs-creator-pro)). No free plan. | Free to start. Strict file type list and malware scanning. Streams instead of loose downloads. | Checkout, courses, bookings and email tools all live. |
| [Linktree digital products](https://linktr.ee/help/en/articles/10631437-how-to-share-and-sell-digital-products-on-your-linktree) | Free or paid files: 100 MB per file, 1 GB and 24 files per product. Delivery by email link. | 9% fee on Free, Starter and Pro. 0% on Premium ([pricing](https://linktr.ee/s/pricing)). | 2 GB video with streaming, previews and members-only access. | Brand reach, paid products live and buyer email capture. |
| [Beacons](https://beacons.ai/i/pricing) | Store with unlimited products. Course video hosting and memberships on higher plans. | Free and Creator ($10) carry a 9% fee. Creator Plus ($30) adds video hosting at 0%. | Members-only media tied to the creator's pool. | Payments, memberships and courses live today. |

Creator stores sell files, and membership platforms host posts. None of these lets a creator stream members-only media from their link in bio, tied to an on-chain membership, with scanning before publish. Amped ships free and members-only content first, then paid content on the same system.

## Positioning and key marketing

**Positioning statement.** For creators who send fans to five sites to watch, listen and download, Amped Content hosts it all on the bio, public or members only. Unlike Stan Store or Linktree digital products, it streams video with previews and ties access to the creator's own community.

**Messaging pillars**

- **Upload once, use everywhere.** One file can live on the bio, on its own page and in a broadcast.
- **Members only, done right.** Locked fans see a preview and a clear path, and full files never reach them.
- **Safe by default.** Every upload is scanned before anyone sees it, and nothing is public until the creator publishes.

**Headline options**

1. Your bio is now your library.
2. Upload once. Share it, lock it or send it.
3. Stream it where your fans already are.
4. Members-only drops, one tap away.
5. Stop linking out. Start hosting.

**Target segments**

- Musicians sharing demos, stems, live cuts and lyric sheets.
- Podcasters and video creators with bonus episodes and extended cuts.
- Educators and coaches with PDF guides, workbooks and recorded sessions.
- Web3-native creators who want members-only drops for their pool.

**Sample copy**

Creator announcement: "You can now upload video, audio, images and PDFs straight to your Amped.Bio. Put them on your bio for everyone, or keep them for your pool members. Every file is scanned before anyone sees it."

Social post: "Your bio just got a library. Upload a video, a track or a guide to Amped.Bio and share it in one tap. Members-only drops are next."

## Launch plan and metrics

| Phase | Timing | Actions | Channels |
|---|---|---|---|
| Pre-launch | October to November 2026 (proposed) | Fix the creator email exposure (D1). Apply for Microsoft PhotoDNA now, since vetting takes time. Register the DMCA agent. Publish the Content Policy and Terms updates with counsel. Sign Mux. Set up private storage. Recruit 25 pilot creators. | Creator outreach via Apollo.io. Rob's LinkedIn. X teaser with a short screen recording. |
| Launch | December 2026, once CSAM matching is live (proposed) | Free public content: library, uploads, content block and item pages. Publish a launch post and creator how-to videos. | Amped blog. X. LinkedIn. TikTok and Instagram short video. AI Leader Edge podcast segment. |
| Post-launch | First quarter 2027 (proposed) | Members-only content 2 weeks after gating ships and counsel signs off. Broadcast attachments. Paid content waits for payments. | Amped blog pilot stories. LinkedIn and X threads. Short video creator showcases. Apollo.io sequences to musicians and educators. |

| Metric | Target at 90 days | Why |
|---|---|---|
| Active creators who upload in a month | 30% (proposed) | Matches the spec's cost model and shows real adoption. |
| Published items per uploading creator | 5 (proposed) | Shows the library becomes a habit, not a one-off test. |
| Upload success rate | 98% (proposed) | Resumable uploads must work on weak mobile connections. |
| Time to Ready for a 1 GB video | Under 5 minutes (proposed) | The spec's promise to creators. |
| Valid DMCA notices actioned within 1 business day | 100% (proposed) | Protects Amped's safe harbor. |
| Unsafe files served to any viewer | 0 (proposed) | The trust promise behind "safe by default". |

## Compliance guardrails for marketing

- **Securities.** Members-only content is tied to staking, which is under securities counsel review. Never promise returns, yield, earnings or price movement. Members-only content cannot be marketed until counsel signs off.
- **Banned words** in content marketing and item copy: earn, yield, return, returns, reward for staking, APY, APR, unlock value, profit, invest, investment, passive income, income on autopilot, price, gains. Paid content copy will need counsel review because gating bans "price".
- **Approved alternatives:** members only, membership, access, join, support, library, drop, "for my members".
- **Required disclosure.** The locked page states that staking unlocks membership benefits, is not a purchase of content and carries no promise of return. Keep it in screenshots.
- **CSAM.** Known-CSAM hash matching is a launch requirement. Matches are reported to NCMEC. Say "every upload is scanned before it goes live". Never claim "100% safe".
- **DMCA.** Register the designated agent and publish a copyright policy before launch. Do not use phrases like "share anything" that suggest creators can post work they do not own. Three valid strikes in 12 months ends an account.
- **Adult content.** v1 does not allow sexually explicit content. Do not recruit adult creators or imply it is allowed.
- **Protection claims.** Say "streams through a protected player". Never claim files "cannot be copied" or use the word DRM.
- **Privacy.** Location data is stripped from images. Creator emails never appear on content pages, and the D1 fix must ship first.
- **Deletion.** Say "delete anytime, removed within 30 days". This matches the GDPR commitment.
- **Paid content.** Describe as "later". Do not collect sign-ups that show prices.
- **FTC.** Creators featured in launch content who received early access or perks must disclose it.

## Screens, decisions and links

**Screens**

- [Content library (creator, desktop)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/content-system-library.png)
- [Upload flow (creator, desktop)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/content-system-upload.png)
- [Item editor (creator, desktop)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/content-system-editor.png)
- [Bio content block (fan, mobile)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/content-system-fan-mobile.png)
- [Locked preview (fan, mobile)](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/img/content-system-locked-mobile.png)

**Open decisions for Rob**

1. **Storage and CDN vendor.** Recommended: AWS S3 private bucket plus CloudFront, keeping one cloud and native malware scanning.
2. **Video and audio vendor.** Recommended: Mux, for signed playback, audio support and a player with previews.
3. **Adult content policy.** Recommended: no sexually explicit content in v1, enforced by classifier plus human review.
4. **CSAM detection vendor.** Recommended: apply for Microsoft PhotoDNA now, since vetting takes time and launch is blocked until it is live.
5. **Default quotas.** Recommended: 5 GB storage and 300 video minutes per creator, with 2 GB per video file.
6. **Members-only content review.** Recommended: securities counsel reviews before Phase 2 ships.

**Links**

- [Full spec on GitHub](https://github.com/CosimoRob/amped-bio-new/blob/docs/wave1-specs/docs/features/content-system.md)
- [PR #3: Wave 1 specs](https://github.com/CosimoRob/amped-bio-new/pull/3)
- [Build Board](https://claude.ai/artifact/FK8J7ZXWEcYXg5zvHwffxh)

### Sources

- [Patreon: Standard platform fee for new creators](https://support.patreon.com/hc/en-us/articles/36426991446797-A-standard-platform-fee-for-new-creators-effective-after-August-4-2025)
- [Gumroad pricing](https://gumroad.com/pricing)
- [Stan Store: Sell a digital download](https://help.stan.store/article/14-sell-a-digital-download-product)
- [Stan Store: Creator vs Creator Pro](https://help.stan.store/article/31-creator-vs-creator-pro)
- [Linktree: Share and sell digital products](https://linktr.ee/help/en/articles/10631437-how-to-share-and-sell-digital-products-on-your-linktree)
- [Linktree: Digital products feature page](https://linktr.ee/features/digital-products)
- [Linktree pricing](https://linktr.ee/s/pricing)
- [Beacons pricing](https://beacons.ai/i/pricing)
