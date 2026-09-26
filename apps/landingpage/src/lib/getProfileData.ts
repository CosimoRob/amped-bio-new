import { cache } from "react";
import { TRPCClientError } from "@trpc/client";
import { trpcClient } from "./trpc";
import { mapGetHandleData, type ProfilePageData } from "./profilePageData";

export type ProfilePageResult =
  | { status: "found"; data: ProfilePageData }
  | { status: "not_found" }
  | { status: "error" };

/**
 * Fetch a public profile page (user, theme, blocks) from the API server and
 * tell a missing handle apart from an unreachable API, so pages can return
 * 404 only when the handle really does not exist.
 */
async function loadProfilePageResult(handle: string): Promise<ProfilePageResult> {
  try {
    const onlinkData = await trpcClient.handle.getHandle.query({ handle });
    if (!onlinkData) return { status: "not_found" };
    return { status: "found", data: mapGetHandleData(onlinkData, handle) };
  } catch (error) {
    if (error instanceof TRPCClientError) {
      const code = (error.data as { code?: string } | undefined)?.code;
      if (code === "NOT_FOUND" || code === "BAD_REQUEST") return { status: "not_found" };
    }
    return { status: "error" };
  }
}

/**
 * Request-scoped cached version, so generateMetadata, the share image and the
 * page share one API call per request.
 */
export const fetchProfilePageResult = cache(loadProfilePageResult);

/**
 * Fetch a public profile page. Returns null when the handle does not exist or
 * the API is unreachable, so callers can decide how to render (fallback or 404).
 */
export async function fetchProfilePageData(handle: string): Promise<ProfilePageData | null> {
  const result = await fetchProfilePageResult(handle);
  return result.status === "found" ? result.data : null;
}
