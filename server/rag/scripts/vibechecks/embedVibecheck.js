const { createClient } = require('@supabase/supabase-js');
const { embedText } = require('../../utils/embeddingClient.js');
const classifyTheme = require('./classifyTheme.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function embedVibecheck({ vibecheck_id, text, user_id }) {
  const theme = await classifyTheme(text);
  const embedding = await embedText(text);

  const { error } = await supabase.from('vibecheck_embeddings').insert({
    vibecheck_id,
    user_id,
    theme,
    embedding,
    text,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to insert embedding:', error);
    throw error;
  }

  console.log(`Vibecheck ${vibecheck_id} embedded and saved.`);
}

module.exports = embedVibecheck;
