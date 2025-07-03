const kue = require('kue');

const queue = kue.createQueue({
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  },
});

queue.on('error', (err) => {
  console.error('[Queue Error]', err);
});

module.exports = queue;
