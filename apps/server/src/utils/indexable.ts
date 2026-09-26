import type { Prisma } from "../lib/prisma";

/**
 * Rules that decide whether a public profile may be indexed by search engines
 * and listed in the sitemap. The Prisma filter and the in-memory check must
 * stay equivalent, so both live here.
 *
 * A profile is indexable when it:
 * - has a handle
 * - is not suspended (block === "no")
 * - has a verified email
 * - has a non-empty description or at least one block
 */
export const indexableUserWhere: Prisma.UserWhereInput = {
  handle: { not: null },
  block: "no",
  email_verified: true,
  OR: [
    { AND: [{ description: { not: null } }, { description: { not: "" } }] },
    { blocks: { some: {} } },
  ],
};

export function isUserIndexable(
  user: {
    handle: string | null;
    block: string;
    email_verified: boolean;
    description: string | null;
  },
  blockCount: number
): boolean {
  if (!user.handle) return false;
  if (user.block !== "no") return false;
  if (!user.email_verified) return false;
  const hasDescription = user.description !== null && user.description !== "";
  return hasDescription || blockCount > 0;
}
