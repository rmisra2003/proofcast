import { createHash } from "node:crypto";
import { getRedis } from "@/server/cache/redis";

export async function rateLimit(key: string, limit = 20, windowSeconds = 60) {
  const redis = await getRedis();
  const hashedKey = `rl:${createHash("sha256").update(key).digest("hex")}`;
  const count = await redis.incr(hashedKey);

  if (count === 1) {
    await redis.expire(hashedKey, windowSeconds);
  }

  return {
    ok: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetSeconds: await redis.ttl(hashedKey)
  };
}
