import { handleRanking } from '../server/handlers.js';
import { RedisStore } from '../server/redis-store.js';

export function GET(request: Request) {
  return handleRanking(request, RedisStore.fromEnv());
}

export function POST(request: Request) {
  return handleRanking(request, RedisStore.fromEnv());
}
