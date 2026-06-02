export type AnchorSnapshot = {
  watchedAddress: string;
  walrusBlobId?: string | null;
  canonicalHash: string;
  previousHash?: string | null;
  checkpoint?: string | null;
};

export type AnchorFields = {
  objectId: string;
  type: string;
  previousTransaction?: string;
  watchedAddress: string;
  walrusBlobId: string;
  snapshotHash: string;
  previousHash: string;
  checkpoint: string;
};

export type AnchorValidation = {
  ok: boolean;
  fields: AnchorFields;
  checks: {
    typeOk: boolean;
    digestOk: boolean;
    walletOk: boolean;
    blobOk: boolean;
    hashOk: boolean;
    previousHashOk: boolean;
    checkpointOk: boolean;
  };
};

export function readAnchorFields(anchor: unknown): AnchorFields {
  const data = (anchor as { data?: Record<string, unknown> }).data;
  const content = data?.content as { fields?: Record<string, unknown> } | undefined;
  const fields = content?.fields;

  if (!data?.objectId || !data?.type || !fields) {
    throw new Error("Tatum returned an anchor object without readable Move fields.");
  }

  return {
    objectId: String(data.objectId),
    type: String(data.type),
    previousTransaction: data.previousTransaction ? String(data.previousTransaction) : undefined,
    watchedAddress: String(fields.watched_address ?? ""),
    walrusBlobId: utf8FromMoveBytes(fields.walrus_blob_id),
    snapshotHash: utf8FromMoveBytes(fields.snapshot_hash),
    previousHash: utf8FromMoveBytes(fields.previous_hash),
    checkpoint: String(fields.checkpoint ?? "")
  };
}

export function validateSnapshotAnchor({
  anchor,
  snapshot,
  packageId,
  anchorTxDigest
}: {
  anchor: unknown;
  snapshot: AnchorSnapshot;
  packageId?: string;
  anchorTxDigest?: string;
}): AnchorValidation {
  const fields = readAnchorFields(anchor);
  const expectedType = packageId ? `${packageId}::snapshot_anchor::SnapshotAnchor` : "snapshot_anchor::SnapshotAnchor";
  const checks = {
    typeOk: packageId ? fields.type === expectedType : fields.type.endsWith(expectedType),
    digestOk: !anchorTxDigest || !fields.previousTransaction || fields.previousTransaction === anchorTxDigest,
    walletOk: fields.watchedAddress === snapshot.watchedAddress,
    blobOk: fields.walrusBlobId === snapshot.walrusBlobId,
    hashOk: fields.snapshotHash === snapshot.canonicalHash,
    previousHashOk: fields.previousHash === (snapshot.previousHash ?? ""),
    checkpointOk: fields.checkpoint === String(snapshot.checkpoint ?? "")
  };

  return {
    ok: Object.values(checks).every(Boolean),
    fields,
    checks
  };
}

function utf8FromMoveBytes(value: unknown) {
  if (!Array.isArray(value)) return "";
  return Buffer.from(value.map((item) => Number(item))).toString("utf8");
}
