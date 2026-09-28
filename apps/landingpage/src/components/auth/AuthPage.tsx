"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { formatHandle } from "@/lib/handle";
import { getSafeRedirect } from "@/lib/panel";

function AuthPageContent({ initialForm }: { initialForm: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authUser, isPending } = useAuth();
  const [ready, setReady] = useState(false);

  // Where the person was going before sign in (for example the Stake link on a public
  // pool page). Only same site paths and panel URLs are honored.
  const requestedRedirect = getSafeRedirect(searchParams.get("redirect"));
  const redirectTo = requestedRedirect || "/";

  // router.push cannot leave the site, so absolute panel URLs use a full navigation
  const go = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  useEffect(() => {
    if (!isPending && authUser) {
      if (requestedRedirect) {
        go(requestedRedirect);
      } else if (authUser.handle) {
        go(`${process.env.NEXT_PUBLIC_PANEL_URL || ""}/${formatHandle(authUser.handle)}/edit`);
      } else {
        go(redirectTo);
      }
    } else if (!isPending) {
      setReady(true);
    }
  }, [isPending, authUser, requestedRedirect, redirectTo]);

  if (!ready) {
    return <div className="animate-pulse text-gray-400 py-16">Loading...</div>;
  }

  return (
    <main className="flex-grow flex items-center justify-center bg-gray-50 px-4 py-10">
      <AuthModal
        isOpen={true}
        initialForm={initialForm}
        onClose={user => {
          if (requestedRedirect) {
            go(requestedRedirect);
          } else if (user.handle) {
            go(`${process.env.NEXT_PUBLIC_PANEL_URL || ""}/${formatHandle(user.handle)}/edit`);
          } else {
            go(redirectTo);
          }
        }}
        onCancel={() => router.push("/")}
      />
    </main>
  );
}

export function AuthPage({ initialForm }: { initialForm: "login" | "register" }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <Suspense fallback={<div className="animate-pulse text-gray-400 py-16">Loading...</div>}>
        <AuthPageContent initialForm={initialForm} />
      </Suspense>
    </div>
  );
}
