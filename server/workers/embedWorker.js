require('dotenv').config({ path: './server/.env.server' });

const { createClient } = require('@supabase/supabase-js');
const queue = require('../queue.js');
const enrichChunks = require('../rag/scripts/entityAwareChunker.js');
const { embedText } = require('../rag/utils/embeddingClient.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

queue.process('embed-itinerary', async (job, done) => {
  const { itinerary, vibecheck_id, country } = job.data;

  try {
    const chunks = await enrichChunks(itinerary);

    const chunkEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await embedText(chunk.chunk_text);
        return {
          vibecheck_id,
          chunk_text: chunk.chunk_text,
          embedding,
          country: country || null,
          location_tag: chunk.location_tag || null,
          location_name: chunk.location_name || null,
          activity_tag: chunk.activity_tag || null,
        };
      }),
    );

    const { error } = await supabase
      .from('itinerary_embeddings')
      .insert(chunkEmbeddings);

    if (error) throw error;

    done();
  } catch (err) {
    console.error('[embed-itinerary job] Error:', err);
    done(err);
  }
});
