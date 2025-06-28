const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { LOCATION_TAGS } = require('../constants/itineraries.js');

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash-lite',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

async function classifyLocationType(placeName) {
  const options = LOCATION_TAGS.join(', ');
  const prompt = `What type of location is ${placeName}?
  
  Choose the most suitable location tag from the following locations: ${options}
  
  Only return the best matching location type as a short string.`;
  const response = await llm.invoke([['human', prompt]]);
  return response.content.trim().toLowerCase();
}

module.exports = classifyLocationType;
