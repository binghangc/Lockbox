const { Redis } = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: {} }),
  maxRetriesPerRequest: null,
});
module.exports = redis;
