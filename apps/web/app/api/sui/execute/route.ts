import { NextRequest, NextResponse } from "next/server";
import { getEnv, requireEnv } from "@/server/env/env";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { transactionBytes?: string; signature?: string };
    if (!body.transactionBytes || !body.signature) {
      return NextResponse.json(
        { error: "transactionBytes and signature are required." },
        { status: 400 }
      );
    }

    const env = getEnv();
    const response = await fetch(env.TATUM_SUI_RPC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": requireEnv(env.TATUM_API_KEY, "TATUM_API_KEY")
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "proofcast-execute",
        method: "sui_executeTransactionBlock",
        params: [
          body.transactionBytes,
          [body.signature],
          { showEffects: true, showObjectChanges: true, showEvents: true },
          "WaitForLocalExecution"
        ]
      })
    });
    const payload = await response.json().catch(() => null);

    return NextResponse.json(payload, { status: response.ok ? 200 : 502 });
  } catch (error) {
    return jsonError(error);
  }
}
