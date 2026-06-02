import { getEnv, requireEnv } from "@/server/env/env";
import { getRedis } from "@/server/cache/redis";
import { sha256Hex } from "@/server/crypto/hash";
import type { ContractEvent, OwnedNft, TatumTransaction, WalletBalance } from "./types";

type RpcPayload = {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: unknown[];
};

type RpcResponse<T> = {
  jsonrpc?: "2.0";
  id?: string | number;
  result?: T;
  error?: { code?: number; message?: string; data?: unknown };
};

export class TatumService {
  private readonly env = getEnv();

  async rpc<T>(method: string, params: unknown[] = [], id = method): Promise<T> {
    const cacheKey = `tatum:${this.env.TATUM_SUI_NETWORK}:${method}:${sha256Hex(params)}`;
    const redis = await getRedis();
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as T;
    }

    const payload = await this.fetchWithRetry<T>(method, params, id);
    await redis.set(cacheKey, JSON.stringify(payload), { EX: 20 });
    return payload;
  }

  private async fetchWithRetry<T>(method: string, params: unknown[], id: string): Promise<T> {
    const delays = [0, 1_500, 3_500, 7_000];
    let lastError: Error | null = null;

    for (const delay of delays) {
      if (delay > 0) {
        await sleep(delay);
      }

      try {
        const response = await fetch(this.env.TATUM_SUI_RPC_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": requireEnv(this.env.TATUM_API_KEY, "TATUM_API_KEY")
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id,
            method,
            params
          } satisfies RpcPayload),
          cache: "no-store"
        });
        const payload = (await response.json().catch(() => null)) as RpcResponse<T> | null;

        if (response.status === 429) {
          lastError = new Error(`Tatum RPC HTTP 429 for ${method}.`);
          continue;
        }

        if (!response.ok) {
          throw new Error(`Tatum RPC HTTP ${response.status} for ${method}.`);
        }

        if (!payload) {
          throw new Error(`Tatum RPC returned an empty response for ${method}.`);
        }

        if (payload.error) {
          throw new Error(payload.error.message ?? `Tatum RPC ${method} failed.`);
        }

        return payload.result as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError ?? new Error(`Tatum RPC ${method} failed after retries.`);
  }

  async getWalletBalance(walletAddress: string): Promise<WalletBalance[]> {
    const result = await this.rpc<Array<Record<string, unknown>>>("suix_getAllBalances", [
      walletAddress
    ]);

    return result.map((balance) => ({
      coinType: String(balance.coinType ?? "unknown"),
      totalBalance: String(balance.totalBalance ?? "0"),
      coinObjectCount:
        typeof balance.coinObjectCount === "number" ? balance.coinObjectCount : undefined
    }));
  }

  async getTransactions(walletAddress: string, limit = 25): Promise<TatumTransaction[]> {
    const perDirection = Math.max(5, Math.ceil(limit / 2));
    const [sent, received] = await Promise.all([
      this.queryTransactionsByFilter({ FromAddress: walletAddress }, perDirection),
      this.queryTransactionsByFilter({ ToAddress: walletAddress }, perDirection)
    ]);
    const byDigest = new Map<string, Record<string, unknown>>();

    for (const transaction of [...sent, ...received]) {
      const digest = String(transaction.digest ?? "");
      if (digest) byDigest.set(digest, transaction);
    }

    return [...byDigest.values()]
      .sort((left, right) => Number(right.timestampMs ?? 0) - Number(left.timestampMs ?? 0))
      .slice(0, limit)
      .map((transaction) => normalizeTransaction(transaction));
  }

  private async queryTransactionsByFilter(filter: Record<string, string>, limit: number) {
    const result = await this.rpc<{
      data?: Array<Record<string, unknown>>;
    }>("suix_queryTransactionBlocks", [
      {
        filter,
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showBalanceChanges: true
        }
      },
      null,
      limit,
      true
    ]);

    return result.data ?? [];
  }

  async getOwnedNFTs(walletAddress: string, limit = 50): Promise<OwnedNft[]> {
    const result = await this.rpc<{
      data?: Array<Record<string, unknown>>;
    }>("suix_getOwnedObjects", [
      walletAddress,
      {
        filter: { MatchNone: [{ StructType: "0x2::coin::Coin" }] },
        options: { showType: true, showContent: true, showDisplay: true, showOwner: true }
      },
      null,
      limit
    ]);

    return (result.data ?? []).map((item) => {
      const data = item.data as Record<string, unknown> | undefined;
      const display = data?.display as { data?: Record<string, string> } | undefined;
      return {
        objectId: String(data?.objectId ?? ""),
        type: data?.type ? String(data.type) : undefined,
        name: display?.data?.name,
        imageUrl: display?.data?.image_url ?? display?.data?.image,
        raw: item
      };
    });
  }

  async getObjectData(objectId: string) {
    return this.rpc("sui_getObject", [
      objectId,
      {
        showType: true,
        showContent: true,
        showOwner: true,
        showPreviousTransaction: true,
        showDisplay: true
      }
    ]);
  }

  async getTransactionBlock(digest: string) {
    return this.rpc<Record<string, unknown>>("sui_getTransactionBlock", [
      digest,
      {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
        showObjectChanges: true
      }
    ]);
  }

  async getContractEvents(walletAddress: string, limit = 25): Promise<ContractEvent[]> {
    const result = await this.rpc<{ data?: Array<Record<string, unknown>> }>("suix_queryEvents", [
      { Sender: walletAddress },
      null,
      limit,
      true
    ]);

    return (result.data ?? []).map((event) => ({
      id: event.id,
      type: event.type ? String(event.type) : undefined,
      timestampMs: event.timestampMs ? String(event.timestampMs) : undefined,
      sender: event.sender ? String(event.sender) : undefined,
      raw: event
    }));
  }

  async getLatestCheckpoint() {
    const sequence = await this.rpc<string>("sui_getLatestCheckpointSequenceNumber", []);
    return this.rpc<Record<string, unknown>>("sui_getCheckpoint", [sequence]);
  }

  async getTreasuryActivity(walletAddress: string) {
    const [balances, transactions, events, checkpoint] = await Promise.all([
      this.getWalletBalance(walletAddress),
      this.getTransactions(walletAddress, 50),
      this.getContractEvents(walletAddress, 50),
      this.getLatestCheckpoint()
    ]);

    return { balances, transactions, events, checkpoint };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTransaction(transaction: Record<string, unknown>): TatumTransaction {
  const tx = transaction.transaction as Record<string, unknown> | undefined;
  const data = tx?.data as Record<string, unknown> | undefined;
  const transactionData = data?.transaction as Record<string, unknown> | undefined;
  const effects = transaction.effects as Record<string, unknown> | undefined;
  const gasUsed = effects?.gasUsed as Record<string, unknown> | undefined;
  const balanceChanges = transaction.balanceChanges as Array<Record<string, unknown>> | undefined;

  return {
    digest: String(transaction.digest ?? ""),
    timestampMs: transaction.timestampMs ? String(transaction.timestampMs) : undefined,
    sender: data?.sender ? String(data.sender) : undefined,
    recipients: extractRecipients(transaction),
    type: String(transactionData?.kind ?? "ProgrammableTransaction"),
    amountMist: balanceChanges?.[0]?.amount ? String(balanceChanges[0].amount) : undefined,
    gasUsedMist: gasUsed?.computationCost ? String(gasUsed.computationCost) : undefined,
    raw: transaction
  };
}

function extractRecipients(transaction: Record<string, unknown>) {
  const effects = transaction.effects as Record<string, unknown> | undefined;
  const objectChanges = transaction.objectChanges as Array<Record<string, unknown>> | undefined;
  const addresses = new Set<string>();

  for (const change of objectChanges ?? []) {
    const owner = change.owner as Record<string, string> | undefined;
    if (owner?.AddressOwner) addresses.add(owner.AddressOwner);
  }

  const mutated = effects?.mutated as Array<Record<string, unknown>> | undefined;
  for (const item of mutated ?? []) {
    const owner = item.owner as Record<string, string> | undefined;
    if (owner?.AddressOwner) addresses.add(owner.AddressOwner);
  }

  return [...addresses];
}
