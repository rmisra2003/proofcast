import { sha256Hex } from "../crypto/hash";
import type { SnapshotPayload } from "./types";

export type TreasuryReport = {
  reportId: string;
  snapshotId: string;
  walletAddress: string;
  generatedAt: string;
  checkpoint?: string;
  walrusSnapshotHash: string;
  previousHash: string | null;
  balances: SnapshotPayload["balances"];
  activity: {
    transactionCount: number;
    nftObjectCount: number;
    eventCount: number;
    inflowMist: string;
    outflowMist: string;
  };
  riskFlags: string[];
  aiSummary: string;
  riskAnalysis: string;
  currentHash: string;
};

export function buildTreasuryReport(payload: SnapshotPayload): TreasuryReport {
  let inflowMist = 0n;
  let outflowMist = 0n;

  for (const transaction of payload.transactions) {
    const amount = BigInt(transaction.amountMist ?? "0");
    if (amount > 0n) inflowMist += amount;
    if (amount < 0n) outflowMist += -amount;
  }

  const riskFlags = [
    payload.riskScore >= 70 ? "High AI risk score" : "",
    outflowMist > inflowMist && outflowMist > 0n ? "Outflows exceed inflows in sampled activity" : "",
    payload.transactions.length === 0 ? "No recent treasury movement found" : "",
    payload.contractEvents.length > 10 ? "High contract-event activity" : ""
  ].filter(Boolean);

  const reportMaterial = {
    reportId: `treasury-${payload.snapshotId}`,
    snapshotId: payload.snapshotId,
    walletAddress: payload.walletAddress,
    generatedAt: new Date().toISOString(),
    checkpoint: payload.checkpoint,
    walrusSnapshotHash: payload.currentHash,
    previousHash: payload.previousHash,
    balances: payload.balances,
    activity: {
      transactionCount: payload.transactions.length,
      nftObjectCount: payload.nfts.length,
      eventCount: payload.contractEvents.length,
      inflowMist: inflowMist.toString(),
      outflowMist: outflowMist.toString()
    },
    riskFlags,
    aiSummary: payload.aiSummary,
    riskAnalysis: payload.riskAnalysis
  };

  return {
    ...reportMaterial,
    currentHash: sha256Hex(reportMaterial)
  };
}
