import { describe, expect, it } from "vitest";
import { getShareProofState } from "./share-proof-state";

describe("getShareProofState", () => {
  it("does not invent live proof for missing share records", () => {
    const state = getShareProofState(null);

    expect(state.verificationStatus).toBe("MISSING");
    expect(state.walrusBlobLabel).toBe("No Walrus proof");
    expect(state.anchorCopy).toBe("No Sui anchor recorded");
    expect(JSON.stringify(state)).not.toContain("LIVE");
    expect(JSON.stringify(state)).not.toContain("Sui anchor verified");
  });
});
