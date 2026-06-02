import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { getRedis } from "@/server/cache/redis";
import { clientIp, jsonError } from "@/server/http";
import { rateLimit } from "@/server/rate-limit/rate-limit";
import { SnapshotEngine } from "@/server/services/snapshot-engine";
import { VerificationEngine } from "@/server/services/verification-engine";
import { snapshotCaptureSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get("walletAddress") ?? undefined;
    const snapshots = await prisma.snapshot.findMany({
      where: {
        ...(walletAddress ? { watchedAddress: walletAddress } : {}),
        status: { not: "FAILED" }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        wallet: true,
        walrusBlobs: true,
        verificationRecords: { take: 1, orderBy: { checkedAt: "desc" } }
      }
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(`snapshot:${clientIp(request)}`, 6, 300);
    if (!limited.ok) {
      return NextResponse.json({ error: "Rate limit exceeded.", limited }, { status: 429 });
    }

    const input = snapshotCaptureSchema.parse(await request.json());
    const redis = await getRedis();
    const lockKey = `capture:${input.walletAddress}`;
    const locked = await redis.set(lockKey, "1", { NX: true, EX: 90 });

    if (!locked) {
      return NextResponse.json(
        { error: "A live snapshot capture is already running for this address." },
        { status: 409 }
      );
    }

    try {
      const result = await new SnapshotEngine().capture(input);
      try {
        const verification = await new VerificationEngine().verifySnapshot(result.snapshot.id);
        return NextResponse.json({
          ...result,
          snapshot: {
            ...result.snapshot,
            status: verification.status === "VALID" ? "VERIFIED" : result.snapshot.status,
            verificationRecords: [
              {
                status: verification.status,
                checkedAt: new Date().toISOString()
              }
            ]
          },
          verification
        });
      } catch (verificationError) {
        return NextResponse.json({
          ...result,
          verification: null,
          verificationError:
            verificationError instanceof Error ? verificationError.message : String(verificationError)
        });
      }
    } finally {
      await redis.del(lockKey);
    }
  } catch (error) {
    return jsonError(error);
  }
}
