import { handleStats } from '../server/handlers.js';
import { RedisStore } from '../server/redis-store.js';

export function GET(request: Request) {
  return handleStats(request, RedisStore.fromEnv());
}
