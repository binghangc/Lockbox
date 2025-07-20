const { Worker } = require('bullmq');
const redis = require('../redis.js');
const embedVibecheck = require('../rag/scripts/vibechecks/embedVibecheck.js');

console.log('[embedVibecheckWorker] Worker is running...');

const worker = new Worker(
  'embed-vibecheck',
  async (job) => {
    try {
      await embedVibecheck(job.data);
      console.log(`[embed-vibecheck job] Completed: ${job.id}`);
    } catch (err) {
      console.error('[embed-vibecheck job] Error:', err);
      throw err;
    }
  },
  {
    connection: redis,
  },
);

worker.on('failed', (job, err) => {
  console.error(`[embed-vibecheck job] FAILED ${job.id}:`, err);
});
