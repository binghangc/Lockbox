const { Queue } = require('bullmq');
const redis = require('./redis.js');

const itineraryQueue = new Queue('embed-itinerary', { connection: redis });
const vibechecksQueue = new Queue('embed-vibecheck', { connection: redis });

[itineraryQueue, vibechecksQueue].forEach((queue) => {
  queue.on('error', (err) => {
    console.error(`[Queue Error] (${queue.name})`, err);
  });
});

module.exports = {
  itineraryQueue,
  vibechecksQueue,
};
