export function getShareProofState(proofcast?: Record<string, unknown> | null) {
  if (!proofcast) {
    return {
      found: false,
      verificationStatus: "MISSING",
      walrusBlobLabel: "No Walrus proof",
      checkpointLabel: "No Tatum checkpoint",
      anchorCopy: "No Sui anchor recorded"
    };
  }

  const verification = proofcast.verification as Record<string, unknown> | undefined;
  const verificationStatus = String(verification?.status ?? "PENDING");

  return {
    found: true,
    verificationStatus,
    walrusBlobLabel: String(proofcast.walrusBlobId ?? "No Walrus blob"),
    checkpointLabel: `Checkpoint ${String(proofcast.checkpoint ?? "missing")}`,
    anchorCopy: proofcast.anchorObjectId
      ? verificationStatus === "VALID"
        ? "Sui anchor verified"
        : "Sui anchor pending verification"
      : "No Sui anchor recorded"
  };
}
