const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './server/.env.server' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function dumpVibeEmbeddings() {
  const { data, error } = await supabase
    .from('vibecheck_embeddings')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  const processed = data.map((row) => ({
    id: row.id,
    vibecheck_id: row.vibecheck_id,
    vibecheck_text: row.vibecheck_text,
    theme: row.theme,
    embedding_preview: row.embedding.slice(0, 5),
  }));

  console.log(JSON.stringify(processed, null, 2));
}

dumpVibeEmbeddings();
