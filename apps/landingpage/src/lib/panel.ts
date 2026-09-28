import { formatHandle } from "@/lib/handle";

/**
 * Build the apps/client URL for editing a user's page. All edit and private
 * areas live in the client app, so links from the public site must point there.
 */
export function getPanelEditUrl(handle: string): string {
  const base = process.env.NEXT_PUBLIC_PANEL_URL || "";
  if (!handle) return base || "/";
  return `${base}/${formatHandle(handle)}/edit`;
}

/**
 * Build the apps/client URL that opens a pool's details panel in Explore, where the
 * signed in person can stake. The client reads t=pools and pa=<address> on load
 * (apps/client PoolsTab). /i/pools/... must never be used on the panel host: the
 * client has no such route and bounces it back to the public site.
 */
export function getPanelPoolUrl(poolAddress: string): string {
  const base = process.env.NEXT_PUBLIC_PANEL_URL || "";
  return `${base}/explore?t=pools&pa=${encodeURIComponent(poolAddress)}`;
}

/**
 * Validates a ?redirect= value before navigating to it after sign in.
 * Allowed: a same site path ("/x", not "//x") or an absolute URL on the panel origin.
 * Anything else returns null so callers fall back to their default destination.
 */
export function getSafeRedirect(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")) return raw;
  const base = process.env.NEXT_PUBLIC_PANEL_URL;
  if (!base) return null;
  try {
    const target = new URL(raw);
    const panel = new URL(base);
    return target.origin === panel.origin ? target.toString() : null;
  } catch {
    return null;
  }
}
