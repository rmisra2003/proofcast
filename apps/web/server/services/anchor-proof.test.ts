import { describe, expect, it } from "vitest";
import { validateSnapshotAnchor } from "./anchor-proof";

const packageId = "0xabc";
const snapshot = {
  watchedAddress: `0x${"1".repeat(64)}`,
  walrusBlobId: "blob-123",
  canonicalHash: "hash-123",
  previousHash: "prev-123",
  checkpoint: "42"
};

function bytes(value: string) {
  return Array.from(new TextEncoder().encode(value));
}

function anchor(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    data: {
      objectId: "0xanchor",
      type: `${packageId}::snapshot_anchor::SnapshotAnchor`,
      previousTransaction: "digest-123",
      content: {
        fields: {
          watched_address: snapshot.watchedAddress,
          walrus_blob_id: bytes(snapshot.walrusBlobId),
          snapshot_hash: bytes(snapshot.canonicalHash),
          previous_hash: bytes(snapshot.previousHash),
          checkpoint: snapshot.checkpoint,
          ...overrides
        }
      }
    }
  };
}

describe("validateSnapshotAnchor", () => {
  it("accepts a matching onchain anchor", () => {
    const validation = validateSnapshotAnchor({
      anchor: anchor(),
      snapshot,
      packageId,
      anchorTxDigest: "digest-123"
    });

    expect(validation.ok).toBe(true);
  });

  it("rejects mismatched anchor fields", () => {
    const validation = validateSnapshotAnchor({
      anchor: anchor({ snapshot_hash: bytes("wrong") }),
      snapshot,
      packageId,
      anchorTxDigest: "digest-123"
    });

    expect(validation.ok).toBe(false);
    expect(validation.checks.hashOk).toBe(false);
  });
});
