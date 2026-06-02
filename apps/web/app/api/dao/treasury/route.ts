import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { clientIp, jsonError } from "@/server/http";
import { rateLimit } from "@/server/rate-limit/rate-limit";
import { SnapshotEngine } from "@/server/services/snapshot-engine";
import { buildTreasuryReport } from "@/server/services/treasury-report";
import { WalrusService } from "@/server/services/walrus-service";
import { snapshotCaptureSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(`dao:${clientIp(request)}`, 4, 300);
    if (!limited.ok) {
      return NextResponse.json({ error: "Rate limit exceeded.", limited }, { status: 429 });
    }

    const input = snapshotCaptureSchema
      .omit({ walletKind: true })
      .parse(await request.json());
    const result = await new SnapshotEngine().capture({
      ...input,
      walletKind: "TREASURY"
    });
    const treasuryReport = buildTreasuryReport(result.payload);
    const treasuryWalrusBlob = await new WalrusService().storeJson(treasuryReport);

    await prisma.aIReport.create({
      data: {
        snapshotId: result.snapshot.id,
        kind: "TREASURY",
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash",
        promptVersion: "proofcast-treasury-v1",
        summary: treasuryReport.aiSummary,
        riskScore: result.snapshot.riskScore,
        report: JSON.stringify(treasuryReport, null, 2),
        walrusBlobId: treasuryWalrusBlob.blobId,
        outputHash: treasuryReport.currentHash,
        raw: treasuryReport as unknown as Prisma.InputJsonValue
      }
    });

    await prisma.walrusBlob.create({
      data: {
        snapshotId: result.snapshot.id,
        blobId: treasuryWalrusBlob.blobId,
        objectId: treasuryWalrusBlob.objectId,
        purpose: "TREASURY_REPORT",
        proofUrl: treasuryWalrusBlob.proofUrl,
        contentHash: treasuryWalrusBlob.contentHash,
        byteSize: treasuryWalrusBlob.byteSize,
        certifiedEpoch: treasuryWalrusBlob.certifiedEpoch,
        endEpoch: treasuryWalrusBlob.endEpoch,
        raw: treasuryWalrusBlob.raw as Prisma.InputJsonValue
      }
    });

    await prisma.activityFeed.create({
      data: {
        walletId: result.snapshot.walletId,
        snapshotId: result.snapshot.id,
        kind: "WALRUS_STORED",
        title: "DAO treasury report stored on Walrus",
        body: `Treasury report ${treasuryWalrusBlob.blobId} extends snapshot ${result.snapshot.walrusBlobId}.`
      }
    });

    return NextResponse.json({ ...result, treasuryReport, treasuryWalrusBlob });
  } catch (error) {
    return jsonError(error);
  }
}
