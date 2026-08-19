import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();
export const LINK_KEY = 'shortlink:v2:links';
