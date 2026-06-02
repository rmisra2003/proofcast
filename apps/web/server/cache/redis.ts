import { createClient, type RedisClientType } from "redis";
import { getEnv, requireEnv } from "@/server/env/env";

const globalForRedis = globalThis as unknown as { redis?: RedisClientType };

export async function getRedis() {
  if (!globalForRedis.redis) {
    const env = getEnv();
    globalForRedis.redis = createClient({ url: requireEnv(env.REDIS_URL, "REDIS_URL") });
    globalForRedis.redis.on("error", (error) => {
      console.error("Redis connection error", error);
    });
  }

  if (!globalForRedis.redis.isOpen) {
    await globalForRedis.redis.connect();
  }

  return globalForRedis.redis;
}
