import { describe, expect, it } from "vitest";
import { snapshotCaptureSchema } from "./schemas";

describe("snapshotCaptureSchema", () => {
  it("rejects invalid Sui addresses", () => {
    expect(() => snapshotCaptureSchema.parse({ walletAddress: "0x123" })).toThrow();
  });

  it("accepts valid Sui addresses and defaults wallet kind", () => {
    const parsed = snapshotCaptureSchema.parse({
      walletAddress: `0x${"1".repeat(64)}`
    });

    expect(parsed.walletKind).toEqual("USER");
  });
});
