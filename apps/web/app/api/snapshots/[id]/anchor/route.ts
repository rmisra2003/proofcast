import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { getEnv } from "@/server/env/env";
import { jsonError } from "@/server/http";
import { TatumService } from "@/server/services/tatum-service";
import { validateSnapshotAnchor } from "@/server/services/anchor-proof";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { anchorObjectId?: string; anchorTxDigest?: string };

    if (!body.anchorObjectId || !body.anchorTxDigest) {
      return NextResponse.json(
        { error: "anchorObjectId and anchorTxDigest are required." },
        { status: 400 }
      );
    }

    const snapshot = await prisma.snapshot.findFirst({
      where: { OR: [{ id }, { publicSlug: id }] }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found." }, { status: 404 });
    }

    const anchor = await new TatumService().getObjectData(body.anchorObjectId);
    const validation = validateSnapshotAnchor({
      anchor,
      snapshot,
      packageId: getEnv().SUI_PROOFCAST_PACKAGE_ID,
      anchorTxDigest: body.anchorTxDigest
    });

    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "Sui anchor object does not match this ProofCast snapshot.",
          validation
        },
        { status: 409 }
      );
    }

    const updated = await prisma.snapshot.update({
      where: { id: snapshot.id },
      data: {
        status: "ANCHORED",
        anchorObjectId: body.anchorObjectId,
        anchorTxDigest: body.anchorTxDigest,
        activityFeed: {
          create: {
            walletId: snapshot.walletId,
            kind: "SNAPSHOT_ANCHORED",
            title: "Snapshot hash anchored on Sui",
            body: `Anchor object ${body.anchorObjectId} points to Walrus blob ${snapshot.walrusBlobId}.`
          }
        }
      }
    });

    return NextResponse.json({ snapshot: updated, validation });
  } catch (error) {
    return jsonError(error);
  }
}
