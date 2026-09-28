"use client";

import React from "react";
import { Trophy, Users, Percent, ExternalLink, Share2, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { useReadContract } from "wagmi";
import { formatEther, type Address } from "viem";
import { getChainConfig, CREATOR_POOL_ABI } from "@repo/web3";
import { formatHandle } from "@/lib/handle";
import { getPanelPoolUrl } from "@/lib/panel";
import { formatNumberWithSeparators } from "@/utils/numberUtils";

interface PoolDetailContentProps {
  poolAddress: string;
  onBack?: () => void; // For page navigation
  shareUrl?: string; // Custom URL for sharing
}

function PoolDetailsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PoolDetailContent: React.FC<PoolDetailContentProps> = ({
  poolAddress,
  onBack,
  shareUrl,
}) => {
  // Query for pool by address from URL parameter
  const {
    data: pool,
    isLoading,
    isError,
  } = useQuery({
    ...trpc.pools.fan.getPoolDetailsForModal.queryOptions({
      poolAddress: poolAddress || undefined,
    }),
    enabled: !!poolAddress,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  // Read the creator cut (take rate) from the contract
  const { data: contractCreatorCut } = useReadContract({
    address: pool?.address as Address | undefined,
    abi: CREATOR_POOL_ABI,
    functionName: "creatorCut",
    query: {
      enabled: !!pool?.address,
    },
  });

  const chainConfig = getChainConfig(parseInt(pool?.chainId || "0"));
  const currencySymbol = chainConfig?.nativeCurrency.symbol || "REVO";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <PoolDetailsSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="max-w-md p-6 bg-white rounded-xl">
          <p className="text-red-500 text-center">Error loading pool details</p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Pools
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!poolAddress || !pool?.address) {
    return null;
  }

  const handleShare = () => {
    const urlToShare = shareUrl || `${window.location.origin}/i/pools/${pool.address}`;

    if (navigator.share) {
      navigator
        .share({
          title: pool.name,
          text: `Check out this reward pool: ${pool.name}`,
          url: urlToShare,
        })
        .catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(urlToShare)
        .then(() => {
          toast.success("Pool link copied to clipboard");
        })
        .catch(console.error);
    }
  };

  const handleViewOnExplorer = () => {
    const chain = getChainConfig(Number(pool.chainId));
    if (chain && chain.blockExplorers?.default?.url && pool.address) {
      const explorerUrl = `${chain.blockExplorers.default.url}/address/${pool.address}`;
      window.open(explorerUrl, "_blank");
    } else {
      toast.error("Could not find explorer URL for this chain.");
    }
  };

  const renderDescriptionWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Main content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Content Header */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pool Details</h1>
                <p className="text-lg text-gray-600 mt-1">{pool.name}</p>
                {pool.creator.handle && (
                  <p className="text-sm text-gray-500 mt-1">
                    Created by{" "}
                    <a
                      href={`/${formatHandle(pool.creator.handle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formatHandle(pool.creator.handle)}
                    </a>
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                  title="Share pool"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Hero Section - Image and Stats Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pool Image */}
              <div className="relative min-h-64">
                <div className="h-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  {pool.image ? (
                    <img
                      src={pool.image.url}
                      alt={`${pool.name} pool`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid - 2x2 with auto height */}
              <div className="min-h-64">
                <div className="grid grid-cols-2 gap-4">
                  {/* 24-Hour Average APR card */}
                  {pool?.apy !== undefined && pool.apy !== null && (
                    <div className="rounded-xl p-4 border border-green-100 flex flex-col justify-center">
                      <div className="flex items-center space-x-2 mb-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          24-Hour Average APR
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-900">
                        {(pool.apy / 100).toFixed(2)}%
                      </div>
                      <a
                        href={`/i/pools/${pool.address}/debug-apy`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs text-green-700 hover:text-green-800 mt-1 transition-colors duration-200"
                      >
                        <Info className="w-3 h-3" />
                        <span>View 24-Hour Average APR details</span>
                      </a>
                    </div>
                  )}

                  <div className="rounded-xl p-4 border border-purple-100 flex flex-col justify-center">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Total Pool Stake</span>
                    </div>
                    <div className="text-xl font-bold text-purple-900">
                      {formatNumberWithSeparators(formatEther(BigInt(pool.totalReward)))}
                    </div>
                    <div className="text-xs text-purple-600">{currencySymbol}</div>
                  </div>

                  <div className="rounded-xl p-4 border border-orange-100 flex flex-col justify-center">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">Total Fans</span>
                    </div>
                    <div className="text-xl font-bold text-orange-900">
                      {pool.fans.toLocaleString()}
                    </div>
                    <div className="text-xs text-orange-600">supporters</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width Description */}
            <div className="mb-8">
              <div className="rounded-xl p-6 border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">About This Pool</h4>
                <div className="max-w-3xl">
                  <p className="text-base text-gray-700 leading-relaxed">
                    {pool.description ? renderDescriptionWithLinks(pool.description) : null}
                  </p>

                  {/* Take Rate */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Take Rate:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {contractCreatorCut !== undefined && contractCreatorCut !== null
                          ? `${Number(contractCreatorCut) / 100}%`
                          : "N/A"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of rewards taken by the pool creator
                    </p>
                  </div>

                  {/* Knowledgebase Link */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a
                      href="https://amplifydigital.freshdesk.com/support/solutions/articles/154000250365-how-is-reward-pool-apy-calculated"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>How are Staking Rewards and 24-Hour Average APR Calculated?</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Explorer Link */}
              <button
                onClick={handleViewOnExplorer}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>

              {/* Stake CTA */}
              <a
                href={getPanelPoolUrl(pool.address)}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-sm"
              >
                <span>Stake in this Pool</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoolDetailContent;
