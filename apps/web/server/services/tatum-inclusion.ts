import type { ContractEvent, SnapshotPayload } from "./types";

export type TatumInclusionDetails = {
  checkpointOk: boolean;
  checkedTransactions: string[];
  missingTransactions: string[];
  checkedEvents: string[];
  missingEvents: string[];
};

export function buildTatumInclusionDetails({
  payload,
  latestCheckpoint,
  transactionResults,
  eventResults,
  sampleSize = 8
}: {
  payload: SnapshotPayload;
  latestCheckpoint: Record<string, unknown>;
  transactionResults: Record<string, boolean>;
  eventResults: Record<string, boolean>;
  sampleSize?: number;
}): TatumInclusionDetails {
  const latestSequence = Number(latestCheckpoint.sequenceNumber ?? latestCheckpoint.checkpointSequenceNumber ?? 0);
  const snapshotSequence = Number(payload.checkpoint ?? 0);
  const transactionDigests = payload.transactions
    .map((transaction) => transaction.digest)
    .filter(Boolean)
    .slice(0, sampleSize);
  const eventDigests = payload.contractEvents
    .map(eventDigest)
    .filter(Boolean)
    .slice(0, sampleSize);

  return {
    checkpointOk: latestSequence >= snapshotSequence,
    checkedTransactions: transactionDigests,
    missingTransactions: transactionDigests.filter((digest) => !transactionResults[digest]),
    checkedEvents: eventDigests,
    missingEvents: eventDigests.filter((digest) => !eventResults[digest])
  };
}

export function eventDigest(event: ContractEvent) {
  const id = event.id as { txDigest?: unknown } | string | undefined;
  if (typeof id === "string") return id;
  return id?.txDigest ? String(id.txDigest) : "";
}

export function inclusionIsValid(details: TatumInclusionDetails) {
  return (
    details.checkpointOk &&
    details.missingTransactions.length === 0 &&
    details.missingEvents.length === 0
  );
}
