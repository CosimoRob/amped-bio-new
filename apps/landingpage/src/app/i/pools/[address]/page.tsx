import type { Metadata } from "next";
import PoolDetailPageClient from "@/components/pools/PoolDetailPageClient";
import { trpcClient } from "@/lib/trpc";
import { SITE_NAME, SITE_URL, truncateText } from "@/lib/seo";

interface PoolDetailsPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: PoolDetailsPageProps): Promise<Metadata> {
  const { address } = await params;
  const canonical = `${SITE_URL}/i/pools/${address}`;

  try {
    const pool = await trpcClient.pools.fan.getPoolByAddress.query({ poolAddress: address });
    const title = `${pool.name} creator pool | ${SITE_NAME}`;
    const description =
      (pool.description && truncateText(pool.description)) ||
      `Stake REVO in ${pool.name} on ${SITE_NAME}.`;
    const image = pool.image?.url
      ? { url: pool.image.url, alt: pool.name }
      : {
          url: `/og?title=${encodeURIComponent(pool.name)}`,
          width: 1200,
          height: 630,
          alt: pool.name,
        };

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { type: "website", url: canonical, title, description, images: [image] },
      twitter: { card: "summary_large_image", title, description, images: [image.url] },
    };
  } catch {
    return {
      title: `Creator pool | ${SITE_NAME}`,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }
}

export default async function PoolDetailsPage({ params }: PoolDetailsPageProps) {
  const { address } = await params;
  return <PoolDetailPageClient poolAddress={address} />;
}
