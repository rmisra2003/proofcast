import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { sha256Hex } from "@/server/crypto/hash";
import { getEnv } from "@/server/env/env";
import { validateSnapshotAnchor } from "./anchor-proof";
import { TatumService } from "./tatum-service";
import { buildTatumInclusionDetails, eventDigest, inclusionIsValid } from "./tatum-inclusion";
import { WalrusService } from "./walrus-service";
import type { SnapshotPayload, VerificationResult } from "./types";

export class VerificationEngine {
  private readonly walrus = new WalrusService();
  private readonly tatum = new TatumService();

  async verifySnapshot(snapshotIdOrSlug: string): Promise<VerificationResult> {
    const snapshot = await prisma.snapshot.findFirst({
      where: {
        OR: [{ id: snapshotIdOrSlug }, { publicSlug: snapshotIdOrSlug }]
      }
    });

    if (!snapshot || !snapshot.walrusBlobId) {
      throw new Error("Snapshot not found or missing Walrus blob ID.");
    }

    const walrusPayload = await this.walrus.readJson<SnapshotPayload>(snapshot.walrusBlobId);
    const hashMaterial: Partial<SnapshotPayload> = { ...walrusPayload };
    delete hashMaterial.currentHash;
    const recomputedHash = sha256Hex(hashMaterial);
    const hashOk =
      walrusPayload.currentHash === snapshot.canonicalHash && recomputedHash === snapshot.canonicalHash;
    let tatumOk = false;
    let anchorOk = !snapshot.anchorObjectId;
    const details: Record<string, unknown> = {
      walrusBlobId: snapshot.walrusBlobId,
      canonicalHash: snapshot.canonicalHash,
      walrusPayloadHash: walrusPayload.currentHash,
      recomputedHash,
      checkpoint: snapshot.checkpoint
    };

    try {
      const checkpoint = await this.tatum.getLatestCheckpoint();
      const transactionDigests = walrusPayload.transactions
        .map((transaction) => transaction.digest)
        .filter(Boolean)
        .slice(0, 8);
      const eventDigests = walrusPayload.contractEvents
        .map(eventDigest)
        .filter(Boolean)
        .slice(0, 8);
      const [transactionResults, eventResults] = await Promise.all([
        this.verifyTransactionDigests(transactionDigests),
        this.verifyTransactionDigests(eventDigests)
      ]);
      const tatumInclusion = buildTatumInclusionDetails({
        payload: walrusPayload,
        latestCheckpoint: checkpoint,
        transactionResults,
        eventResults
      });

      tatumOk = inclusionIsValid(tatumInclusion);
      details.latestCheckpoint = checkpoint;
      details.tatumInclusion = tatumInclusion;
    } catch (error) {
      details.tatumError = error instanceof Error ? error.message : String(error);
    }

    if (snapshot.anchorObjectId) {
      try {
        const anchor = await this.tatum.getObjectData(snapshot.anchorObjectId);
        const validation = validateSnapshotAnchor({
          anchor,
          snapshot,
          packageId: getEnv().SUI_PROOFCAST_PACKAGE_ID,
          anchorTxDigest: snapshot.anchorTxDigest ?? undefined
        });
        anchorOk = validation.ok;
        details.anchorObject = validation.fields;
        details.anchorChecks = validation.checks;
      } catch (error) {
        anchorOk = false;
        details.anchorError = error instanceof Error ? error.message : String(error);
      }
    }

    const result: VerificationResult = {
      status: hashOk && tatumOk && anchorOk ? "VALID" : tatumOk ? "DEGRADED" : "INVALID",
      walrusOk: hashOk,
      tatumOk,
      anchorOk,
      hashOk,
      details
    };

    await prisma.verificationRecord.create({
      data: {
        snapshotId: snapshot.id,
        status: result.status,
        walrusOk: result.walrusOk,
        tatumOk: result.tatumOk,
        anchorOk: result.anchorOk,
        hashOk: result.hashOk,
        details: result.details as Prisma.InputJsonValue
      }
    });

    if (result.status === "VALID") {
      await prisma.snapshot.update({
        where: { id: snapshot.id },
        data: { status: "VERIFIED" }
      });
    }

    return result;
  }

  private async verifyTransactionDigests(digests: string[]) {
    const results: Record<string, boolean> = {};

    await Promise.all(
      digests.map(async (digest) => {
        try {
          const transaction = await this.tatum.getTransactionBlock(digest);
          results[digest] =
            String(transaction.digest ?? "") === digest || JSON.stringify(transaction).includes(digest);
        } catch {
          results[digest] = false;
        }
      })
    );

    return results;
  }
}
