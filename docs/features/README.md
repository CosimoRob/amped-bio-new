# Amped.Bio feature specs

Drafted by Claude for Rob Frasca, 2026-09-26. Each spec has research, an overview with decisions for Rob, a detailed spec, and proposed UI screens in `img/`. Mockup sources are in `mockups/`.

| # | Spec | Status |
|---|---|---|
| 1 | [Creator Pool Broadcast](creator-pool-broadcast.md) | Spec for review |
| 7 | [Brand Portal](brand-portal.md) | Spec for review |
| 9 | [Creator Pool Explorer](creator-pool-explorer.md) | Spec for review |
| 10 | SEO and LLM Discoverability (PR #1, branch `feature/seo-llm-discoverability`) | Built, in review |
| 20 | [Content System](content-system.md) | Spec for review |
| 21 | [Access Gating Engine](access-gating-engine.md) | Spec for review |

## Shared contract

The access gating engine spec owns the contract the others use:

- `AccessRule` model and the `accessRuleId` column on Block, ContentItem and Broadcast.
- `checkAccess`, `checkAccessBatch` and `listEligibleUserIds`.
- `AccessGrant`, a 10 minute signed token that the content system exchanges for short-lived CloudFront URLs or Mux playback tokens.
- `PaymentVerifier`, reserved for the payments work in the Revolution Network project. Paid rules stay disabled until it ships.

## Cross-cutting prerequisites (Phase 0)

These came up in more than one spec. They should land before the features that depend on them.

1. **Stop exposing creator email.** `handle.getHandle` returns `user.email` publicly, and bio pages embed it in the HTML source. This blocks the brand portal and affects every public surface.
2. **Reserved handles.** No reserved list exists. Routes such as `/pools` or `/brands` at the top level collide with creator handles. Add a reserved list before adding top-level routes.
3. **Upload validation.** Presigned uploads do not limit size, and confirm steps do not check the real file type. Fix before the content system opens uploads.
4. **Email sending.** `sendEmail` puts all recipients in one `To:` header and logs addresses. Send one message per recipient and move bulk mail to a provider with bounce and complaint handling.
5. **Promotional pool copy and APR.** "Earn" copy appears in several files and the leaderboard shows placeholder APR values. Replace with descriptive copy and hide APR until counsel signs off.

## Counsel review before launch

- Stake-gated and pool-member access (gating engine, content system, broadcast audiences).
- Any display of APR or reward figures (explorer).
- The flagged-word list for broadcasts.
