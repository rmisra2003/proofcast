import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snapshot = await prisma.snapshot.findFirst({
      where: {
        OR: [{ publicSlug: id }, { id }],
        status: { not: "FAILED" }
      },
      include: {
        wallet: true,
        walrusBlobs: true,
        aiReports: true,
        verificationRecords: { take: 10, orderBy: { checkedAt: "desc" } },
        activityFeed: { take: 12, orderBy: { createdAt: "desc" } }
      }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Public ProofCast not found." }, { status: 404 });
    }

    const verification =
      snapshot.verificationRecords.find((record) => record.status === "VALID") ??
      snapshot.verificationRecords[0] ??
      null;

    return NextResponse.json({
      proofcast: {
        id: snapshot.publicSlug,
        walletAddress: snapshot.watchedAddress,
        createdAt: snapshot.createdAt,
        checkpoint: snapshot.checkpoint,
        canonicalHash: snapshot.canonicalHash,
        previousHash: snapshot.previousHash,
        walrusBlobId: snapshot.walrusBlobId,
        walrusProofUrl: snapshot.walrusProofUrl,
        anchorObjectId: snapshot.anchorObjectId,
        anchorTxDigest: snapshot.anchorTxDigest,
        aiSummary: snapshot.aiSummary,
        riskScore: snapshot.riskScore,
        riskAnalysis: snapshot.riskAnalysis,
        humanReport: snapshot.humanReport,
        verification,
        walrusBlobs: snapshot.walrusBlobs,
        activityFeed: snapshot.activityFeed
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
