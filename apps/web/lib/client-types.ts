export type HealthResponse = {
  ok: boolean;
  network: string;
  walrusNetwork: string;
  integrations: Record<string, string>;
  missing: string[];
};

export type SnapshotSummary = {
  id: string;
  publicSlug: string;
  watchedAddress: string;
  checkpoint?: string | null;
  canonicalHash: string;
  previousHash?: string | null;
  walrusBlobId?: string | null;
  walrusProofUrl?: string | null;
  anchorObjectId?: string | null;
  anchorTxDigest?: string | null;
  riskScore?: number | null;
  aiSummary?: string | null;
  riskAnalysis?: string | null;
  changeSummary?: string | null;
  humanReport?: string | null;
  status: string;
  createdAt: string;
  raw?: {
    balances?: Array<{ coinType: string; totalBalance: string }>;
    transactions?: Array<{ digest: string; timestampMs?: string }>;
    nfts?: Array<{ objectId: string; name?: string }>;
  };
  walrusBlobs?: Array<{ blobId: string; purpose: string; proofUrl?: string | null }>;
  verificationRecords?: Array<{ status: string; checkedAt: string }>;
};

export type AnchorRequest = {
  packageId: string;
  target: string;
  args: {
    watchedAddress: string;
    walrusBlobId: string;
    snapshotHash: string;
    checkpoint: string;
    previousHash: string;
    clockObjectId: "0x6";
  };
};

export type CaptureResponse = {
  snapshot: SnapshotSummary;
  payload: SnapshotSummary["raw"] & { currentHash: string };
  anchorRequest: AnchorRequest | null;
  verification?: {
    status: "VALID" | "INVALID" | "DEGRADED";
    walrusOk: boolean;
    tatumOk: boolean;
    anchorOk: boolean;
    hashOk: boolean;
  } | null;
  verificationError?: string;
};

export type ReplayFrame = {
  index: number;
  id: string;
  publicSlug: string;
  timestamp: string;
  checkpoint?: string | null;
  walrusBlobId?: string | null;
  walrusProofUrl?: string | null;
  canonicalHash: string;
  riskScore: number;
  aiSummary?: string | null;
  transactionCount: number;
  nftCount: number;
  suiBalanceMist: string;
  verificationStatus: string;
  walrusVerified: boolean;
  hashOk: boolean;
  source: "walrus";
};
