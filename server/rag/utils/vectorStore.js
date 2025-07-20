const {
  SupabaseVectorStore,
} = require('@langchain/community/vectorstores/supabase');
const supabase = require('../../utils/supabaseAdminClient.js');
const { createEmbeddingsClient } = require('./embeddingClient.js');

async function getVectorStore() {
  const embeddings = createEmbeddingsClient();
  return SupabaseVectorStore.fromExistingIndex(embeddings, {
    client: supabase,
    tableName: 'itinerary_embeddings',
    queryName: 'match_chunks',
  });
}

module.exports = { getVectorStore };
