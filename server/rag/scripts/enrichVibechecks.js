const classifyTheme = require('./classifyTheme.js');
const scoreVibecheckAxes = require('./scoreVibecheckAxes.js');

async function enrichVibechecks(itineraryText) {
  try {
    const theme = await extractLocationNames(chunk);
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

  return enrichedChunks;
}

module.exports = enrichVibechecks;
