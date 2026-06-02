import { NextRequest, NextResponse } from "next/server";
import { TatumService } from "@/server/services/tatum-service";
import { isAllowedTatumRpcMethod } from "@/server/services/tatum-allowlist";
import { tatumRpcSchema } from "@/server/validation/schemas";
import { clientIp, jsonError } from "@/server/http";
import { rateLimit } from "@/server/rate-limit/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = tatumRpcSchema.parse(await request.json());
    const limited = await rateLimit(`tatum-rpc:${clientIp(request)}:${body.method}`, 60, 60);

    if (!limited.ok) {
      return NextResponse.json({ error: "Rate limit exceeded.", limited }, { status: 429 });
    }

    if (!isAllowedTatumRpcMethod(body.method)) {
      return NextResponse.json(
        { error: `Tatum RPC method ${body.method} is not allowed by ProofCast.` },
        { status: 403 }
      );
    }

    const result = await new TatumService().rpc(body.method, body.params, String(body.id));
    return NextResponse.json({ jsonrpc: "2.0", id: body.id, result });
  } catch (error) {
    return jsonError(error);
  }
}
