import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, privateProcedure, adminProcedure } from "../trpc/trpc";
import {
  calculateRevoAmount,
  createConversionMessage,
  createNdauConversionPayloadYaml,
  KNOWN_NDAU_GROUPS,
  VALID_DOCUMENT_HASHES,
} from "@repo/constants";
import { prisma } from "../services/DB";
import type { NdauConversion } from "../lib/prisma/index.js";
import { createPublicClient, http, parseEther, formatEther } from "viem";
import { libertasTestnet } from "@repo/web3";
import { verifyConversionSignature, verifyNdauSignature } from "../utils/ndau";
import { recoverAddress, hashMessage } from "viem";

type ConversionTxidCheck = {
  txid: string;
  expectedRevoAddress: string;
  expectedRevoAmount: string;
};

type ConversionTxidResult = {
  txid: string;
  success: boolean;
  error?: string;
};

/**
 * Validate multiple conversion txids on-chain using a single publicClient.
 * Returns per-txid results so callers know which passed and which failed.
 */
async function validateConversionTxidsBatch(
  conversions: ConversionTxidCheck[]
): Promise<ConversionTxidResult[]> {
  const chain = libertasTestnet;
  const publicClient = createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0], {
      timeout: 20_000,
    }),
  });

  const results: ConversionTxidResult[] = [];

  for (const conv of conversions) {
    try {
      const tx = await publicClient.getTransaction({ hash: conv.txid as `0x${string}` });

      if (!tx) {
        results.push({ txid: conv.txid, success: false, error: "Transaction not found on-chain" });
        continue;
      }

      if (tx.to?.toLowerCase() !== conv.expectedRevoAddress.toLowerCase()) {
        results.push({
          txid: conv.txid,
          success: false,
          error: `Transaction recipient mismatch. Expected: ${conv.expectedRevoAddress}, Got: ${tx.to}`,
        });
        continue;
      }

      const expectedValue = parseEther(conv.expectedRevoAmount);
      if (tx.value < expectedValue) {
        results.push({
          txid: conv.txid,
          success: false,
          error: `Transaction value insufficient. Expected at least: ${conv.expectedRevoAmount} REVO, Got: ${formatEther(tx.value)} REVO`,
        });
        continue;
      }

      const receipt = await publicClient.getTransactionReceipt({
        hash: conv.txid as `0x${string}`,
      });

      if (receipt.status !== "success") {
        results.push({ txid: conv.txid, success: false, error: "Transaction failed on-chain" });
        continue;
      }

      results.push({ txid: conv.txid, success: true });
    } catch (err) {
      results.push({
        txid: conv.txid,
        success: false,
        error: err instanceof Error ? err.message : "Unknown validation error",
      });
    }
  }

  return results;
}

/**
 * Validate a single conversion txid (thin wrapper around the batch function).
 * Used by confirmConversionTxid and markConversionCompleted.
 */
async function validateConversionTxid(
  txid: string,
  expectedRevoAddress: string,
  expectedRevoAmount: string
): Promise<void> {
  const results = await validateConversionTxidsBatch([
    { txid, expectedRevoAddress, expectedRevoAmount },
  ]);
  const result = results[0];
  if (!result.success) {
    throw new Error(result.error ?? "Validation failed");
  }
}

/**
 * A conversion pays out once. Once a txid is recorded, only that same txid may be
 * submitted again (retries); any other hash means a second payment and is refused.
 */
function assertNoOtherTxidRecorded(recordedTxid: string | null, incomingTxid: string): void {
  if (recordedTxid && recordedTxid.toLowerCase() !== incomingTxid.toLowerCase()) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `A different transaction is already recorded for this conversion: ${recordedTxid}`,
    });
  }
}

export const ndauConversionRouter = router({
  checkExistingConversion: privateProcedure
    .input(
      z.object({
        ndauAddress: z.string().min(1, "NDAU address is required"),
      })
    )
    .query(async ({ input }) => {
      const existing = await prisma.ndauConversion.findFirst({
        where: { ndau_address: input.ndauAddress },
        select: { id: true, status: true },
      });

      return {
        exists: !!existing,
        status: existing?.status ?? null,
      };
    }),

  getNdauBalance: publicProcedure
    .input(
      z.object({
        ndauAddress: z.string().min(1, "NDAU address is required"),
      })
    )
    .query(async ({ input }) => {
      const { ndauAddress } = input;

      try {
        const ndauApiUrl = "https://mainnet-0.ndau.tech:3030";

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const url = `${ndauApiUrl}/account/account/${ndauAddress}`;

          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data && data[ndauAddress] && data[ndauAddress].balance !== undefined) {
            const balanceInNanondau = parseFloat(data[ndauAddress].balance);
            const balanceInNdau = balanceInNanondau / 100000000;

            return {
              success: true,
              balance: balanceInNdau.toString(),
              rawBalance: data[ndauAddress].balance,
              validationKeys: data[ndauAddress].validationKeys || [],
            };
          } else {
            throw new Error("Invalid response from NDAU API");
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } catch (error) {
        return {
          success: false,
          balance: "0",
          error: error instanceof Error ? error.message : "Failed to fetch NDAU balance",
        };
      }
    }),

  submitConversion: privateProcedure
    .input(
      z.object({
        ndauAddress: z.string().min(1, "NDAU address is required"),
        revoAddress: z.string().min(1, "REVO address is required"),
        ampedbioSignature: z.string().min(1, "AmpedBio signature is required"),
        ndauSignature: z.string().min(1, "NDAU signature is required"),
        ndauValidationKey: z.string().optional(),
        documentHash: z.string().min(1, "Document hash is required"),
        timestamp: z.number().min(1, "Timestamp is required"),
        clientValidationKeys: z.array(z.string()).optional(),
        clientPublicKey: z.string().optional(),
        group: z.string().default("gn"),
      })
    )
    .mutation(async ({ input }) => {
      const {
        ndauAddress,
        revoAddress,
        ampedbioSignature,
        ndauSignature,
        documentHash,
        timestamp,
        group,
      } = input;

      const resolvedGroup = KNOWN_NDAU_GROUPS.includes(group as (typeof KNOWN_NDAU_GROUPS)[number])
        ? group
        : "gn";

      const expectedHash = VALID_DOCUMENT_HASHES[resolvedGroup];
      if (!expectedHash || documentHash !== expectedHash) {
        throw new Error(
          "Invalid document hash. The provided document hash does not match the agreement document for the specified group."
        );
      }

      const existing = await prisma.ndauConversion.findFirst({
        where: { ndau_address: ndauAddress },
      });

      if (existing) {
        throw new Error("A conversion request already exists for this NDAU address");
      }

      let ndauAmount: string;
      let blockchainValidationKey: string;
      let rawAccountData: Record<string, unknown>;

      try {
        const ndauApiUrl = "https://mainnet-0.ndau.tech:3030";
        const url = `${ndauApiUrl}/account/account/${ndauAddress}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data[ndauAddress] && data[ndauAddress].balance !== undefined) {
          const balanceInNanondau = parseFloat(data[ndauAddress].balance);
          const balanceInNdau = balanceInNanondau / 100000000;

          if (balanceInNdau <= 0) {
            throw new Error("NDAU balance must be greater than 0");
          }

          ndauAmount = balanceInNdau.toString();
          rawAccountData = data[ndauAddress];

          const accountData = data[ndauAddress];

          if (
            !accountData.validationKeys ||
            !Array.isArray(accountData.validationKeys) ||
            accountData.validationKeys.length === 0
          ) {
            throw new Error("No validation keys found for this NDAU account");
          }

          blockchainValidationKey = accountData.validationKeys[0];

          console.log(
            JSON.stringify({
              event: "[NDAU-CONVERSION] submitConversion - Blockchain account data",
              ndauAddress,
              publicKey: blockchainValidationKey,
              allValidationKeys: accountData.validationKeys,
              rawAccountFields: Object.keys(rawAccountData),
              rawAccountData,
            })
          );
        } else {
          throw new Error("Invalid response from NDAU API");
        }
      } catch (error) {
        throw new Error(
          `Failed to fetch NDAU account data: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }

      const revoAmount = calculateRevoAmount(ndauAmount);

      const ampedbioMessage = createConversionMessage({
        ndauAddress,
        revoAddress,
        ndauAmount,
        revoAmount,
        documentHash,
        timestamp,
      });

      const recoveredAddress = await recoverAddress({
        hash: hashMessage(ampedbioMessage),
        signature: ampedbioSignature as `0x${string}`,
      });

      if (recoveredAddress.toLowerCase() !== revoAddress.toLowerCase()) {
        throw new Error(
          "AmpedBio signature verification failed. The signature does not match the REVO address."
        );
      }

      const ndauVerification = await verifyConversionSignature(
        ndauSignature,
        ndauAddress,
        revoAddress,
        blockchainValidationKey,
        ndauAmount,
        revoAmount,
        timestamp,
        documentHash
      );

      if (!ndauVerification.isValid) {
        console.error(
          JSON.stringify({
            event: "[NDAU-CONVERSION] submitConversion - NDAU signature verification FAILED",
            ...ndauVerification,
          })
        );
        throw new Error(
          `NDAU signature verification failed: ${ndauVerification.error || "Invalid signature"}`
        );
      }

      const conversion = await prisma.ndauConversion.create({
        data: {
          ndau_address: ndauAddress,
          ndau_amount: ndauAmount,
          revo_amount: revoAmount,
          revo_address: revoAddress,
          ampedbio_signature: ampedbioSignature,
          ndau_signature: ndauSignature,
          ndau_validation_key: blockchainValidationKey,
          status: "pending",
          document_hash: documentHash,
          timestamp,
          group: resolvedGroup,
        },
      });

      return {
        success: true,
        message: "Conversion request submitted successfully",
        conversion: {
          id: conversion.id,
          ndauAddress: conversion.ndau_address,
          ndauAmount: conversion.ndau_amount,
          revoAmount: conversion.revo_amount,
          revoAddress: conversion.revo_address,
          ampedbioSignature: conversion.ampedbio_signature,
          ndauSignature: conversion.ndau_signature,
          status: conversion.status,
          createdAt: conversion.created_at.toISOString(),
          documentHash: conversion.document_hash,
          timestamp: conversion.timestamp,
          group: conversion.group,
        },
      };
    }),

  /**
   * Get all conversion requests (admin only)
   */
  getAllConversions: adminProcedure.query(async () => {
    const conversions = await prisma.ndauConversion.findMany({
      orderBy: { created_at: "desc" },
    });

    // Auto-resolve "processing" conversions whose txids are now confirmed on-chain
    const processingConversions = conversions.filter(
      (c: NdauConversion) => c.status === "processing" && c.txid
    );

    if (processingConversions.length > 0) {
      const batchResults = await validateConversionTxidsBatch(
        processingConversions.map((c: NdauConversion) => ({
          txid: c.txid!,
          expectedRevoAddress: c.revo_address,
          expectedRevoAmount: c.revo_amount,
        }))
      );

      // Build a lookup from txid to conversion for fast matching
      const convByTxid = new Map(processingConversions.map((c: NdauConversion) => [c.txid!, c]));

      for (const result of batchResults) {
        if (result.success) {
          const conv = convByTxid.get(result.txid);
          if (conv) {
            await prisma.ndauConversion.update({
              where: { id: conv.id },
              data: {
                status: "processed",
                updated_at: new Date(),
              },
            });
            // Update the in-memory object so the returned list reflects the change
            conv.status = "processed";
            conv.updated_at = new Date();
          }
        }
        // Non-success results stay "processing" — no action needed
      }
    }

    const revoAddresses = [...new Set(conversions.map(c => c.revo_address).filter(Boolean))];

    const userByAddress = new Map<string, { handle: string } | null>();
    if (revoAddresses.length > 0) {
      const wallets = await prisma.userWallet.findMany({
        where: { address: { in: revoAddresses } },
        include: { user: { select: { handle: true } } },
      });
      for (const wallet of wallets) {
        userByAddress.set(
          wallet.address.toLowerCase(),
          wallet.user.handle ? { handle: wallet.user.handle } : null
        );
      }
    }

    return conversions.map((c: NdauConversion) => ({
      id: c.id,
      ndauAddress: c.ndau_address,
      ndauAmount: c.ndau_amount,
      revoAmount: c.revo_amount,
      revoAddress: c.revo_address,
      ampedbioSignature: c.ampedbio_signature,
      ndauSignature: c.ndau_signature,
      txid: c.txid,
      status: c.status,
      createdAt: c.created_at.toISOString(),
      updatedAt: c.updated_at?.toISOString() || null,
      user: userByAddress.get(c.revo_address.toLowerCase()) ?? null,
      group: c.group,
    }));
  }),

  /**
   * Get a single conversion by ID (admin only)
   * Used for pre-check before opening the Process dialog
   */
  getConversionById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const conversion = await prisma.ndauConversion.findUnique({
      where: { id: input.id },
    });

    if (!conversion) {
      throw new Error("Conversion request not found");
    }

    return {
      id: conversion.id,
      txid: conversion.txid,
      status: conversion.status,
    };
  }),

  /**
   * Lock a pending conversion before the admin's wallet opens (admin only).
   * Atomic: only one admin can move a request from pending to processing, so two
   * admins can never both send for the same request. A processing row with no txid
   * means "claimed, send in progress or interrupted".
   */
  claimConversionForProcessing: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const claimed = await prisma.ndauConversion.updateMany({
        where: { id: input.id, status: "pending", txid: null },
        data: { status: "processing", updated_at: new Date() },
      });

      if (claimed.count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This conversion is already being processed or has been processed",
        });
      }

      return { success: true };
    }),

  /**
   * Return a claimed conversion to pending (admin only). Allowed only while no
   * transaction hash is recorded, i.e. the admin cancelled or the wallet declined
   * before anything was sent.
   */
  releaseConversionClaim: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const released = await prisma.ndauConversion.updateMany({
        where: { id: input.id, status: "processing", txid: null },
        data: { status: "pending", updated_at: new Date() },
      });

      if (released.count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This conversion has a recorded transaction or is no longer processing, so it cannot be released",
        });
      }

      return { success: true };
    }),

  /**
   * Confirm a conversion txid from MetaMask (admin only)
   * Saves txid immediately with "processing" status, then validates on-chain.
   * Idempotent for the same txid, so the admin UI can safely retry after a failed
   * call. A different txid never overwrites one that is already recorded.
   */
  confirmConversionTxid: adminProcedure
    .input(
      z.object({
        id: z.number(),
        txid: z.string().min(1, "Transaction ID is required"),
      })
    )
    .mutation(async ({ input }) => {
      const { id, txid } = input;

      const conversion = await prisma.ndauConversion.findUnique({
        where: { id },
      });

      if (!conversion) {
        throw new Error("Conversion request not found");
      }

      if (conversion.status === "processed") {
        throw new Error("This conversion has already been processed");
      }

      if (conversion.status !== "pending" && conversion.status !== "processing") {
        throw new Error(
          `Conversion cannot be processed in its current state: ${conversion.status}`
        );
      }

      assertNoOtherTxidRecorded(conversion.txid, txid);

      // Write only if no txid is recorded yet, or the same one is (a retry).
      // Guards against a race with another admin between the read above and this write.
      const written = await prisma.ndauConversion.updateMany({
        where: { id, OR: [{ txid: null }, { txid }] },
        data: {
          txid,
          status: "processing",
          updated_at: new Date(),
        },
      });

      if (written.count === 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A different transaction is already recorded for this conversion",
        });
      }

      const updatedConversion = await prisma.ndauConversion.findUniqueOrThrow({
        where: { id },
      });

      try {
        await validateConversionTxid(txid, conversion.revo_address, conversion.revo_amount);

        const confirmedConversion = await prisma.ndauConversion.update({
          where: { id },
          data: {
            status: "processed",
            updated_at: new Date(),
          },
        });

        return {
          success: true,
          message: "Conversion confirmed and validated on-chain",
          conversion: {
            id: confirmedConversion.id,
            ndauAddress: confirmedConversion.ndau_address,
            ndauAmount: confirmedConversion.ndau_amount,
            revoAmount: confirmedConversion.revo_amount,
            revoAddress: confirmedConversion.revo_address,
            txid: confirmedConversion.txid,
            status: confirmedConversion.status,
          },
        };
      } catch {
        return {
          success: true,
          message: "TXID recorded. On-chain validation pending.",
          conversion: {
            id: updatedConversion.id,
            ndauAddress: updatedConversion.ndau_address,
            ndauAmount: updatedConversion.ndau_amount,
            revoAmount: updatedConversion.revo_amount,
            revoAddress: updatedConversion.revo_address,
            txid: updatedConversion.txid,
            status: updatedConversion.status,
          },
        };
      }
    }),

  /**
   * Mark a conversion as completed by providing a txid (admin only)
   * Opens a dialog in the admin UI for manually entering a txid
   */
  markConversionCompleted: adminProcedure
    .input(
      z.object({
        id: z.number(),
        txid: z.string().min(1, "Transaction ID is required"),
      })
    )
    .mutation(async ({ input }) => {
      const { id, txid } = input;

      const conversion = await prisma.ndauConversion.findUnique({
        where: { id },
      });

      if (!conversion) {
        throw new Error("Conversion request not found");
      }

      if (conversion.status === "processed") {
        throw new Error("This conversion has already been processed");
      }

      if (conversion.status !== "pending" && conversion.status !== "processing") {
        throw new Error(
          `Conversion cannot be processed in its current state: ${conversion.status}`
        );
      }

      assertNoOtherTxidRecorded(conversion.txid, txid);

      await validateConversionTxid(txid, conversion.revo_address, conversion.revo_amount);

      const updatedConversion = await prisma.ndauConversion.update({
        where: { id },
        data: {
          txid,
          status: "processed",
          updated_at: new Date(),
        },
      });

      return {
        success: true,
        message: "Conversion marked as completed successfully",
        conversion: {
          id: updatedConversion.id,
          ndauAddress: updatedConversion.ndau_address,
          ndauAmount: updatedConversion.ndau_amount,
          revoAmount: updatedConversion.revo_amount,
          revoAddress: updatedConversion.revo_address,
          txid: updatedConversion.txid,
          status: updatedConversion.status,
        },
      };
    }),

  /**
   * Get pending conversions count (for admin dashboard)
   */
  getPendingConversionsCount: adminProcedure.query(async () => {
    const count = await prisma.ndauConversion.count({
      where: { status: "pending" },
    });
    return { count };
  }),

  getConversionPayload: publicProcedure
    .input(
      z.object({
        ndauAddress: z.string().min(1, "NDAU address is required"),
        revoAddress: z.string().min(1, "REVO address is required"),
        ndauAmount: z.string().min(1, "NDAU amount is required"),
        revoAmount: z.string().min(1, "REVO amount is required"),
        documentHash: z.string().min(1, "Document hash is required"),
        timestamp: z.number().min(1, "Timestamp is required"),
        ndauValidationKey: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const ndauApiUrl = "https://mainnet-0.ndau.tech:3030";
        const url = `${ndauApiUrl}/account/account/${input.ndauAddress}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ndau account: HTTP ${response.status}`);
        }

        const data = await response.json();
        const accountData = data[input.ndauAddress];

        if (!accountData?.validationKeys?.length) {
          throw new Error("No validation keys found for this NDAU account");
        }

        const blockchainValidationKey = accountData.validationKeys[0];

        const payloadYaml = createNdauConversionPayloadYaml({
          ndauAddress: input.ndauAddress,
          revoAddress: input.revoAddress,
          ndauAmount: input.ndauAmount,
          revoAmount: input.revoAmount,
          documentHash: input.documentHash,
          timestamp: input.timestamp,
          ndauValidationKey: blockchainValidationKey,
        });

        return { payloadYaml, validationKey: blockchainValidationKey };
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "[NDAU-CONVERSION] getConversionPayload FAILED",
            error: error instanceof Error ? error.message : String(error),
          })
        );
        throw error;
      }
    }),

  getConversion: publicProcedure
    .input(
      z.object({
        ndauAddress: z.string().min(1, "NDAU address is required"),
      })
    )
    .query(async ({ input }) => {
      const conversion = await prisma.ndauConversion.findUnique({
        where: { ndau_address: input.ndauAddress },
      });

      if (!conversion) {
        return null;
      }

      const payloadYaml = createNdauConversionPayloadYaml({
        ndauAddress: conversion.ndau_address,
        revoAddress: conversion.revo_address,
        ndauValidationKey: conversion.ndau_validation_key,
        ndauAmount: conversion.ndau_amount,
        revoAmount: conversion.revo_amount,
        timestamp: conversion.timestamp,
        documentHash: conversion.document_hash,
      });

      return {
        id: conversion.id,
        ndauAddress: conversion.ndau_address,
        ndauAmount: conversion.ndau_amount,
        revoAmount: conversion.revo_amount,
        revoAddress: conversion.revo_address,
        ampedbioSignature: conversion.ampedbio_signature,
        ndauSignature: conversion.ndau_signature,
        txid: conversion.txid,
        status: conversion.status,
        createdAt: conversion.created_at.toISOString(),
        updatedAt: conversion.updated_at?.toISOString() || null,
        documentHash: conversion.document_hash,
        timestamp: conversion.timestamp,
        payloadYaml,
        group: conversion.group,
      };
    }),

  verifyNdauSignature: publicProcedure
    .input(
      z.object({
        ndauAddress: z.string().min(1, "NDAU address is required"),
      })
    )
    .query(async ({ input }) => {
      const conversion = await prisma.ndauConversion.findUnique({
        where: { ndau_address: input.ndauAddress },
      });

      if (!conversion) {
        return {
          found: false,
          isValid: false,
          error: "No conversion found for this NDAU address",
        };
      }

      const result = await verifyConversionSignature(
        conversion.ndau_signature,
        conversion.ndau_address,
        conversion.revo_address,
        conversion.ndau_validation_key,
        conversion.ndau_amount,
        conversion.revo_amount,
        conversion.timestamp,
        conversion.document_hash
      );

      return {
        found: true,
        isValid: result.isValid,
        algorithm: result.algorithm,
        error: result.error,
        conversion: {
          ndauAddress: conversion.ndau_address,
          revoAddress: conversion.revo_address,
          ndauAmount: conversion.ndau_amount,
          revoAmount: conversion.revo_amount,
          status: conversion.status,
          createdAt: conversion.created_at.toISOString(),
        },
      };
    }),

  debugVerifySignature: publicProcedure
    .input(
      z.object({
        signature: z.string().min(1),
        payloadBase64: z.string().min(1),
        ndauAccount: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const yaml = await import("yaml");
      const { createHash } = await import("crypto");

      const NDAU_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
      function b32Decode(str: string): Uint8Array {
        let bits = 0;
        let value = 0;
        let index = 0;
        const output = new Uint8Array(Math.ceil((str.length * 5) / 8));
        for (let i = 0; i < str.length; i++) {
          const charIndex = NDAU_ALPHABET.indexOf(str[i].toLowerCase());
          if (charIndex === -1) throw new Error(`Invalid base32 character: ${str[i]}`);
          value = (value << 5) | charIndex;
          bits += 5;
          if (bits >= 8) {
            bits -= 8;
            output[index++] = (value >>> bits) & 255;
          }
        }
        return output.slice(0, index);
      }

      const SIZE_224 = 28;
      function cksumN(input: Uint8Array, n: number): Uint8Array {
        const sum = createHash("sha224").update(input).digest();
        return new Uint8Array(sum).slice(SIZE_224 - n);
      }
      function checkChecksum(checked: Uint8Array): { message: Uint8Array; valid: boolean } {
        if (checked.length < 4) return { message: new Uint8Array(), valid: false };
        const n = checked[0];
        const last = checked.length - n;
        if (last < 1) return { message: new Uint8Array(), valid: false };
        const message = checked.slice(1, last);
        const sumActual = checked.slice(last);
        const sumExpect = cksumN(message, n);
        return {
          message,
          valid: Buffer.from(sumActual).compare(Buffer.from(sumExpect)) === 0,
        };
      }
      function unmarshalMsg(bts: Uint8Array): { algorithm: string; data: Uint8Array } {
        if (bts.length < 1) throw new Error("too few bytes");
        let zb0001: number | undefined;
        const lead = bts[0];
        if ((lead & 0xf0) === 0x90) {
          zb0001 = lead & 0x0f;
          bts = bts.slice(1);
        }
        if (zb0001 !== 2) throw new Error(`Wanted fixarray(2), Got: ${zb0001}`);
        const algoId = bts[0] & 0xff;
        bts = bts.slice(1);
        const algorithmMap: Record<number, string> = { 1: "Ed25519", 2: "Secp256k1" };
        const algorithm = algorithmMap[algoId];
        if (!algorithm) throw new Error(`Unknown algorithm: ${algoId}`);
        if (bts[0] !== 0xc4) throw new Error(`Expected bin8, got: 0x${bts[0].toString(16)}`);
        const dataLen = bts[1];
        bts = bts.slice(2);
        if (bts.length < dataLen) throw new Error("too few bytes for data");
        return { algorithm, data: bts.slice(0, dataLen) };
      }
      function unpack(data: Uint8Array): { key: Uint8Array; extra: Uint8Array } {
        if (data.length === 0) throw new Error("empty data");
        const lk = data[0];
        const split = 1 + lk;
        if (data.length < split) throw new Error("too few bytes");
        return { key: data.slice(1, split), extra: data.slice(split) };
      }
      function parseNdauPublicKey(npub: string): { algorithm: string; key: Uint8Array } {
        if (!npub.startsWith("npub")) throw new Error("must start with npub");
        const bytes = b32Decode(npub.slice(4));
        const { message, valid } = checkChecksum(bytes);
        if (!valid) throw new Error("bad checksum");
        const { algorithm, data } = unmarshalMsg(message);
        const { key } = unpack(data);
        return { algorithm, key };
      }
      function parseNdauSignature(sig: string): { algorithm: string; data: Uint8Array } {
        const bytes = b32Decode(sig);
        const { message, valid } = checkChecksum(bytes);
        if (!valid) throw new Error("bad checksum");
        return unmarshalMsg(message);
      }

      const steps: Record<string, unknown> = {};

      steps.step1_rawPayloadBase64 = input.payloadBase64;
      steps.step1_payloadBase64Length = input.payloadBase64.length;

      const decoded = Buffer.from(input.payloadBase64, "base64").toString("utf8");
      steps.step2_decodedUtf8 = decoded;
      steps.step2_decodedLength = decoded.length;

      const parsed = yaml.parse(decoded);
      steps.step3_parsedYaml = parsed;

      const ballot = {
        vote: parsed.vote,
        proposal: {
          proposal_id: parsed.proposal.proposal_id,
          proposal_heading: parsed.proposal.proposal_heading,
          voting_option_id: parsed.proposal.voting_option_id,
          voting_option_heading: parsed.proposal.voting_option_heading,
        },
        wallet_address: parsed.wallet_address,
        validation_key: parsed.validation_key,
      };
      const walletBallotYaml = yaml.stringify(ballot);
      steps.step4_walletBallotYaml = walletBallotYaml;
      steps.step4_walletBallotYamlLength = walletBallotYaml.length;
      steps.step4_walletBallotYamlBytes = Buffer.from(walletBallotYaml).length;

      const walletBallotBase64 = Buffer.from(walletBallotYaml).toString("base64");
      steps.step5_walletBallotBase64 = walletBallotBase64;
      steps.step5_walletBallotBase64Length = walletBallotBase64.length;

      const sig = parseNdauSignature(input.signature);
      steps.step6_sigAlgorithm = sig.algorithm;
      steps.step6_sigDataHex = Buffer.from(sig.data).toString("hex");
      steps.step6_sigDataLength = sig.data.length;

      const pk = parseNdauPublicKey(input.ndauAccount);
      steps.step7_pkAlgorithm = pk.algorithm;
      steps.step7_pkKeyHex = Buffer.from(pk.key).toString("hex");
      steps.step7_pkKeyLength = pk.key.length;

      const bytePayload = new Uint8Array(Buffer.from(walletBallotYaml, "binary"));
      steps.step8_bytePayloadLength = bytePayload.length;
      steps.step8_bytePayloadHex =
        Buffer.from(bytePayload).toString("hex").substring(0, 100) + "...";

      const preHash = createHash("sha256").update(bytePayload).digest();
      steps.step9_preHashedSha256 = preHash.toString("hex");

      let isValid = false;
      let verifyMethod = "none";

      if (sig.algorithm === "Secp256k1" && pk.algorithm === "Secp256k1") {
        const secp256k1 = await import("@noble/secp256k1");
        const secpVersion = (await import("@noble/secp256k1/package.json")).version;
        steps.step10_secp256k1Version = secpVersion;

        secp256k1.hashes.sha256 = (msg: Uint8Array) => createHash("sha256").update(msg).digest();

        function derToCompact(der: Uint8Array): Uint8Array {
          if (der[0] !== 0x30) throw new Error("Not a DER signature");
          let offset = 2;
          if (der[offset] !== 0x02) throw new Error("Expected 0x02 for r");
          offset++;
          const rLen = der[offset];
          offset++;
          const r = der.slice(offset, offset + rLen);
          offset += rLen;
          if (der[offset] !== 0x02) throw new Error("Expected 0x02 for s");
          offset++;
          const sLen = der[offset];
          offset++;
          const s = der.slice(offset, offset + sLen);
          const compact = new Uint8Array(64);
          compact.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
          compact.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
          return compact;
        }

        const compactSig = derToCompact(sig.data);
        steps.step11_compactSigHex = Buffer.from(compactSig).toString("hex");
        steps.step11_compactSigLength = compactSig.length;

        try {
          const resultA = secp256k1.verify(compactSig, bytePayload, pk.key);
          steps.step12_verifyCompactRawBytes = resultA;
          verifyMethod = "v3-compact-raw";
          isValid = resultA;
        } catch (e) {
          steps.step12_verifyCompactRawBytes_error = (e as Error).message;
        }

        try {
          const resultB = secp256k1.verify(compactSig, preHash, pk.key);
          steps.step13_verifyCompactPreHash = resultB;
          if (resultB) {
            isValid = true;
            verifyMethod = "v3-compact-prehash";
          }
        } catch (e) {
          steps.step13_verifyCompactPreHash_error = (e as Error).message;
        }

        try {
          const resultC = secp256k1.verify(compactSig, preHash, pk.key, { lowS: false });
          steps.step14_verifyCompactPreHashLowS = resultC;
          if (resultC) {
            isValid = true;
            verifyMethod = "v3-compact-prehash-lowS";
          }
        } catch (e) {
          steps.step14_verifyCompactPreHashLowS_error = (e as Error).message;
        }
      }

      if (sig.algorithm === "Ed25519" && pk.algorithm === "Ed25519") {
        const ed = await import("@noble/ed25519");
        const edVersion = (await import("@noble/ed25519/package.json")).version;
        steps.step10_ed25519Version = edVersion;

        const hexPayload = Buffer.from(walletBallotYaml).toString("hex");
        steps.step11_edHexPayload = hexPayload.substring(0, 100) + "...";

        try {
          const resultA = await ed.verify(sig.data, hexPayload as unknown as Uint8Array, pk.key);
          steps.step12_edVerifyWithHex = resultA;
          isValid = resultA;
          verifyMethod = "ed25519-hex";
        } catch (e) {
          steps.step12_edVerifyWithHex_error = (e as Error).message;
        }

        try {
          const resultB = await ed.verify(sig.data, bytePayload, pk.key);
          steps.step13_edVerifyWithRawBytes = resultB;
        } catch (e) {
          steps.step13_edVerifyWithRawBytes_error = (e as Error).message;
        }
      }

      steps.step_final_isValid = isValid;
      steps.step_final_verifyMethod = verifyMethod;

      const ndauTsResult = await verifyNdauSignature(
        input.signature,
        walletBallotBase64,
        input.ndauAccount
      );
      steps.step_final_ndauTsVerifyResult = ndauTsResult;

      return steps;
    }),
});
