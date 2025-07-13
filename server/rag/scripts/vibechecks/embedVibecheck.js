const { embedText } = require('../../utils/embeddingClient.js');
const classifyTheme = require('./classifyTheme.js');

const supabase = require('../../../utils/supabaseAdminClient.js');

async function embedVibecheck({
  vibecheck_id,
  vibecheck_text,
  user_id,
  trip_id,
}) {
  const theme = await classifyTheme(vibecheck_text);
  const embedding = await embedText(vibecheck_text);

  const { error } = await supabase.from('vibecheck_embeddings').insert({
    vibecheck_id,
    user_id,
    trip_id,
    theme,
    embedding,
    vibecheck_text,
    created_at: new Date().toISOString,
  });

  if (error) {
    console.error('Failed to insert embedding:', error);
    throw error;
  }

  console.log(`Vibecheck ${vibecheck_id} embedded and saved.`);
}

module.exports = embedVibecheck;
