export const allowedTatumRpcMethods = new Set([
  "sui_getLatestCheckpointSequenceNumber",
  "sui_getCheckpoint",
  "suix_getAllBalances",
  "suix_queryTransactionBlocks",
  "suix_getOwnedObjects",
  "suix_queryEvents",
  "sui_getObject",
  "sui_getTransactionBlock"
]);

export function isAllowedTatumRpcMethod(method: string) {
  return allowedTatumRpcMethods.has(method);
}
