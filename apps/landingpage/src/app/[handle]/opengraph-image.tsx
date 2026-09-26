import { ImageResponse } from "next/og";
import { normalizeHandle } from "@/lib/handle";
import { fetchProfilePageResult } from "@/lib/getProfileData";
import { SITE_NAME, SITE_TAGLINE, truncateText } from "@/lib/seo";

export const alt = "Amped.Bio profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

const AVATAR_SIZE = 220;
const AVATAR_TIMEOUT_MS = 3000;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const SUPPORTED_AVATAR_TYPES = new Set(["image/png", "image/jpeg"]);

/**
 * Load the profile photo as a data URI. Only PNG and JPEG under 2 MB are used;
 * anything else, or a slow response, falls back to the initial letter.
 */
async function loadAvatar(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;

    const response = await fetch(parsed, { signal: AbortSignal.timeout(AVATAR_TIMEOUT_MS) });
    if (!response.ok) return null;

    const type = (response.headers.get("content-type") ?? "").split(";")[0].trim();
    if (!SUPPORTED_AVATAR_TYPES.has(type)) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > AVATAR_MAX_BYTES) return null;

    return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const handle = normalizeHandle((await params).handle);
  const result = await fetchProfilePageResult(handle);
  const profile = result.status === "found" ? result.data.profile : null;

  const name = profile?.name.trim() || `@${handle}`;
  const bio = profile ? truncateText(profile.bio, 110) : "";
  const avatar = await loadAvatar(profile?.photoUrl);
  const initial = (name.replace(/^@/, "")[0] ?? "A").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #4c1d95 100%)",
          padding: "70px 90px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6, #9333ea)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            A
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: "#ffffff" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          {avatar ? (
            <img
              src={avatar}
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              alt=""
              style={{ borderRadius: AVATAR_SIZE, objectFit: "cover", border: "6px solid #a5b4fc" }}
            />
          ) : (
            <div
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE,
                background: "linear-gradient(135deg, #3b82f6, #9333ea)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 110,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
            <div
              style={{
                display: "flex",
                fontSize: name.length > 24 ? 56 : 72,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#c7d2fe" }}>
              @{handle}
            </div>
            {bio && (
              <div style={{ display: "flex", fontSize: 28, color: "#e0e7ff", lineHeight: 1.35 }}>
                {bio}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: "#a5b4fc" }}>
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    size
  );
}
