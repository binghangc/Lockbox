const queue = require('../queue.js');
const embedVibecheck = require('../rag/scripts/vibechecks/embedVibecheck.js');

queue.process('embed-vibecheck', async (job, done) => {
  try {
    await embedVibecheck(job.data);
    done();
  } catch (err) {
    done(err);
  }
});
