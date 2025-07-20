const { LOCATION_TAGS } = require('../constants/itineraries.js');
const llmClient = require('../../utils/llmclient.js');

async function classifyLocationType(placeName) {
  const options = LOCATION_TAGS.join(', ');
  const prompt = `What type of location is ${placeName}?
  
  Choose the most suitable location tag from the following locations: ${options}
  
  Only return the best matching location type as a short string.`;
  const response = await llmClient.invoke([['human', prompt]]);
  return response.content.trim().toLowerCase();
}

module.exports = classifyLocationType;
