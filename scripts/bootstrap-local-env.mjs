import { existsSync, readFileSync, writeFileSync } from "node:fs";

const target = "apps/web/.env.local";
const existing = existsSync(target) ? readFileSync(target, "utf8") : "";

const defaults = {
  DATABASE_URL: "postgresql://proofcast:proofcast@localhost:5432/proofcast",
  DIRECT_URL: "postgresql://proofcast:proofcast@localhost:5432/proofcast",
  REDIS_URL: "redis://localhost:6379",
  TATUM_SUI_NETWORK: "testnet",
  TATUM_SUI_RPC_URL: "https://sui-testnet.gateway.tatum.io",
  WALRUS_NETWORK: "testnet",
  WALRUS_PUBLISHER_URL: "https://publisher.walrus-testnet.walrus.space",
  WALRUS_AGGREGATOR_URL: "https://aggregator.walrus-testnet.walrus.space",
  DEEPSEEK_MODEL: "deepseek-v4-flash",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  SUI_PROOFCAST_PACKAGE_ID: ""
};

let next = existing.trim() ? `${existing.trim()}\n` : "";

for (const [key, value] of Object.entries(defaults)) {
  if (!new RegExp(`^${key}=`, "m").test(next)) {
    next += `${key}="${value}"\n`;
  }
}

for (const key of ["TATUM_API_KEY", "DEEPSEEK_API_KEY"]) {
  if (!new RegExp(`^${key}=`, "m").test(next)) {
    next += `${key}=""\n`;
  }
}

writeFileSync(target, next);
console.log(`Updated ${target} without printing secrets.`);
