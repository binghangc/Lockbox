const { ACTIVITY_TAGS } = require('../constants/itineraries.js');
const llmClient = require('../../utils/llmclient.js');

async function classifyActivityTags(itineraryChunk) {
  const options = ACTIVITY_TAGS.join(', ');
  const prompt = `
Given the following itinerary chunk, identify **all relevant activity tags** from this list:

${options}

Return your answer as a **JSON array of strings**. Only include activities that clearly happen or are strongly implied.

Text: """${itineraryChunk}"""
`;

  const response = await llmClient.invoke([['human', prompt]]);
  const raw = response.content;

  try {
    return JSON.parse(raw);
  } catch {
    // fallback: try pulling from embedded JSON in response
    const match = raw.match(/\[.*?\]/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        console.warn('[classifyActivityTags] Failed parsing:', raw);
      }
    }
    console.warn('[classifyActivityTags] Failed to parse:', raw);
    return [];
  }
}
module.exports = classifyActivityTags;
