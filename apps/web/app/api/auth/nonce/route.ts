import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/server/cache/redis";
import { clientIp, jsonError } from "@/server/http";
import { rateLimit } from "@/server/rate-limit/rate-limit";
import { suiAddressSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(`auth-nonce:${clientIp(request)}`, 20, 60);
    if (!limited.ok) {
      return NextResponse.json({ error: "Rate limit exceeded.", limited }, { status: 429 });
    }

    const body = (await request.json()) as { walletAddress?: string };
    const walletAddress = suiAddressSchema.parse(body.walletAddress);
    const nonce = randomBytes(24).toString("hex");
    const message = `ProofCast wallet authentication\nAddress: ${walletAddress}\nNonce: ${nonce}`;
    const redis = await getRedis();

    await redis.set(`auth:${walletAddress}:${nonce}`, message, { EX: 300 });

    return NextResponse.json({ nonce, message, expiresInSeconds: 300 });
  } catch (error) {
    return jsonError(error);
  }
}
