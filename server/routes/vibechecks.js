// server/routes/vibechecks.js
const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { generateVibeCheck } = require('../utils/geminiclient.js');
const authMiddleware = require('../middleware/auth.js');
const queue = require('../queue.js');

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

    // Step 3: Dispatch chunking + embedding jobs to Redis queue
    inserted.forEach((entry) => {
      queue
        .create('embed-itinerary', {
          itinerary: entry.itinerary,
          itinerary_id: entry.id,
          trip_id: trip.id,
          country: trip.country,
        })
        .removeOnComplete(true)
        .save();
    });

    insertedVibechecks.forEach((vc) => {
      queue
        .create('embed-vibecheck', {
          vibecheck_id: vc.id,
          text: vc.vibecheck,
          user_id: trip.user_id,
        })
        .removeOnComplete(true)
        .save();
    });

    return res.status(200).json({
      success: true,
      insertedItineraries: inserted.length,
    });
  } catch (err) {
    console.error('[POST /:id/submit-itinerary] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /trips/:id/vibechecks - Fetch all vibechecks for a trip with minimal fields
router.get('/trips/:id/vibechecks', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from('vibechecks')
      .select('id, vibecheck, date')
      .eq('trip_id', trip_id)
      .order('date', { ascending: true });

    if (error) throw error;

    return res.status(200).json({ vibechecks: data });
  } catch (err) {
    console.error('[GET /trips/:id/vibechecks] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
