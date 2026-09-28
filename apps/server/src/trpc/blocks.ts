import { privateProcedure, publicProcedure, router } from "./trpc";
import { z } from "zod";
import { prisma } from "../services/DB";
import { TRPCError } from "@trpc/server";
import { addBlockSchema, blockIdParamSchema, editBlocksSchema } from "@repo/constants";
import { sanitizeBlockConfig } from "../utils/sanitizeBlockConfig";

export const blocksRouter = router({
  // Get all blocks for the user
  getAll: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user!.sub;

    try {
      const result = await prisma.block.findMany({
        where: {
          user_id: userId,
        },
      });

      return { result };
    } catch (error) {
      console.error("error getting all blocks", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  // Get a specific block by ID
  get: privateProcedure.input(blockIdParamSchema).query(async ({ input }) => {
    const { id: blockId } = input;
    const id = Number(blockId);

    try {
      const result = await prisma.block.findUnique({
        where: {
          id: id,
        },
      });

      if (result === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Block not found: ${id}`,
        });
      }

      return { result };
    } catch (error) {
      console.error("error getting block", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  // Edit a single block
  editBlock: privateProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.string(),
        order: z.number(),
        config: z.any(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.sub;
      const { id, type, order } = input;
      const config = sanitizeBlockConfig(type, input.config);

      try {
        const block = await prisma.block.findUnique({
          where: {
            id: id,
            user_id: userId,
          },
        });

        if (block === null) {
          const result = await prisma.block.create({
            data: {
              user_id: userId,
              type,
              order,
              config,
            },
          });

          return { result };
        }

        const result = await prisma.block.update({
          where: { id: id },
          data: {
            type,
            order,
            config,
          },
        });

        return { result };
      } catch (error) {
        console.error(`error editing block ${id}`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server error",
        });
      }
    }),

  editBlocks: privateProcedure.input(editBlocksSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user!.sub;
    const { blocks } = input;

    try {
      for (let idx = 0; idx < blocks.length; idx++) {
        const { id, type } = blocks[idx];
        const config = sanitizeBlockConfig(type, blocks[idx].config);

        const block = await prisma.block.findUnique({
          where: {
            id: id,
            user_id: userId,
          },
        });

        if (block === null) {
          await prisma.block.create({
            data: {
              user_id: userId,
              type,
              order: idx,
              config: config as any,
            },
          });
        } else {
          await prisma.block.update({
            where: { id: id },
            data: {
              type,
              order: idx,
              config: config as any,
            },
          });
        }
      }
      return { message: "Blocks updated successfully" };
    } catch (error) {
      console.error("error editing blocks", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  addBlock: privateProcedure.input(addBlockSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user!.sub;
    const { type } = input;
    const config = sanitizeBlockConfig(type, input.config);

    try {
      const result = await prisma.$transaction(async tx => {
        if (type === "referral") {
          const existingReferralBlock = await tx.block.findFirst({
            where: {
              user_id: userId,
              type: "referral",
            },
          });

          if (existingReferralBlock) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "You can only have one Referral Link block per profile",
            });
          }
        }

        return await tx.block.create({
          data: {
            user_id: userId,
            type,
            order: 0,
            config: config as any,
          },
        });
      });
      return { message: "Block added successfully", result };
    } catch (error) {
      console.error("error adding block", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  deleteBlock: privateProcedure.input(blockIdParamSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user!.sub;

    try {
      const block = await prisma.block.findUnique({
        where: {
          id: input.id,
          user_id: userId,
        },
      });

      if (block === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Block not found: ${input.id}`,
        });
      }

      const result = await prisma.block.delete({
        where: {
          id: input.id,
          user_id: userId,
        },
      });

      return { result };
    } catch (error) {
      console.error("error deleting block", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server error",
      });
    }
  }),

  registerClick: publicProcedure.input(blockIdParamSchema).mutation(async ({ input }) => {
    const { id } = input;

    try {
      await prisma.block.update({
        where: {
          id: id,
        },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });

      return true;
    } catch (error) {
      console.error(`error registering click for block ${id}`, error);
      return false;
    }
  }),
});
