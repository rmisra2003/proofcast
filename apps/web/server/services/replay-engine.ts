import { prisma } from "@/server/db/prisma";
import { buildReplayFrameFromWalrusPayload, buildReplayUnavailableFrame } from "./replay-frame";
import type { SnapshotPayload } from "./types";
import { WalrusService } from "./walrus-service";

export class ReplayEngine {
  private readonly walrus = new WalrusService();

  async getReplay(walletAddress: string, limit = 12) {
    const snapshots = await prisma.snapshot.findMany({
      where: {
        watchedAddress: walletAddress,
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
      orderBy: { createdAt: "asc" },
      take: limit,
      include: { walrusBlobs: true, verificationRecords: { take: 10, orderBy: { checkedAt: "desc" } } }
    });

    return Promise.all(
      snapshots.map(async (snapshot, index) => {
        const verification =
          snapshot.verificationRecords.find((record) => record.status === "VALID") ??
          snapshot.verificationRecords[0];
        const frameInput = {
          index,
          id: snapshot.id,
          publicSlug: snapshot.publicSlug,
          createdAt: snapshot.createdAt,
          checkpoint: snapshot.checkpoint,
          walrusBlobId: snapshot.walrusBlobId,
          walrusProofUrl: snapshot.walrusProofUrl,
          canonicalHash: snapshot.canonicalHash,
          verificationStatus: verification?.status ?? "PENDING"
        };

        try {
          if (!snapshot.walrusBlobId) {
            throw new Error("Snapshot is missing a Walrus blob ID.");
          }

          const payload = await this.walrus.readJson<SnapshotPayload>(snapshot.walrusBlobId);
          return buildReplayFrameFromWalrusPayload(frameInput, payload);
        } catch {
          return buildReplayUnavailableFrame(frameInput);
        }
      })
    );
  }
}
