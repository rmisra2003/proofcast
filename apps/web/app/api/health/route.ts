import { NextResponse } from "next/server";
import { getEnv, missingRequiredEnv } from "@/server/env/env";

export const dynamic = "force-dynamic";

export function GET() {
  const env = getEnv();
  const missing = missingRequiredEnv();

  return NextResponse.json({
    ok: missing.length === 0,
    app: "ProofCast",
    network: env.TATUM_SUI_NETWORK,
    walrusNetwork: env.WALRUS_NETWORK,
    integrations: {
      tatum: env.TATUM_API_KEY ? "configured" : "missing",
      walrus: env.WALRUS_PUBLISHER_URL && env.WALRUS_AGGREGATOR_URL ? "configured" : "missing",
      deepseek: env.DEEPSEEK_API_KEY ? "configured" : "missing",
      postgres: env.DATABASE_URL ? "configured" : "missing",
      redis: env.REDIS_URL ? "configured" : "missing",
      suiRegistry: env.SUI_PROOFCAST_PACKAGE_ID ? "configured" : "optional"
    },
    missing
  });
}
