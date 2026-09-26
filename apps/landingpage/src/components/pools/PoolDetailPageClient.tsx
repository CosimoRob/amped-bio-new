"use client";

import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import PoolDetailContent from "@/components/pools/PoolDetailContent";

export default function PoolDetailPageClient({ poolAddress }: { poolAddress: string }) {
  const router = useRouter();

  // Navigate to the public pools page instead of using browser history
  const handleBack = () => {
    router.push("/i/pools");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-grow bg-gray-50">
        <PoolDetailContent
          poolAddress={poolAddress}
          onBack={handleBack}
          shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/i/pools/${poolAddress}`}
        />
      </main>
    </div>
  );
}
