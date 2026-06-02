import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/server/http";
import { ReplayEngine } from "@/server/services/replay-engine";
import { replayQuerySchema, suiAddressSchema } from "@/server/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ walletAddress: string }> }) {
  try {
    const { walletAddress } = await params;
    const query = replayQuerySchema.parse({
      walletAddress: suiAddressSchema.parse(walletAddress),
      limit: request.nextUrl.searchParams.get("limit") ?? "12"
    });
    const frames = await new ReplayEngine().getReplay(query.walletAddress!, query.limit);
    return NextResponse.json({ frames });
  } catch (error) {
    return jsonError(error);
  }
}
