import { sha256Hex } from "../crypto/hash";
import type { SnapshotPayload } from "./types";

export type ReplayFrameInput = {
  index: number;
  id: string;
  publicSlug: string;
  createdAt: Date;
  checkpoint?: string | null;
  walrusBlobId?: string | null;
  walrusProofUrl?: string | null;
  canonicalHash: string;
  verificationStatus: string;
};

export function buildReplayFrameFromWalrusPayload(snapshot: ReplayFrameInput, payload: SnapshotPayload) {
  const hashMaterial: Partial<SnapshotPayload> = { ...payload };
  delete hashMaterial.currentHash;
  const recomputedHash = sha256Hex(hashMaterial);
  const hashOk = payload.currentHash === snapshot.canonicalHash && recomputedHash === snapshot.canonicalHash;
  const suiBalance =
    payload.balances.find((balance) => balance.coinType === "0x2::sui::SUI")?.totalBalance ?? "0";

  return {
    index: snapshot.index,
    id: snapshot.id,
    publicSlug: snapshot.publicSlug,
    timestamp: snapshot.createdAt.toISOString(),
    checkpoint: snapshot.checkpoint,
    walrusBlobId: snapshot.walrusBlobId,
    walrusProofUrl: snapshot.walrusProofUrl,
    canonicalHash: snapshot.canonicalHash,
    riskScore: payload.riskScore ?? 0,
    aiSummary: payload.aiSummary,
    transactionCount: payload.transactions.length,
    nftCount: payload.nfts.length,
    suiBalanceMist: suiBalance,
    verificationStatus: snapshot.verificationStatus,
    walrusVerified: true,
    hashOk,
    source: "walrus" as const
  };
}

export function buildReplayUnavailableFrame(snapshot: ReplayFrameInput) {
  return {
    index: snapshot.index,
    id: snapshot.id,
    publicSlug: snapshot.publicSlug,
    timestamp: snapshot.createdAt.toISOString(),
    checkpoint: snapshot.checkpoint,
    walrusBlobId: snapshot.walrusBlobId,
    walrusProofUrl: snapshot.walrusProofUrl,
    canonicalHash: snapshot.canonicalHash,
    riskScore: 0,
    aiSummary: "Walrus replay payload unavailable.",
    transactionCount: 0,
    nftCount: 0,
    suiBalanceMist: "0",
    verificationStatus: "DEGRADED",
    walrusVerified: false,
    hashOk: false,
    source: "walrus" as const
  };
}
