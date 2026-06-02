import { describe, expect, it } from "vitest";
import { isAllowedTatumRpcMethod } from "./tatum-allowlist";

describe("Tatum RPC allowlist", () => {
  it("allows ProofCast read methods and rejects unsafe methods", () => {
    expect(isAllowedTatumRpcMethod("sui_getObject")).toBe(true);
    expect(isAllowedTatumRpcMethod("sui_getTransactionBlock")).toBe(true);
    expect(isAllowedTatumRpcMethod("unsafe_paySui")).toBe(false);
  });
});
