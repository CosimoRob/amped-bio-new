# Analytics Foundation (Build Board #11)

Status: scope for review. Replaces "Google Analytics everywhere".
Owner: Rob Frasca. Drafted by Claude, 2026-09-26.

Every wave 1 spec defines analytics events and KPI tables and says they run on "the analytics layer in item #11". This item is that layer. It is a foundation, not a feature. Each feature spec keeps its own events. This item owns the pipe, the schema rules and the registry.

## 1. What exists today

| Piece | State |
|---|---|
| GA4 tag `G-SK6H61G3S1` | Hardcoded in `apps/client/index.html` and the Next.js layout. `utils/ga.ts` in both apps. Only signup fires a custom event. No consent banner. |
| Creator analytics build | Three commits (patch in the Amped bio GTM project: `claude/creator-analytics.patch`, 2026-09-24). First-party cookieless collector at `POST /api/analytics/collect`, `analytics_events` table, daily rotating visitor hash, bot filtering, dashboard panel, creator GA4, Meta and TikTok pixels with a consent banner, server-side Conversions API forwarding. **Not merged. No longer applies cleanly to main** (`env.ts`, `services/API.ts`, `trpc/index.ts` have moved). |
| Feature events | Defined in five specs, none built. Inventory in section 4. |

## 2. Scope

1. **Rebase and land the creator analytics build.** It supplies the collector, the event table, the visitor hash and the consent banner. Re-run its checks against the SEO changes (profile page is now a server page with `generateMetadata`).
2. **Event registry in `packages/constants/src/analytics.ts`.** One zod schema per event name. The server rejects unknown names and unknown properties. Registry entries carry `owner` (feature item number), `side` (server or client), and `pii: false`.
3. **Server emitter.** `track(event, props)` in `apps/server/src/services/analytics/`. Writes after the database transaction commits. Batches inserts. Never throws into the calling request.
4. **Client emitter.** One `track()` for the editor and the public site that posts to the collector and, when the visitor consented, mirrors funnel events to GA4.
5. **Identity rules.** No email, wallet address or IP in any event. Signed-in users as a salted hash per tool. Creator, brand and request ids hashed before any third-party tool (brand portal 3.10).
6. **Daily snapshot jobs.** One scheduler for `*_snapshot` and `*_daily_snapshot` events (explorer, broadcast, gating, content).
7. **KPI views.** Each spec's "KPI to event" table becomes a saved SQL view over `analytics_events`, so 90-day targets compute from launch day. Admin dashboard reads the views.
8. **Consent.** One banner for the whole public site. GA4 and creator pixels load only after consent. First-party events need no consent because they set no cookies and store no raw identifiers. Counsel confirms for EU and UK.

Out of scope: dashboards for each feature (each feature owns its UI), paid analytics vendors.

## 3. Naming rules

- `snake_case`, prefixed by area: `explorer_`, `pool_`, `broadcast_`, `gate_` or `access_`, `content_`, `brand_`, `follow_`, `quest_`, `perk_`, `tier_`.
- Past tense verbs: `broadcast_sent`, `explorer_viewed`. Daily aggregates end in `_snapshot`.
- Required on every event: `ts`, `event_id` (for dedupe), `surface` (`public`, `app`, `admin`, `server`).

## 4. Event inventory from the specs

| Feature | Spec section | Events |
|---|---|---|
| #9 Creator Pool Explorer | 3.11 | explorer_viewed, explorer_searched, explorer_filter_changed, explorer_pool_opened, explorer_listing_snapshot, pool_detail_viewed, pool_stake_clicked, pool_stake_login_returned, pool_stake_confirmed, pool_unstake_confirmed, pool_watch_toggled, pool_shared, pool_perk_clicked, pool_revoscan_clicked, indexer_lag_sampled |
| #1 Broadcast | 3.9 | broadcast_composer_opened, broadcast_audience_estimated, broadcast_sent, broadcast_content_flagged, broadcast_held_for_review, broadcast_review_decided, broadcast_fanout_completed, broadcast_email_result, broadcast_read, inbox_opened, broadcast_link_clicked, broadcast_attachment_opened, broadcast_reported, broadcast_email_pref_changed, broadcast_sender_paused, broadcast_daily_snapshot |
| #21 Access Gating Engine | 3.8 | Server (`AccessEvent` table): locked_view, check, denied, unlocked, link_redirect, grant_issued, content_url_issued, pool_visit. Client: gate_view, gate_unlock_start, gate_unlock_result, gate_open, gate_pool_link_click. Lifecycle: access_rule_created, access_rule_updated, access_rule_deleted, block_gate_set. Daily: access_adoption_snapshot |
| #20 Content System | 3.11 | content_upload_started, content_upload_completed, content_upload_failed, content_upload_aborted, content_ready, content_processing_failed, content_published, content_viewed, content_locked_impression, content_unlock_clicked, content_unlocked, content_url_issued, content_downloaded, content_reported, content_blocked, content_unsafe_served, dmca_notice_received, dmca_notice_actioned, content_adoption_snapshot |
| #7 Brand Portal | 3.10 | brand_signup_started, brand_verified, brand_rejected, brand_search, brand_creator_viewed, brand_creator_saved, brand_request_sent, brand_request_viewed, brand_rate_limited, brand_reported, creator_brand_optin, creator_brand_blocked |
| Creator analytics (patch) | CREATOR_ANALYTICS.md | view, click, engage |
| #22 to #24 Fan loyalty | spec to come | follow_, quest_, perk_ and tier_ events, defined in the fan loyalty spec against these rules |

`content_url_issued` appears in both #20 and #21. The registry keeps one definition owned by #21.

## 5. Build order

1. Rebase the creator analytics patch onto main. Typecheck, build, tests.
2. Registry, server `track()`, client `track()`, consent banner for GA4.
3. Snapshot scheduler and KPI views.
4. Each feature registers its events when it is built. The feature's acceptance test ("every KPI computes from staging events") runs against this layer.

This item blocks the analytics acceptance criteria in #1, #7, #9, #20 and #21. It does not block their core builds.

## 6. Decisions for Rob

1. **Land the creator analytics patch as the base.** Recommended: yes. It already has the privacy model and consent banner.
2. **Keep GA4.** Recommended: keep it for marketing funnels only, behind consent. Product KPIs come from first-party events.
3. **Warehouse.** Recommended: MySQL `analytics_events` plus views for now. Revisit a warehouse above roughly 50 million rows.
