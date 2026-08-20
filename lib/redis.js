import { Redis } from "@upstash/redis";

const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL;

const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error("Redis environment variables are missing.");
}

export const redis = new Redis({
  url,
  token,
});

export const LINK_KEY = "shortlink:v2:links";
