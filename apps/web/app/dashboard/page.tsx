import { SiteShell } from "@/components/site-shell";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import type { HealthResponse } from "@/lib/client-types";
import { getEnv, missingRequiredEnv } from "@/server/env/env";

function getHealth(): HealthResponse {
  const env = getEnv();
  const missing = missingRequiredEnv();

  return {
    ok: missing.length === 0,
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
  };
}

export default function DashboardPage() {
  const health = getHealth();

  return (
    <SiteShell>
      <DashboardClient health={health} />
    </SiteShell>
  );
}
