import { describe, expect, it } from "vitest";
import { sha256Hex } from "../crypto/hash";
import { buildReplayFrameFromWalrusPayload } from "./replay-frame";
import type { SnapshotPayload } from "./types";

function payload(): SnapshotPayload {
  const material = {
    snapshotId: "snapshot",
    walletAddress: `0x${"1".repeat(64)}`,
    timestamp: "2026-06-01T00:00:00.000Z",
    checkpoint: "10",
    transactions: [{ digest: "tx1", recipients: [], raw: {} }],
    balances: [{ coinType: "0x2::sui::SUI", totalBalance: "1000" }],
    nfts: [{ objectId: "nft1", raw: {} }],
    contractEvents: [],
    aiSummary: "summary",
    riskAnalysis: "risk",
    previousHash: null,
    riskScore: 4,
    changeDetection: "change",
    humanReport: "report",
    source: { chain: "sui" as const, network: "testnet", provider: "tatum" as const, storage: "walrus" as const }
  };

  return { ...material, currentHash: sha256Hex(material) };
}

describe("buildReplayFrameFromWalrusPayload", () => {
  it("builds replay metrics from Walrus payload and verifies hash", () => {
    const walrusPayload = payload();
    const frame = buildReplayFrameFromWalrusPayload(
      {
        index: 0,
        id: "snapshot",
        publicSlug: "snap",
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
        checkpoint: "10",
        walrusBlobId: "blob",
        walrusProofUrl: "https://walrus.example/blob",
        canonicalHash: walrusPayload.currentHash,
        verificationStatus: "VALID"
      },
      walrusPayload
    );

    expect(frame.source).toBe("walrus");
    expect(frame.hashOk).toBe(true);
    expect(frame.transactionCount).toBe(1);
    expect(frame.nftCount).toBe(1);
    expect(frame.suiBalanceMist).toBe("1000");
  });
});
