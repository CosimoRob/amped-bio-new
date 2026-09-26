import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";

export const metadata: Metadata = {
  title: "Page not found | Amped.Bio",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-grow flex items-center justify-center bg-gray-50 px-6 py-16">
        <div className="max-w-md text-center space-y-5">
          <SearchX className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-gray-900">This page does not exist</h1>
          <p className="text-gray-600">
            No Amped.Bio profile uses this name yet. If it is yours, you can claim it now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Claim this name
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Go to home page
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
