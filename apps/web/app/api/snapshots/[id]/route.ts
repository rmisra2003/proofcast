import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snapshot = await prisma.snapshot.findFirst({
      where: { OR: [{ id }, { publicSlug: id }] },
      include: {
        wallet: true,
        walrusBlobs: true,
        aiReports: true,
        transactions: { take: 20, orderBy: { createdAt: "desc" } },
        nfts: { take: 20, orderBy: { createdAt: "desc" } },
        verificationRecords: { take: 5, orderBy: { checkedAt: "desc" } }
      }
    });

    if (!snapshot) {
      return NextResponse.json({ error: "Snapshot not found." }, { status: 404 });
    }

    return NextResponse.json({ snapshot });
  } catch (error) {
    return jsonError(error);
  }
}
