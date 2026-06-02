import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { getRedis } from "@/server/cache/redis";
import { jsonError } from "@/server/http";
import { suiAddressSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      walletAddress?: string;
      nonce?: string;
      signature?: string;
      displayName?: string;
    };
    const walletAddress = suiAddressSchema.parse(body.walletAddress);

    if (!body.nonce || !body.signature) {
      return NextResponse.json({ error: "nonce and signature are required." }, { status: 400 });
    }

    const redis = await getRedis();
    const key = `auth:${walletAddress}:${body.nonce}`;
    const message = await redis.get(key);

    if (!message) {
      return NextResponse.json({ error: "Nonce expired or not found." }, { status: 401 });
    }

    await verifyPersonalMessageSignature(new TextEncoder().encode(message), body.signature, {
      address: walletAddress
    });
    await redis.del(key);

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { displayName: body.displayName },
      create: { walletAddress, displayName: body.displayName }
    });

    return NextResponse.json({ user, authenticated: true });
  } catch (error) {
    return jsonError(error, 401);
  }
}
