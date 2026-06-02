import { describe, expect, it } from "vitest";
import { canonicalize, sha256Hex } from "./hash";

describe("canonicalize", () => {
  it("produces stable hashes independent of object key order", () => {
    const left = { b: 2, a: { d: 4, c: 3 } };
    const right = { a: { c: 3, d: 4 }, b: 2 };

    expect(canonicalize(left)).toEqual(canonicalize(right));
    expect(sha256Hex(left)).toEqual(sha256Hex(right));
  });

  it("matches JSON storage semantics for undefined fields", () => {
    const beforeWalrusWrite = {
      a: 1,
      omitted: undefined,
      nested: { present: true, skipped: undefined },
      list: ["kept", undefined]
    };
    const afterWalrusRead = JSON.parse(JSON.stringify(beforeWalrusWrite));

    expect(canonicalize(beforeWalrusWrite)).toEqual(canonicalize(afterWalrusRead));
    expect(sha256Hex(beforeWalrusWrite)).toEqual(sha256Hex(afterWalrusRead));
  });
});
