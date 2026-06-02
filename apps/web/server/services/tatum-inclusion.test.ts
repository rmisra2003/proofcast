import { describe, expect, it } from "vitest";
import { buildTatumInclusionDetails, inclusionIsValid } from "./tatum-inclusion";
import type { SnapshotPayload } from "./types";

const payload: SnapshotPayload = {
  snapshotId: "snapshot",
  walletAddress: `0x${"1".repeat(64)}`,
  timestamp: "2026-06-01T00:00:00.000Z",
  checkpoint: "10",
  transactions: [{ digest: "tx1", recipients: [], raw: {} }],
  balances: [],
  nfts: [],
  contractEvents: [{ id: { txDigest: "eventTx" }, raw: {} }],
  aiSummary: "summary",
  riskAnalysis: "risk",
  previousHash: null,
  currentHash: "hash",
  riskScore: 1,
  changeDetection: "change",
  humanReport: "report",
  source: { chain: "sui", network: "testnet", provider: "tatum", storage: "walrus" }
};

describe("buildTatumInclusionDetails", () => {
  it("reports missing Tatum transaction inclusion", () => {
    const details = buildTatumInclusionDetails({
      payload,
      latestCheckpoint: { sequenceNumber: "11" },
      transactionResults: { tx1: false },
      eventResults: { eventTx: true }
    });

    expect(details.missingTransactions).toEqual(["tx1"]);
    expect(inclusionIsValid(details)).toBe(false);
  });
});
