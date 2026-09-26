import { publicProcedure, privateProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { getFileUrl } from "../utils/fileUrlResolver";
import { ThemeConfig } from "@repo/constants";
import { prisma } from "../services/DB";
import { z } from "zod";
import { HANDLE_MIN_LENGTH, HANDLE_REGEX } from "@repo/constants";
import { env } from "../env";
import { logger } from "better-auth";
import { indexableUserWhere, isUserIndexable } from "../utils/indexable";

export const SITEMAP_MAX_PAGE_SIZE = 10000;

// Create a base schema for handle validation
export const handleBaseSchema = z
  .string()
  .transform(value => (value.startsWith("@") ? value.substring(1) : value)) // Normalize by removing @ prefix if present
  .transform(value => value.toLowerCase()) // Normalize to lowercase for case-insensitive lookup
  .pipe(
    z
      .string()
      .min(HANDLE_MIN_LENGTH, `Name must be at least ${HANDLE_MIN_LENGTH} characters`)
      .regex(HANDLE_REGEX, "Name can only contain letters, numbers, underscores and hyphens")
  );

// Use the base schema in specific contexts
export const handleParamSchema = z.object({
  handle: handleBaseSchema,
});

const RevoNameSubgraphSchema = z.object({
  data: z.object({
    revoNames: z.array(
      z.object({
        expiryDateWithGrace: z.string(),
        owner: z.string(),
      })
    ),
  }),
});

const appRouter = router({
  // Check if a handle is available for use
  checkAvailability: publicProcedure.input(handleParamSchema).query(async ({ input }) => {
    const { handle } = input;

    try {
      const count = await prisma.user.count({
        where: {
          OR: [
            { handle: handle },
            { handle: handle.toLowerCase() },
            { handle: handle.toUpperCase() },
          ],
        },
      });

      const available = count === 0;

      return {
        available,
        handle,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  // Redeem/change a user's handle
  redeem: privateProcedure
    .input(
      z.object({
        newHandle: z
          .string()
          .transform(value => (value.startsWith("@") ? value.substring(1) : value)) // Normalize by removing @ prefix if present
          .pipe(
            z
              .string()
              .min(HANDLE_MIN_LENGTH, `Name must be at least ${HANDLE_MIN_LENGTH} characters`)
              .regex(
                HANDLE_REGEX,
                "Name can only contain letters, numbers, underscores and hyphens"
              )
              .transform(value => value.toLowerCase()) // Force lowercase for storage
          ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { newHandle } = input;
      const userId = ctx.user!.sub;

      try {
        const existingHandle = await prisma.user.findFirst({
          where: {
            OR: [
              { handle: newHandle },
              { handle: newHandle.toLowerCase() },
              { handle: newHandle.toUpperCase() },
            ],
          },
        });

        if (existingHandle) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This handle is already taken",
          });
        }

        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            handle: newHandle,
          },
        });

        return {
          success: true,
          message: "Handle updated successfully",
          handle: newHandle,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server error",
        });
      }
    }),

  getHandle: publicProcedure.input(handleParamSchema).query(async opts => {
    const { handle } = opts.input;

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { handle: handle },
            { handle: handle.toLowerCase() },
            { handle: handle.toUpperCase() },
          ],
        },
        include: { wallet: true },
      });

      if (user === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Handle not found: ${handle}`,
        });
      }

      const hasCreatorPool = false; // Placeholder - we need to determine this differently since pools are now related to wallet

      const {
        theme: theme_id,
        id: user_id,
        name,
        revo_name,
        email,
        description,
        image,
        image_file_id,
      } = user;

      const theme = await prisma.theme.findUnique({
        where: {
          id: Number(theme_id),
        },
      });

      const themeConfig = theme?.config as ThemeConfig | undefined;

      if (themeConfig && themeConfig.background?.fileId) {
        themeConfig.background.value = await getFileUrl({
          legacyImageField: null,
          imageFileId: themeConfig.background.fileId,
        });
      }

      // Return a clean DTO instead of the raw Prisma row (no relations) so the
      // tRPC output stays shallow and type-safe for consumers
      const publicTheme = theme
        ? { id: theme.id, name: theme.name, config: themeConfig ?? null }
        : null;

      const blocks = await prisma.block.findMany({
        where: {
          user_id: Number(user_id),
        },
      });

      const publicBlocks = blocks.map(block => ({
        id: block.id,
        user_id: block.user_id,
        type: block.type,
        order: block.order,
        clicks: block.clicks,
        config: block.config,
        created_at: block.created_at,
        updated_at: block.updated_at,
      }));

      const resolvedImageUrl = await getFileUrl({
        legacyImageField: image,
        imageFileId: image_file_id,
      });

      // Validate revoName on-chain: check expiry and ownership
      const walletAddress = user.wallet?.address ?? null;
      let resolvedRevoName: string | null = revo_name ?? null;
      let revoNameStatus: "active" | "expired" | "taken" | null = resolvedRevoName
        ? "active"
        : null;

      if (resolvedRevoName) {
        const SUBGRAPH_URL = env.SUBGRAPH_URL;
        if (!SUBGRAPH_URL) {
          // No subgraph URL configured — cannot validate ownership/expiry, clear the name
          console.warn("[revoName] SUBGRAPH_URL not configured, clearing revoName");
          resolvedRevoName = null;
          revoNameStatus = null;
        } else {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          try {
            const labelName = resolvedRevoName.split(".")[0];
            const res = await fetch(SUBGRAPH_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: controller.signal,
              body: JSON.stringify({
                query: `query ($l: String!) { revoNames(where: { labelName: $l }) { expiryDateWithGrace owner } }`,
                variables: { l: labelName },
              }),
            });

            if (!res.ok) {
              throw new Error(`Subgraph responded with status ${res.status}`);
            }

            const json = await res.json();

            if (json?.errors?.length) {
              console.warn("[revoName] Subgraph returned GraphQL errors:", json.errors);
            }

            const parsed = RevoNameSubgraphSchema.safeParse(json);
            if (!parsed.success) {
              console.warn("[revoName] Subgraph returned invalid data:", parsed.error.flatten());
              resolvedRevoName = null;
              revoNameStatus = null;
            } else {
              const details = parsed.data.data.revoNames[0];
              if (!details) {
                resolvedRevoName = null;
                revoNameStatus = null;
              } else {
                const expiryTimestamp = Number(details.expiryDateWithGrace);
                const nowInSeconds = Math.floor(Date.now() / 1000);
                if (expiryTimestamp > 0 && expiryTimestamp < nowInSeconds) {
                  resolvedRevoName = null;
                  revoNameStatus = "expired";
                } else if (
                  walletAddress &&
                  details.owner.toLowerCase() !== walletAddress.toLowerCase()
                ) {
                  resolvedRevoName = null;
                  revoNameStatus = "taken";
                }
              }
            }
          } catch (err) {
            console.warn("[revoName] Subgraph validation failed, clearing revoName:", err);
            resolvedRevoName = null;
            revoNameStatus = null;
          } finally {
            clearTimeout(timeout);
          }
        }
      }

      const result = {
        user: {
          id: user_id,
          name,
          email,
          revoName: resolvedRevoName,
          revoNameStatus,
          originalRevoName: revo_name ?? null,
          description,
          image: resolvedImageUrl,
        },
        theme: publicTheme,
        blocks: publicBlocks,
        hasCreatorPool,
        indexable: isUserIndexable(user, blocks.length),
      };

      return result;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  // Number of profiles that may be listed in the sitemap
  getSitemapCount: publicProcedure.query(async () => {
    try {
      const total = await prisma.user.count({ where: indexableUserWhere });
      return { total };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  // One page of indexable profiles for the sitemap. Returns public data only.
  getSitemapEntries: publicProcedure
    .input(
      z.object({
        page: z.number().int().min(0),
        pageSize: z.number().int().min(1).max(SITEMAP_MAX_PAGE_SIZE),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize } = input;

      try {
        const users = await prisma.user.findMany({
          where: indexableUserWhere,
          orderBy: { id: "asc" },
          skip: page * pageSize,
          take: pageSize,
          select: { id: true, handle: true, created_at: true, updated_at: true },
        });

        if (users.length === 0) return [];

        const latestBlocks = await prisma.block.groupBy({
          by: ["user_id"],
          where: { user_id: { in: users.map(user => user.id) } },
          _max: { updated_at: true, created_at: true },
        });

        const latestBlockByUser = new Map<number, Date>();
        for (const row of latestBlocks) {
          const candidates = [row._max.updated_at, row._max.created_at].filter(
            (date): date is Date => date !== null
          );
          if (candidates.length > 0) {
            latestBlockByUser.set(
              row.user_id,
              new Date(Math.max(...candidates.map(date => date.getTime())))
            );
          }
        }

        return users
          .filter((user): user is typeof user & { handle: string } => user.handle !== null)
          .map(user => {
            const dates = [user.created_at, user.updated_at, latestBlockByUser.get(user.id)].filter(
              (date): date is Date => date !== null && date !== undefined
            );
            const lastModified = new Date(Math.max(...dates.map(date => date.getTime())));
            return { handle: user.handle.toLowerCase(), lastModified: lastModified.toISOString() };
          });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server error",
        });
      }
    }),
});

export default appRouter;
