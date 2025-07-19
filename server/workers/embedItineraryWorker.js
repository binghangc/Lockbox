const { Worker } = require('bullmq');
const redis = require('../redis.js');
const embedItinerary = require('../rag/scripts/embedItinerary.js');

console.log('[embedItineraryWorker] Worker is running...');

const worker = new Worker(
  'embed-itinerary',
  async (job) => {
    console.log('[embedItineraryWorker] Received job:', job.data);
    try {
      await embedItinerary(job.data);
      console.log(`[embed-itinerary job] Completed: ${job.id}`);
    } catch (err) {
      console.error('[embed-itinerary job] Error:', err);
      throw err;
    }
  },
  {
    connection: redis,
  },
);

worker.on('failed', (job, err) => {
  console.error(`[embed-itinerary job] FAILED ${job.id}:`, err);
});
