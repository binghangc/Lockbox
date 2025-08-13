// const { Redis } = require('ioredis');

// const redis = new Redis(process.env.REDIS_URL, {
//   ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: {} }),
//   maxRetriesPerRequest: null,
// });
// module.exports = redis;

module.exports = {
  host: '127.0.0.1',
  port: 6379,
  // if using TLS:
  ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: {} }),
};
