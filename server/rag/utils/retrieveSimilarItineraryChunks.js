const { getVectorStore } = require('./vectorStore.js');

async function retrieveSimilarItineraryChunks(userItineraryText, k = 10) {
  const vectorStore = await getVectorStore();
  const results = await vectorStore.similaritySearch(userItineraryText, k);
  return results;
}

module.exports = { retrieveSimilarItineraryChunks };
