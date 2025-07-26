require('dotenv').config({ path: './server/.env.server' });

/* eslint-disable global-require */
if (process.env.RUN_WORKERS === 'true') {
  require('./workers/embedItineraryWorker.js');
  require('./workers/embedVibecheckWorker.js');
  require('./workers/encodeWorker.js');
  const pollMessagesLoop = require('./workers/sendMessages.js');
  pollMessagesLoop();
}
/* eslint-enable global-require */

const app = require('./app.js');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
