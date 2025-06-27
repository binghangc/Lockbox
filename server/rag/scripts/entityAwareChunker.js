const extractLocationNames = require('./extractLocationNames.js');
const classifyActivityTags = require('./classifyActivityTags.js');
const classifyLocationTags = require('./classifyLocationTags.js');

async function enrichChunks(itineraryText) {
  const chunks = itineraryText
    .split(/\n+|\*\*/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const enrichedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const locationNames = await extractLocationNames(chunk);
        const locationTags = await classifyLocationTags(locationNames);
        const activityTags = await classifyActivityTags(chunk);

        return {
          chunk_text: chunk,
          embedding: null,
          location_tag: locationTags || [],
          location_name: locationNames || [],
          activity_tag: activityTags || [],
        };
      } catch (err) {
        console.error('Chunk enrichment failed:', chunk, err);
        return {
          chunk_text: chunk,
          embedding: null,
          location_tag: [],
          location_name: [],
          activity_tag: [],
        };
      }
    }),
  );

  return enrichedChunks;
}

module.exports = enrichChunks;
