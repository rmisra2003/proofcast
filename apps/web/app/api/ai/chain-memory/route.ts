import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { sha256Hex } from "@/server/crypto/hash";
import { jsonError } from "@/server/http";
import { AIService } from "@/server/services/ai-service";
import { WalrusService } from "@/server/services/walrus-service";
import type { SnapshotPayload } from "@/server/services/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { snapshotId?: string };
    if (!body.snapshotId) {
      return NextResponse.json({ error: "snapshotId is required." }, { status: 400 });
    }

    const snapshot = await prisma.snapshot.findFirst({
      where: { OR: [{ id: body.snapshotId }, { publicSlug: body.snapshotId }] },
      include: { verificationRecords: { take: 1, orderBy: { checkedAt: "desc" } } }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found." }, { status: 404 });
    }

    const verification = snapshot.verificationRecords[0];
    if (verification?.status !== "VALID") {
      return NextResponse.json(
        { error: "Chain Memories require a VALID ProofCast verification first." },
        { status: 409 }
      );
    }

    if (!snapshot.walrusBlobId) {
      return NextResponse.json({ error: "Snapshot is missing its Walrus blob ID." }, { status: 409 });
    }

    const walrus = new WalrusService();
    const raw = await walrus.readJson<SnapshotPayload>(snapshot.walrusBlobId);
    const hashMaterial: Partial<SnapshotPayload> = { ...raw };
    delete hashMaterial.currentHash;
    const sourceHash = sha256Hex(hashMaterial);

    if (raw.currentHash !== snapshot.canonicalHash || sourceHash !== snapshot.canonicalHash) {
      return NextResponse.json(
        { error: "Walrus source payload does not match the verified snapshot hash." },
        { status: 409 }
      );
    }

    const memory = await new AIService().generateChainMemory(raw);
    const artifact = {
      snapshotId: snapshot.id,
      walletAddress: snapshot.watchedAddress,
      source: "walrus",
      sourceWalrusBlobId: snapshot.walrusBlobId,
      canonicalHash: snapshot.canonicalHash,
      generatedAt: new Date().toISOString(),
      memory
    };
    const walrusBlob = await walrus.storeJson(artifact);
    const outputHash = sha256Hex(artifact);

    const report = await prisma.aIReport.create({
      data: {
        snapshotId: snapshot.id,
        kind: "CHAIN_MEMORY",
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
        promptVersion: "proofcast-chain-memory-v1",
        summary: String((memory as { title?: string }).title ?? "Chain Memory"),
        report: JSON.stringify(memory, null, 2),
        walrusBlobId: walrusBlob.blobId,
        outputHash,
        raw: memory as Prisma.InputJsonValue
      }
    });

    await prisma.walrusBlob.create({
      data: {
        snapshotId: snapshot.id,
        blobId: walrusBlob.blobId,
        objectId: walrusBlob.objectId,
        purpose: "CHAIN_MEMORY",
        proofUrl: walrusBlob.proofUrl,
        contentHash: walrusBlob.contentHash,
        byteSize: walrusBlob.byteSize,
        certifiedEpoch: walrusBlob.certifiedEpoch,
        endEpoch: walrusBlob.endEpoch,
        raw: walrusBlob.raw as Prisma.InputJsonValue
      }
    });

    return NextResponse.json({ report, walrusBlob, memory });
  } catch (error) {
    return jsonError(error);
  }
}
