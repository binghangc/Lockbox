// server/routes/vibechecks.js
const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const enrichChunks = require('../rag/scripts/entityAwareChunker.js');
const { embedText } = require('../rag/utils/embeddingClient.js');
const { generateVibeCheck } = require('../utils/geminiclient.js');
const authMiddleware = require('../middleware/auth.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

router.post('/:id/submit-itinerary', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;
  const { user } = req;
  const itineraries = req.body;

  if (!Array.isArray(itineraries) || itineraries.length === 0) {
    return res
      .status(400)
      .json({ error: 'Itinerary must be a non-empty array' });
  }

  try {
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id, title, country, description')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) throw new Error('Trip not found');
    if (trip.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Step 1: Insert or update itineraries
    const payload = itineraries.map((entry, index) => ({
      trip_id,
      date: entry.date,
      itinerary: entry.itinerary,
      day_index: index + 1,
      updated_at: new Date().toISOString(),
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('itineraries')
      .upsert(payload, { onConflict: ['trip_id', 'date'] })
      .select();

    if (insertError) throw insertError;

    // Step 2: Generate vibechecks and insert into vibechecks table
    const vibechecks = await Promise.all(
      inserted.map(async (entry) => {
        const vibecheck = await generateVibeCheck({
          itineraryText: entry.itinerary,
          tripDate: entry.date,
          tripTitle: trip.title,
          country: trip.country,
          description: trip.description,
        });

        return {
          trip_id,
          date: entry.date,
          vibecheck,
          itinerary_id: entry.id,
        };
      }),
    );

    const { data: insertedVibechecks, error: vibeInsertError } = await supabase
      .from('vibechecks')
      .upsert(vibechecks, { onConflict: ['trip_id', 'date'] })
      .select();

    if (vibeInsertError) throw vibeInsertError;

    const vibecheckMap = {};
    insertedVibechecks.forEach((v) => {
      vibecheckMap[v.itinerary_id] = v.id;
    });

    // Step 3: Chunk + embed each itinerary and insert into itinerary_embeddings
    const chunkEmbeddings = (
      await Promise.all(
        inserted.map(async (entry) => {
          const chunks = await enrichChunks(entry.itinerary);
          console.log('enriched chunks:', chunks, 'type:', typeof chunks);
          const vibecheck_id = vibecheckMap[entry.id];

          return Promise.all(
            chunks.map(async (chunk) => {
              const embedding = await embedText(chunk.chunk_text);

              return {
                vibecheck_id,
                chunk_text: chunk.chunk_text,
                embedding,
                country: trip.country || null,
                location_tag: chunk.location_tag || null,
                location_name: chunk.location_name || null,
                activity_tag: chunk.activity_tag || null,
              };
            }),
          );
        }),
      )
    ).flat();

    const { error: embedInsertError } = await supabase
      .from('itinerary_embeddings')
      .insert(chunkEmbeddings);

    if (embedInsertError) throw embedInsertError;

    return res.status(200).json({
      success: true,
      insertedItineraries: inserted.length,
      insertedEmbeddings: chunkEmbeddings.length,
    });
  } catch (err) {
    console.error('[POST /:id/submit-itinerary] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
