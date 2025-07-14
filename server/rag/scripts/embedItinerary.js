const enrichChunks = require('./entityAwareChunker.js');
const { embedText } = require('../utils/embeddingClient.js');

const supabase = require('../../utils/supabaseAdminClient.js');

async function embedItinerary({
  itinerary,
  itinerary_id,
  trip_id,
  country,
  user_id,
}) {
  const chunks = await enrichChunks(itinerary);

  const chunkEmbeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await embedText(chunk.chunk_text);
      return {
        itinerary_id,
        trip_id,
        chunk_text: chunk.chunk_text,
        embedding,
        country: country || null,
        location_tag: chunk.location_tag || null,
        location_name: chunk.location_name || null,
        activity_tag: chunk.activity_tag || null,
        user_id: user_id || null,
        created_at: new Date().toISOString(),
      };
    }),
  );

  const { error } = await supabase
    .from('itinerary_embeddings')
    .insert(chunkEmbeddings);

  if (error) throw error;
}

module.exports = embedItinerary;
