import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = resolve(process.cwd(), ".env.local");

if (existsSync(envFile)) {
  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "REDIS_URL",
  "TATUM_API_KEY",
  "TATUM_SUI_NETWORK",
  "TATUM_SUI_RPC_URL",
  "WALRUS_NETWORK",
  "WALRUS_PUBLISHER_URL",
  "WALRUS_AGGREGATOR_URL",
  "DEEPSEEK_API_KEY",
  "DEEPSEEK_MODEL",
  "NEXT_PUBLIC_APP_URL"
];

const urlKeys = [
  "DATABASE_URL",
  "DIRECT_URL",
  "REDIS_URL",
  "TATUM_SUI_RPC_URL",
  "WALRUS_PUBLISHER_URL",
  "WALRUS_AGGREGATOR_URL",
  "NEXT_PUBLIC_APP_URL"
];

const missing = required.filter((key) => !process.env[key]?.trim());
const invalidUrls = [];

for (const key of urlKeys) {
  const value = process.env[key];
  if (!value) continue;

  try {
    new URL(value);
  } catch {
    invalidUrls.push(key);
  }
}

if (missing.length > 0 || invalidUrls.length > 0) {
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
  }

  if (invalidUrls.length > 0) {
    console.error(`Invalid URL env vars: ${invalidUrls.join(", ")}`);
  }

  process.exit(1);
}

if (!process.env.SUI_PROOFCAST_PACKAGE_ID?.trim()) {
  console.warn("SUI_PROOFCAST_PACKAGE_ID is not set; Sui anchoring will remain optional/disabled.");
}

console.log("ProofCast deployment environment is configured.");
