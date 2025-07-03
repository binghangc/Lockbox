const queue = require('../queue.js');
const embedItinerary = require('../rag/scripts/embedItinerary.js');

queue.process('embed-itinerary', async (job, done) => {
  try {
    await embedItinerary(job.data);
    done();
  } catch (err) {
    console.error('[embed-itinerary job] Error:', err);
    done(err);
  }
});
