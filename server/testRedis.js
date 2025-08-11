const { Redis } = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: {} }),
});

async function run() {
  try {
    await redis.set('test-key', '✅ connected!');
    const value = await redis.get('test-key');
    console.log('Redis responded with:', value);
    await redis.quit();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
}

run();
