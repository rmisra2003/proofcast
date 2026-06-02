export interface TatumTransaction {
  digest: string;
  timestampMs?: string;
  sender?: string;
  recipients: string[];
  type?: string;
  amountMist?: string;
  gasUsedMist?: string;
  raw: unknown;
}

export interface OwnedNft {
  objectId: string;
  type?: string;
  name?: string;
  imageUrl?: string;
  raw: unknown;
}

export interface WalletBalance {
  coinType: string;
  totalBalance: string;
  coinObjectCount?: number;
}

export interface ContractEvent {
  id?: unknown;
  type?: string;
  timestampMs?: string;
  sender?: string;
  raw: unknown;
}

export interface SnapshotPayload {
  snapshotId: string;
  walletAddress: string;
  timestamp: string;
  checkpoint?: string;
  transactions: TatumTransaction[];
  balances: WalletBalance[];
  nfts: OwnedNft[];
  contractEvents: ContractEvent[];
  aiSummary: string;
  riskAnalysis: string;
  previousHash: string | null;
  currentHash: string;
  riskScore: number;
  changeDetection: string;
  humanReport: string;
  source: {
    chain: "sui";
    network: string;
    provider: "tatum";
    storage: "walrus";
  };
}

export interface WalrusStoredBlob {
  blobId: string;
  objectId?: string;
  proofUrl: string;
  byteSize: number;
  certifiedEpoch?: number;
  endEpoch?: number;
  raw: unknown;
}

export interface VerificationResult {
  status: "VALID" | "INVALID" | "DEGRADED";
  walrusOk: boolean;
  tatumOk: boolean;
  anchorOk: boolean;
  hashOk: boolean;
  details: Record<string, unknown>;
}
