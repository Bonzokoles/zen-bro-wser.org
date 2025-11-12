import { simpleAgent } from './agents/simpleAgent';
import Redis from 'ioredis';
const redis = new Redis();
async function process() {
  while(true) {
    const raw = await redis.lpop('pages_to_process');
    if (!raw) { await new Promise(r => setTimeout(r,5000)); continue; }
    const page = JSON.parse(raw);
    try {
      const r = await simpleAgent(page);
      await redis.hset('processed_pages', page.id, JSON.stringify(r));
    } catch(e) {
      await redis.rpush('pages_to_process', raw);
    }
  }
}
process();
