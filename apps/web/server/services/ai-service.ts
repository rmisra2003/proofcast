import { getEnv, requireEnv } from "@/server/env/env";
import { aiReportSchema, type AIReportOutput } from "@/server/validation/schemas";
import type { SnapshotPayload, TatumTransaction, WalletBalance, OwnedNft } from "./types";

export class AIService {
  private readonly env = getEnv();

  async analyzeSnapshot(input: {
    walletAddress: string;
    balances: WalletBalance[];
    transactions: TatumTransaction[];
    nfts: OwnedNft[];
    previous?: SnapshotPayload | null;
  }): Promise<AIReportOutput> {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${requireEnv(this.env.DEEPSEEK_API_KEY, "DEEPSEEK_API_KEY")}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: this.env.DEEPSEEK_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are ProofCast, an analyst for Sui wallets. Return strict JSON with activitySummary, riskScore, riskAnalysis, changeDetection, humanReport, chainMemoryTitle, and chainMemoryStory. Do not invent facts beyond supplied blockchain data."
          },
          {
            role: "user",
            content: JSON.stringify({
              walletAddress: input.walletAddress,
              balances: input.balances,
              recentTransactions: input.transactions.slice(0, 12),
              nfts: input.nfts.slice(0, 20),
              previousSnapshot: input.previous
                ? {
                    timestamp: input.previous.timestamp,
                    currentHash: input.previous.currentHash,
                    aiSummary: input.previous.aiSummary,
                    riskScore: input.previous.riskScore
                  }
                : null
            })
          }
        ],
        max_tokens: 900,
        temperature: 0.2
      })
    });
    const payload = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    } | null;

    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "DeepSeek analysis failed.");
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek returned an empty analysis.");
    }

    return aiReportSchema.parse(JSON.parse(content));
  }

  async generateChainMemory(snapshot: SnapshotPayload) {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${requireEnv(this.env.DEEPSEEK_API_KEY, "DEEPSEEK_API_KEY")}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: this.env.DEEPSEEK_MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Create an immutable historical story for a Sui wallet. Return JSON with title, story, themes, and citationHashes."
          },
          {
            role: "user",
            content: JSON.stringify(snapshot)
          }
        ],
        max_tokens: 900,
        temperature: 0.35
      })
    });
    const payload = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    } | null;

    if (!response.ok) {
      throw new Error(payload?.error?.message ?? "DeepSeek Chain Memory generation failed.");
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek returned an empty Chain Memory.");
    }

    return JSON.parse(content) as unknown;
  }
}
