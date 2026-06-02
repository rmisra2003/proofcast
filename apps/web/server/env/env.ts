import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  TATUM_API_KEY: z.string().optional(),
  TATUM_SUI_NETWORK: z.enum(["mainnet", "testnet", "devnet"]).default("testnet"),
  TATUM_SUI_RPC_URL: z.string().url().default("https://sui-testnet.gateway.tatum.io"),
  WALRUS_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  WALRUS_PUBLISHER_URL: z
    .string()
    .url()
    .default("https://publisher.walrus-testnet.walrus.space"),
  WALRUS_AGGREGATOR_URL: z
    .string()
    .url()
    .default("https://aggregator.walrus-testnet.walrus.space"),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_MODEL: z.string().default("deepseek-v4-flash"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  SUI_PROOFCAST_PACKAGE_ID: z.string().optional()
});

export function getEnv() {
  return envSchema.parse(process.env);
}

export function missingRequiredEnv() {
  const env = getEnv();
  const missing: string[] = [];

  if (!env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!env.REDIS_URL) missing.push("REDIS_URL");
  if (!env.TATUM_API_KEY) missing.push("TATUM_API_KEY");
  if (!env.DEEPSEEK_API_KEY) missing.push("DEEPSEEK_API_KEY");

  return missing;
}

export function requireEnv(value: string | undefined, name: string) {
  if (!value?.trim()) {
    throw new MissingEnvError(name);
  }

  return value;
}

export class MissingEnvError extends Error {
  constructor(public readonly envName: string) {
    super(`${envName} is not configured.`);
    this.name = "MissingEnvError";
  }
}
