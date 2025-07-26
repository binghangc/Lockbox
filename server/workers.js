require('dotenv').config({ path: './server/.env.server' });

require('./workers/embedItineraryWorker.js');
require('./workers/embedVibecheckWorker.js');

const pollMessagesLoop = require('./workers/sendMessages.js');

pollMessagesLoop();
