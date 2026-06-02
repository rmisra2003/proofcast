import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const record =
      (await prisma.verificationRecord.findFirst({
        where: {
          status: "VALID",
          snapshot: {
            status: { not: "FAILED" },
            anchorObjectId: { not: null }
          }
        },
        orderBy: { checkedAt: "desc" },
        include: { snapshot: true }
      })) ??
      (await prisma.verificationRecord.findFirst({
        where: { status: "VALID", snapshot: { status: { not: "FAILED" } } },
        orderBy: { checkedAt: "desc" },
        include: { snapshot: true }
      }));

    if (!record?.snapshot?.publicSlug) {
      return NextResponse.json({ proofcast: null }, { status: 404 });
    }

    return NextResponse.json({
      proofcast: {
        id: record.snapshot.publicSlug,
        snapshotId: record.snapshot.id,
        href: `/proofcast/${record.snapshot.publicSlug}`,
        checkedAt: record.checkedAt
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
