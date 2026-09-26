import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ProfileView } from "@/components/ProfileView";
import { JsonLd } from "@/components/seo/JsonLd";
import { normalizeHandle } from "@/lib/handle";
import { fetchProfilePageResult } from "@/lib/getProfileData";
import { DEFAULT_HANDLE, DEFAULT_PROFILE_DATA, type ProfilePageData } from "@/lib/profilePageData";
import {
  SITE_URL,
  buildProfileJsonLd,
  canonicalProfileUrl,
  profileDescription,
  profileTitle,
} from "@/lib/seo";

// Render each profile page on the server for every request
export const dynamic = "force-dynamic";

interface HandlePageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Resolve the profile for a handle. Unknown handles return 404. An unreachable
 * API throws, so the visitor sees an error page and crawlers get a 5xx they
 * will retry, instead of a 404 that would drop the page from the index.
 */
async function resolveProfile(handle: string): Promise<ProfilePageData> {
  const result = await fetchProfilePageResult(handle);

  if (result.status === "found") return result.data;
  if (handle === DEFAULT_HANDLE) return DEFAULT_PROFILE_DATA;
  if (result.status === "not_found") notFound();
  throw new Error(`Profile service unavailable for handle "${handle}"`);
}

export async function generateMetadata({ params }: HandlePageProps): Promise<Metadata> {
  const normalizedHandle = normalizeHandle((await params).handle);
  const data = await resolveProfile(normalizedHandle);
  const { name, bio } = data.profile;

  const isDefault = normalizedHandle === DEFAULT_HANDLE;
  const title = profileTitle(name, normalizedHandle);
  const description = profileDescription(name, normalizedHandle, bio);
  const url = isDefault ? SITE_URL : canonicalProfileUrl(normalizedHandle);
  const indexable = data.indexable && !isDefault;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: "profile",
      siteName: "Amped.Bio",
      url,
      title,
      description,
      username: normalizedHandle,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HandlePage({ params }: HandlePageProps) {
  const { handle } = await params;
  const normalizedHandle = normalizeHandle(handle);
  const initialData = await resolveProfile(normalizedHandle);
  const isDefault = normalizedHandle === DEFAULT_HANDLE;

  return (
    <div className="min-h-screen flex flex-col">
      {!isDefault && <JsonLd data={buildProfileJsonLd(initialData, normalizedHandle)} />}
      {isDefault && <PublicHeader />}
      <main className="flex-grow">
        <ProfileView handle={handle} initialData={initialData} />
      </main>
    </div>
  );
}
