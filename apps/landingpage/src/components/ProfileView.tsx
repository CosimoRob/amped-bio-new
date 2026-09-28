"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Settings } from "lucide-react";
import { getPlatformIcon } from "@/lib/platforms";
import { trpcClient } from "@/lib/trpc";
import { normalizeHandle, formatHandle } from "@/lib/handle";
import { Skeleton } from "@repo/ui";
import { cn } from "@repo/ui";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BlockErrorFallback } from "@/components/blocks/BlockErrorFallback";
import { TextBlock } from "@/components/blocks/text/TextBlock";
import { MediaBlock } from "@/components/blocks/MediaBlock";
import { CreatorPoolBlock } from "@/components/blocks/CreatorPoolBlock";
import { ReferralBlock } from "@/components/blocks/ReferralBlock";
import { SystemStatsBadge } from "@/components/layout/SystemStatsBadge";
import { useReferralHandler } from "@/hooks/useReferralHandler";
import { useAuth } from "@/contexts/AuthContext";
import {
  getButtonBaseStyle,
  getButtonEffectStyle,
  getContainerStyle,
  getHeroEffectStyle,
  isHTML,
} from "@/lib/styles";
import type { BlockType } from "@repo/constants";
import { sanitizeRichHtml } from "@repo/constants";
import {
  DEFAULT_HANDLE,
  DEFAULT_PROFILE_DATA,
  mapGetHandleData,
  type ProfilePageData,
  type Theme,
  type UserProfile,
} from "@/lib/profilePageData";

function ProfileSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <div className="fixed inset-0 w-full h-full z-[1] bg-gray-100">
        <div className="absolute inset-0" />
      </div>
      <div className="min-h-full relative z-[2]">
        <div className="relative min-h-full py-8 px-4 transition-all duration-300 mx-auto z-10 max-w-[640px]">
          <div className="w-full space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <Skeleton className="w-32 h-32 rounded-full object-cover ring-4 ring-white/50 shadow-xl" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 mx-auto rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-64 mx-auto rounded" />
                  <Skeleton className="h-4 w-56 mx-auto rounded" />
                  <Skeleton className="h-4 w-60 mx-auto rounded" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full px-4 py-3 flex items-center space-x-3 rounded-lg">
                  <Skeleton className="w-5 h-5 flex-shrink-0 rounded-full" />
                  <Skeleton className="flex-1 h-5 rounded" />
                </div>
              ))}
            </div>
            <div className="pt-4 text-center">
              <Skeleton className="h-4 w-40 mx-auto rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function extractRootDomain(url: string): string {
  try {
    const urlString = url.startsWith("http") ? url : `https://${url}`;
    return new URL(urlString).hostname;
  } catch {
    return url;
  }
}

export function ProfileView({
  handle: rawHandle,
  initialData,
}: {
  handle?: string;
  initialData?: ProfilePageData | null;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(initialData?.profile ?? null);
  const [blocks, setBlocks] = useState<BlockType[]>(initialData?.blocks ?? []);
  const [theme, setTheme] = useState<Theme | null>(initialData?.theme ?? null);
  const [hasCreatorPool, setHasCreatorPool] = useState(initialData?.hasCreatorPool ?? false);
  const [loading, setLoading] = useState(!initialData);
  const [copied, setCopied] = useState(false);

  const { authUser } = useAuth();
  const { handleReferrerClick } = useReferralHandler();

  const effectiveHandle = rawHandle || DEFAULT_HANDLE;
  const normalizedHandle = normalizeHandle(effectiveHandle);
  const showRns = process.env.NEXT_PUBLIC_SHOW_RNS === "true";

  const handleCopy = () => {
    navigator.clipboard.writeText(profile?.revoName ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = (block: BlockType) => {
    if (block.type === "link") {
      trpcClient.blocks.registerClick.mutate({ id: block.id });
    }
  };

  useEffect(() => {
    if (initialData) return;
    setLoading(true);
    (async () => {
      try {
        const onlinkData = await trpcClient.handle.getHandle.query({
          handle: normalizedHandle,
        });
        if (onlinkData) {
          const data = mapGetHandleData(onlinkData, normalizedHandle);
          setProfile(data.profile);
          setTheme(data.theme);
          setBlocks(data.blocks);
          setHasCreatorPool(data.hasCreatorPool);
        }
      } catch {
        if (normalizedHandle === DEFAULT_HANDLE) {
          setProfile(DEFAULT_PROFILE_DATA.profile);
          setTheme(DEFAULT_PROFILE_DATA.theme);
          setBlocks(DEFAULT_PROFILE_DATA.blocks);
          setHasCreatorPool(DEFAULT_PROFILE_DATA.hasCreatorPool);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [normalizedHandle, initialData]);

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <ProfileSkeleton />;

  const themeConfig = theme?.config;
  const revoNameUrl =
    profile.revoName && showRns
      ? `${process.env.NEXT_PUBLIC_RNS_URL}/#/profile/${profile.revoName.split(".")[0]}`
      : null;

  return (
    <div className="min-h-screen flex flex-col">
      {normalizedHandle === DEFAULT_HANDLE && (
        <div className="md:hidden flex justify-center py-2 relative z-10">
          <SystemStatsBadge />
        </div>
      )}
      <div className="flex flex-col h-screen">
        <div
          className={cn(
            "flex-1 overflow-auto relative",
            themeConfig?.background?.type === "color" &&
              !themeConfig?.background?.value?.includes("gradient")
              ? "bg-gray-100"
              : ""
          )}
        >
          {/* Background Layer - Fixed to viewport */}
          <div
            className="fixed inset-0 w-full h-full z-[1]"
            style={{
              backgroundColor:
                themeConfig?.background?.type === "color" &&
                !themeConfig?.background?.value?.includes("gradient")
                  ? themeConfig?.background?.value || undefined
                  : undefined,
              background:
                themeConfig?.background?.type === "color" &&
                themeConfig?.background?.value?.includes("gradient")
                  ? themeConfig?.background?.value || undefined
                  : undefined,
            }}
          >
            {themeConfig?.background?.type === "video" ? (
              <video
                src={themeConfig.background.value || ""}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : themeConfig?.background?.type === "image" ? (
              <div
                className="w-full h-full bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url(${themeConfig.background.value})`,
                  backgroundSize: "cover",
                }}
              />
            ) : null}
            <div className="absolute inset-0">
              <ParticlesBackground effect={themeConfig?.particlesEffect ?? 0} />
            </div>
          </div>

          {/* Content Layer */}
          <div className="min-h-full relative z-[2]">
            <div className="relative min-h-full py-8 px-4 transition-all duration-300 mx-auto z-10 max-w-[640px]">
              {/* Container */}
              <div
                className={cn("w-full space-y-8 p-8", getContainerStyle(themeConfig?.containerStyle))}
                style={{
                  backgroundColor: `${themeConfig?.containerColor}${Math.round(
                    (themeConfig?.transparency ?? 0) * 2.55
                  )
                    .toString(16)
                    .padStart(2, "0")}`,
                }}
              >
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center space-y-6">
                  {profile.photoUrl && (
                    <div className="relative">
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-white/50 shadow-xl"
                      />
                      <div className="absolute -inset-1 rounded-full" />
                    </div>
                  )}
                  {profile.photoCmp && (
                    <div className="relative">
                      <img src={profile.photoCmp} alt={profile.name} className="w-32 h-auto" />
                    </div>
                  )}
                  <div className="space-y-4 w-full">
                    <div className="w-full">
                      <h1
                        className={cn(
                          "text-4xl font-bold tracking-tight",
                          getHeroEffectStyle(themeConfig?.heroEffect)
                        )}
                        style={{
                          fontFamily: themeConfig?.fontFamily,
                          color: themeConfig?.fontColor,
                        }}
                      >
                        {profile.name}
                      </h1>
                      {profile.revoName && showRns && (
                        <div
                          className={cn(
                            "font-bold tracking-tight flex items-center justify-center gap-1 w-full overflow-hidden",
                            getHeroEffectStyle(themeConfig?.heroEffect)
                          )}
                          style={{
                            fontFamily: themeConfig?.fontFamily,
                            color: themeConfig?.fontColor,
                          }}
                        >
                          <button
                            onClick={handleCopy}
                            className="text-sm font-bold transition-all duration-300 shrink-0"
                          >
                            {!copied ? (
                              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                            )}
                          </button>
                          {revoNameUrl ? (
                            <a
                              href={revoNameUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium flex items-center gap-1 hover:underline min-w-0"
                            >
                              <span className="break-all">{profile.revoName}</span>
                              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            </a>
                          ) : (
                            <span className="font-medium min-w-0">
                              <span className="break-all">{profile.revoName}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {profile.bio && (
                      isHTML(profile.bio) ? (
                        <p
                          className="text-lg max-w-2xl mx-auto leading-relaxed"
                          style={{
                            fontFamily: themeConfig?.fontFamily,
                            color: themeConfig?.fontColor,
                            opacity: 0.9,
                          }}
                          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(profile.bio) }}
                        />
                      ) : (
                        <p
                          className="text-lg max-w-2xl mx-auto leading-relaxed"
                          style={{
                            fontFamily: themeConfig?.fontFamily,
                            color: themeConfig?.fontColor,
                            opacity: 0.9,
                          }}
                        >
                          {profile.bio}
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Links & Blocks */}
                <div className="space-y-4">
                  {blocks.map(block => {
                    if (block.type === "link") {
                      const Icon = getPlatformIcon(block.config.platform);
                      const element =
                        block.config.platform === "custom" ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${extractRootDomain(block.config.url)}&sz=128`}
                            className="w-5 h-5 flex-shrink-0 rounded-full"
                            alt=""
                          />
                        ) : (
                          <Icon className="w-5 h-5 flex-shrink-0" />
                        );

                      return (
                        <ErrorBoundary key={block.id.toString()} fallback={<BlockErrorFallback platform={block.config.platform} />}>
                          <a
                            href={block.config.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(block)}
                            className={cn(
                              "w-full px-4 py-3 flex items-center space-x-3",
                              "transition-all duration-200",
                              getButtonBaseStyle(themeConfig?.buttonStyle),
                              getButtonEffectStyle(themeConfig?.buttonEffect)
                            )}
                            style={{
                              backgroundColor: themeConfig?.buttonColor,
                              fontFamily: themeConfig?.fontFamily,
                              fontSize: themeConfig?.fontSize,
                              color: themeConfig?.fontColor,
                            }}
                          >
                            {element}
                            <span className="flex-1 text-center">{block.config.label}</span>
                          </a>
                        </ErrorBoundary>
                      );
                    }
                    if (block.type === "media") {
                      return (
                        <ErrorBoundary key={block.id} fallback={<BlockErrorFallback platform={block.config.platform} />}>
                          <MediaBlock block={block as any} theme={themeConfig as any} />
                        </ErrorBoundary>
                      );
                    }
                    if (block.type === "pool") {
                      return (
                        <ErrorBoundary key={block.id} fallback={<BlockErrorFallback platform="creator pool" />}>
                          <CreatorPoolBlock block={block as any} theme={themeConfig as any} />
                        </ErrorBoundary>
                      );
                    }
                    if (block.type === "referral") {
                      return (
                        <ErrorBoundary key={block.id} fallback={<BlockErrorFallback platform="referral" />}>
                          <ReferralBlock
                            block={block as any}
                            theme={themeConfig as any}
                            pageOwnerId={profile.id}
                          />
                        </ErrorBoundary>
                      );
                    }
                    return (
                      <ErrorBoundary key={block.id} fallback={<BlockErrorFallback platform="content" />}>
                        <TextBlock block={block as any} theme={themeConfig as any} />
                      </ErrorBoundary>
                    );
                  })}
                </div>

                {/* Powered by footer */}
                <div className="pt-4 text-center">
                  <button
                    onClick={() => {
                      if (profile.id) {
                        handleReferrerClick(profile.id);
                      }
                    }}
                    className="text-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{
                      fontFamily: themeConfig?.fontFamily,
                      color: themeConfig?.fontColor,
                      border: "none",
                      outline: "none",
                      background: "none",
                      padding: 0,
                    }}
                  >
                    Claim your own Amped.Bio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex space-x-4">
        {hasCreatorPool && (
          <a
            href={`${process.env.NEXT_PUBLIC_PANEL_URL || ""}/pools/${normalizedHandle}`}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>View Creator Pool</span>
          </a>
        )}
        {authUser && authUser.handle === normalizedHandle && (
          <a
            href={`${process.env.NEXT_PUBLIC_PANEL_URL || ""}/${formatHandle(authUser.handle)}/edit`}
            className="p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Edit Page</span>
          </a>
        )}
      </div>
    </div>
  );
}
