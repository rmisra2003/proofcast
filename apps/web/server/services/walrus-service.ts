import { getEnv } from "@/server/env/env";
import { sha256Hex } from "@/server/crypto/hash";
import type { WalrusStoredBlob } from "./types";

type WalrusPublisherResponse = {
  newlyCreated?: {
    blobObject?: {
      id?: string;
      blobId?: string;
      certifiedEpoch?: number;
      size?: number;
      storage?: { endEpoch?: number };
    };
  };
  alreadyCertified?: {
    blobId?: string;
    endEpoch?: number;
    event?: { txDigest?: string };
  };
};

export class WalrusService {
  private readonly env = getEnv();

  async storeJson(payload: unknown): Promise<WalrusStoredBlob & { contentHash: string }> {
    const body = Buffer.from(JSON.stringify(payload, null, 2));
    const stored = await this.storeBytes(body, "application/json");

    return {
      ...stored,
      contentHash: sha256Hex(body.toString("utf8"))
    };
  }

  async storeBytes(bytes: Buffer, contentType: string): Promise<WalrusStoredBlob> {
    const publisherUrl = this.env.WALRUS_PUBLISHER_URL.replace(/\/$/, "");
    const aggregatorUrl = this.env.WALRUS_AGGREGATOR_URL.replace(/\/$/, "");
    const response = await fetch(`${publisherUrl}/v1/blobs?epochs=12`, {
      method: "PUT",
      headers: {
        "content-type": contentType
      },
      body: new Uint8Array(bytes)
    });
    const payload = (await response.json().catch(() => null)) as WalrusPublisherResponse | null;

    if (!response.ok || !payload) {
      throw new Error(`Walrus publisher failed with HTTP ${response.status}.`);
    }

    const created = payload.newlyCreated?.blobObject;
    const certified = payload.alreadyCertified;
    const blobId = created?.blobId ?? certified?.blobId;

    if (!blobId) {
      throw new Error("Walrus publisher did not return a blob ID.");
    }

    return {
      blobId,
      objectId: created?.id,
      proofUrl: `${aggregatorUrl}/v1/blobs/${blobId}`,
      byteSize: created?.size ?? bytes.byteLength,
      certifiedEpoch: created?.certifiedEpoch,
      endEpoch: created?.storage?.endEpoch ?? certified?.endEpoch,
      raw: payload
    };
  }

  async readBlob(blobId: string) {
    const aggregatorUrl = this.env.WALRUS_AGGREGATOR_URL.replace(/\/$/, "");
    const response = await fetch(`${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Walrus aggregator could not read blob ${blobId}.`);
    }

    return response.arrayBuffer();
  }

  async readJson<T>(blobId: string): Promise<T> {
    const buffer = await this.readBlob(blobId);
    return JSON.parse(Buffer.from(buffer).toString("utf8")) as T;
  }

  async verifyBlob(blobId: string, expectedHash?: string) {
    const buffer = await this.readBlob(blobId);
    const text = Buffer.from(buffer).toString("utf8");
    const contentHash = sha256Hex(text);

    return {
      ok: expectedHash ? contentHash === expectedHash : true,
      blobId,
      contentHash,
      byteSize: buffer.byteLength,
      proofUrl: `${this.env.WALRUS_AGGREGATOR_URL.replace(/\/$/, "")}/v1/blobs/${blobId}`
    };
  }
}
