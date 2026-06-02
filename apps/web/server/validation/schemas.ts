import { z } from "zod";

export const suiAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Enter a valid 32-byte Sui address.");

export const walletKindSchema = z.enum(["USER", "DAO", "TREASURY", "NFT_COLLECTION", "CONTRACT"]);

export const snapshotCaptureSchema = z.object({
  walletAddress: suiAddressSchema,
  walletKind: walletKindSchema.default("USER"),
  label: z.string().trim().max(80).optional(),
  makePublic: z.boolean().default(true),
  anchorOnchain: z.boolean().default(false)
});

export const replayQuerySchema = z.object({
  walletAddress: suiAddressSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

export const tatumRpcSchema = z.object({
  jsonrpc: z.literal("2.0").default("2.0"),
  id: z.union([z.string(), z.number()]).default("proofcast"),
  method: z.string().min(1),
  params: z.array(z.unknown()).default([])
});

export const aiReportSchema = z.object({
  activitySummary: z.string(),
  riskScore: z.number().int().min(0).max(100),
  riskAnalysis: z.string(),
  changeDetection: z.string(),
  humanReport: z.string(),
  chainMemoryTitle: z.string().optional(),
  chainMemoryStory: z.string().optional()
});

export type SnapshotCaptureInput = z.infer<typeof snapshotCaptureSchema>;
export type TatumRpcInput = z.infer<typeof tatumRpcSchema>;
export type AIReportOutput = z.infer<typeof aiReportSchema>;
