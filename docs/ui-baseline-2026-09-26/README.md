# UI baseline, 2026-09-26

The "before" record for the design system upgrade. The code on this branch is `main@c856457`, untouched. This folder adds only screenshots.

- `editor-*`: the client app (`apps/client`) built from this commit in client-only mock mode (`vite build --mode client-only`), all feature flags on, captured in headless Chromium. Demo data, not a real account. In mock mode, Wallet crashes, My Pool stays on loading skeletons, and Explore returns no users.
- `public-*`: live amped.bio, captured the same day. The public site is a separate deploy, so these reflect production.
- `live-*`: app.amped.bio signed in as @Rob, captured in Chrome the same day. Wallet addresses, balances, stakes, email, transaction counterparties, other members' names and photos, and pool fans are blurred in the page before capture. Nothing was saved, sent or staked. Desktop 1440 wide; mobile 539 wide (the narrowest Chrome window, still the mobile layout). Scrolling panels are stitched; two-pane panels (Profile, Themes, Blocks) are stacked frames.
- Viewports: `-desktop` 1440x900, `-mobile` 390x844 at 2x. Full-page captures, WebP, cropped at 8000px tall.

Restore this UI state: `git checkout archive/ui-baseline-2026-09-26`.
