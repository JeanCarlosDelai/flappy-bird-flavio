import { handleRuns } from '../server/handlers.js';
import { RedisStore } from '../server/redis-store.js';

export function POST(request: Request) {
  return handleRuns(request, RedisStore.fromEnv());
}
