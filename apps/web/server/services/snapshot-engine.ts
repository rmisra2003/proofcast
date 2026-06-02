import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { getEnv } from "@/server/env/env";
import { sha256Hex } from "@/server/crypto/hash";
import type { SnapshotCaptureInput } from "@/server/validation/schemas";
import { AIService } from "./ai-service";
import { TatumService } from "./tatum-service";
import { WalrusService } from "./walrus-service";
import type { SnapshotPayload } from "./types";

export class SnapshotEngine {
  private readonly tatum = new TatumService();
  private readonly walrus = new WalrusService();
  private readonly ai = new AIService();
  private readonly env = getEnv();

  async capture(input: SnapshotCaptureInput) {
    const wallet = await prisma.wallet.upsert({
      where: { address: input.walletAddress },
      update: {
        kind: input.walletKind,
        label: input.label
      },
      create: {
        address: input.walletAddress,
        kind: input.walletKind,
        label: input.label
      }
    });

    const previous = await prisma.snapshot.findFirst({
      where: {
        walletId: wallet.id,
        status: "VERIFIED",
        verificationRecords: {
          some: {
            status: "VALID",
            walrusOk: true,
            tatumOk: true,
            hashOk: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    const previousPayload = previous?.raw as unknown as SnapshotPayload | undefined;
    const snapshotId = randomUUID();

    const balances = await this.tatum.getWalletBalance(input.walletAddress);
    const transactions = await this.tatum.getTransactions(input.walletAddress);
    const nfts = await this.tatum.getOwnedNFTs(input.walletAddress);
    const contractEvents = await this.tatum.getContractEvents(input.walletAddress);
    const checkpoint = await this.tatum.getLatestCheckpoint();

    const aiReport = await this.ai.analyzeSnapshot({
      walletAddress: input.walletAddress,
      balances,
      transactions,
      nfts,
      previous: previousPayload ?? null
    });

    const checkpointSequence = String(checkpoint.sequenceNumber ?? checkpoint.checkpointSequenceNumber ?? "");
    const checkpointTimestampMs = checkpoint.timestampMs ? String(checkpoint.timestampMs) : undefined;
    const hashMaterial = {
      snapshotId,
      walletAddress: input.walletAddress,
      timestamp: new Date().toISOString(),
      checkpoint: checkpointSequence,
      transactions,
      balances,
      nfts,
      contractEvents,
      aiSummary: aiReport.activitySummary,
      riskAnalysis: aiReport.riskAnalysis,
      previousHash: previous?.canonicalHash ?? null,
      riskScore: aiReport.riskScore,
      changeDetection: aiReport.changeDetection,
      humanReport: aiReport.humanReport,
      source: {
        chain: "sui" as const,
        network: this.env.TATUM_SUI_NETWORK,
        provider: "tatum" as const,
        storage: "walrus" as const
      }
    };
    const currentHash = sha256Hex(hashMaterial);
    const payload: SnapshotPayload = {
      ...hashMaterial,
      currentHash
    };

    const [snapshotBlob, aiBlob] = await Promise.all([
      this.walrus.storeJson(payload),
      this.walrus.storeJson(
        {
          snapshotId,
          walletAddress: input.walletAddress,
          report: aiReport,
          currentHash
        }
      )
    ]);

    const publicSlug = snapshotId.split("-")[0];
    const snapshot = await prisma.snapshot.create({
      data: {
        id: snapshotId,
        walletId: wallet.id,
        watchedAddress: input.walletAddress,
        checkpoint: checkpointSequence || null,
        checkpointTimestamp: checkpointTimestampMs ? new Date(Number(checkpointTimestampMs)) : null,
        status: "STORED",
        publicSlug,
        canonicalHash: currentHash,
        previousHash: previous?.canonicalHash,
        walrusBlobId: snapshotBlob.blobId,
        walrusObjectId: snapshotBlob.objectId,
        walrusProofUrl: snapshotBlob.proofUrl,
        riskScore: aiReport.riskScore,
        aiSummary: aiReport.activitySummary,
        riskAnalysis: aiReport.riskAnalysis,
        changeSummary: aiReport.changeDetection,
        humanReport: aiReport.humanReport,
        raw: payload as unknown as Prisma.InputJsonValue,
        aiReports: {
          create: {
            kind: "SNAPSHOT",
            model: this.env.DEEPSEEK_MODEL,
            promptVersion: "proofcast-snapshot-v1",
            summary: aiReport.activitySummary,
            riskScore: aiReport.riskScore,
            report: aiReport.humanReport,
            walrusBlobId: aiBlob.blobId,
            outputHash: aiBlob.contentHash,
            raw: aiReport as Prisma.InputJsonValue
          }
        },
        walrusBlobs: {
          create: [
            {
              blobId: snapshotBlob.blobId,
              objectId: snapshotBlob.objectId,
              purpose: "SNAPSHOT",
              proofUrl: snapshotBlob.proofUrl,
              contentHash: snapshotBlob.contentHash,
              byteSize: snapshotBlob.byteSize,
              certifiedEpoch: snapshotBlob.certifiedEpoch,
              endEpoch: snapshotBlob.endEpoch,
              raw: snapshotBlob.raw as Prisma.InputJsonValue
            },
            {
              blobId: aiBlob.blobId,
              objectId: aiBlob.objectId,
              purpose: "AI_REPORT",
              proofUrl: aiBlob.proofUrl,
              contentHash: aiBlob.contentHash,
              byteSize: aiBlob.byteSize,
              certifiedEpoch: aiBlob.certifiedEpoch,
              endEpoch: aiBlob.endEpoch,
              raw: aiBlob.raw as Prisma.InputJsonValue
            }
          ]
        },
        activityFeed: {
          create: [
            {
              walletId: wallet.id,
              kind: "TATUM_SYNCED",
              title: "Tatum indexed live Sui state",
              body: `${transactions.length} transactions, ${nfts.length} objects, and ${balances.length} balances captured.`
            },
            {
              walletId: wallet.id,
              kind: "WALRUS_STORED",
              title: "Snapshot stored on Walrus",
              body: `Blob ${snapshotBlob.blobId} now carries the canonical ProofCast memory.`
            },
            {
              walletId: wallet.id,
              kind: "AI_REPORT_CREATED",
              title: "DeepSeek report generated",
              body: aiReport.activitySummary
            }
          ]
        }
      },
      include: {
        wallet: true,
        walrusBlobs: true,
        aiReports: true,
        transactions: { take: 10, orderBy: { createdAt: "desc" } },
        nfts: { take: 12, orderBy: { createdAt: "desc" } }
      }
    });

    await Promise.all([
      prisma.transaction.createMany({
        data: transactions
          .filter((transaction) => transaction.digest)
          .map((transaction) => ({
            walletId: wallet.id,
            snapshotId: snapshot.id,
            digest: transaction.digest,
            timestamp: transaction.timestampMs ? new Date(Number(transaction.timestampMs)) : null,
            sender: transaction.sender,
            recipients: transaction.recipients,
            type: transaction.type,
            amountMist: transaction.amountMist,
            gasUsedMist: transaction.gasUsedMist,
            raw: transaction.raw as Prisma.InputJsonValue
          })),
        skipDuplicates: true
      }),
      prisma.nFT.createMany({
        data: nfts
          .filter((nft) => nft.objectId)
          .map((nft) => ({
            walletId: wallet.id,
            snapshotId: snapshot.id,
            objectId: nft.objectId,
            type: nft.type,
            name: nft.name,
            imageUrl: nft.imageUrl,
            raw: nft.raw as Prisma.InputJsonValue
          })),
        skipDuplicates: true
      })
    ]);

    return {
      snapshot,
      payload,
      anchorRequest: this.buildAnchorRequest(payload, snapshot.walrusBlobId)
    };
  }

  buildAnchorRequest(payload: SnapshotPayload, walrusBlobId?: string | null) {
    if (!this.env.SUI_PROOFCAST_PACKAGE_ID || !walrusBlobId) return null;

    return {
      packageId: this.env.SUI_PROOFCAST_PACKAGE_ID,
      target: `${this.env.SUI_PROOFCAST_PACKAGE_ID}::snapshot_anchor::create_anchor`,
      args: {
        watchedAddress: payload.walletAddress,
        walrusBlobId,
        snapshotHash: payload.currentHash,
        checkpoint: payload.checkpoint ?? "",
        previousHash: payload.previousHash ?? "",
        clockObjectId: "0x6"
      }
    };
  }
}
