const { Queue } = require('bullmq');
const redis = require('./redis.js');

const isTestEnv = process.env.NODE_ENV === 'test';

const itineraryQueue = isTestEnv
  ? require('./utils/test/mockQueue.js').mockQueue('embed-itinerary')
  : new Queue('embed-itinerary', {
      connection: redis,
    });

const vibechecksQueue = isTestEnv
  ? require('./utils/test/mockQueue.js').mockQueue('embed-vibecheck')
  : new Queue('embed-vibecheck', {
      connection: redis,
    });

if (!isTestEnv) {
  [itineraryQueue, vibechecksQueue].forEach((queue) => {
    queue.on('error', (err) => {
      console.error(`[Queue Error] (${queue.name})`, err);
    });
  });
}

module.exports = {
  itineraryQueue,
  vibechecksQueue,
};
