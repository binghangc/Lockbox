const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const dayjs = require('dayjs');

const authMiddleware = require('../middleware/auth.js');

const { generateVibeCheck } = require('../utils/geminiclient.js');

// POST /trips - Create a new trip
router.post('/', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { title, description, start_date, end_date, country, thumbnail_url } =
    req.body;

  const today = dayjs().format('YYYY-MM-DD');
  const start = dayjs(start_date).format('YYYY-MM-DD');

  const status = start === today ? 'ongoing' : 'upcoming';

  const { data, error } = await supabase
    .from('trips')
    .insert([
      {
        user_id,
        title,
        description,
        start_date,
        end_date,
        country,
        thumbnail_url,
        status,
      },
    ])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({
    message: 'Trip created',
    data,
    needsImmediateItinerary: status === 'ongoing',
  });
});

// GET /trips - Get all trips for the logged-in user (host or participant)
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  // Step 1: Get trip IDs where user is a participant
  const { data: participantTrips, error: participantErr } = await supabase
    .from('participants')
    .select('trip_id, is_pinned')
    .eq('user_id', userId);

  if (participantErr) {
    return res.status(500).json({ error: participantErr.message });
  }

  const participantTripIds = participantTrips.map((p) => p.trip_id);

  // Step 2: Get trips where user is host OR participant
  const { data: trips, error: tripsErr } = await supabase
    .from('trips')
    .select(
      `
      *,
      host:profiles (
        id,
        name,
        avatar_url
      )
    `,
    )
    .or(`user_id.eq.${userId},id.in.(${participantTripIds.join(',')})`);

  if (tripsErr) {
    return res.status(500).json({ error: tripsErr.message });
  }

  const enrichedTrips = trips.map((trip) => {
    const participantEntry = participantTrips.find(
      (p) => p.trip_id === trip.id,
    );
    return {
      ...trip,
      is_host: trip.user_id === userId,
      is_pinned: participantEntry?.is_pinned ?? false,
    };
  });

  return res.json(enrichedTrips);
});

// GET /trips/:id - Get a single trip by ID
router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const tripId = req.params.id;

  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const userId = userData.user.id;

  const { data: trip, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      host:profiles (
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq('id', tripId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { data: participant, error: participantErr } = await supabase
    .from('participants')
    .select('is_pinned')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .single();

  if (participantErr && participantErr.code !== 'PGRST116') {
    // 'PGRST116' = no rows found
    return res.status(500).json({ error: participantErr.message });
  }

  return res.json({
    ...trip,
    is_host: trip.user_id === userId,
    is_pinned: participant?.is_pinned ?? false,
  });
});

// DELETE /trips/:id - Delete a trip (host only)
router.delete('/:id', authMiddleware, async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', tripId)
    .single();

  if (fetchError) {
    return res.status(500).json({ error: fetchError.message });
  }

  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({ error: 'You are not the trip owner.' });
  }

  const { error: deleteError } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.json({ success: true });
});

// POST /trips/:id/leave - Leave a trip (participant only)
router.post('/:id/leave', authMiddleware, async (req, res) => {
  const tripId = req.params.id;
  const userId = req.user.id;

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('user_id')
    .eq('id', tripId)
    .single();

  if (tripError) {
    return res.status(500).json({ error: tripError.message });
  }

  if (trip?.user_id === userId) {
    return res.status(400).json({ error: 'Host cannot leave their own trip.' });
  }

  const { error: leaveError } = await supabase
    .from('participants')
    .delete()
    .match({ trip_id: tripId, user_id: userId });

  if (leaveError) {
    return res.status(500).json({ error: leaveError.message });
  }

  return res.json({ success: true });
});

// API endpoint for users to edit their trips.
router.patch('/:id/edit', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;
  const { title, description, thumbnail_url, start_date, end_date, country } =
    req.body;
  const user_id = req.user.id;

  if (!trip_id) {
    return res.status(400).json({ error: 'Missing or invalid params' });
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .update({
      title,
      description,
      start_date,
      end_date,
      country,
      thumbnail_url,
    })
    .eq('id', trip_id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (trip?.user_id !== user_id) {
    return res.status(400).json({ error: 'Only hosts can edit trip.' });
  }

  return res.status(200).json({ trip, message: 'Trip updated successfully' });
});

// API endpoint for retrieving the participants in a trip
router.get('/:id/participants', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;

  try {
    const { data, error } = await supabase
      .from('participants')
      .select('user_id, role, profile:profiles(*)')
      .eq('trip_id', trip_id);

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// API endpoint for users to pin trips
router.patch('/:trip_id/pin', authMiddleware, async (req, res) => {
  const { trip_id } = req.params;
  const user_id = req.user.id;

  try {
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('is_pinned')
      .eq('trip_id', trip_id)
      .eq('user_id', user_id)
      .single();

    if (fetchError || !participant)
      return res.status(404).json({ error: 'Participant not found' });

    const newPinState = !participant.is_pinned;

    const { error: updateError } = await supabase
      .from('participants')
      .update({ is_pinned: newPinState })
      .eq('trip_id', trip_id)
      .eq('user_id', user_id);

    if (updateError)
      return res.status(500).json({ error: updateError.message });

    return res.json({
      message: 'Pin state toggled',
      is_pinned: newPinState,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// API endpoint for users to save their itineraries and generate vibechecks
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
      .select('id, user_id, title, country')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) throw new Error('Trip not found');

    if (trip.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Step 1: insert itineraries
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
          vibecheck: vibecheck,
          itinerary_id: entry.id,
        };
      }),
    );

    const { error: vibeInsertError } = await supabase
      .from('vibechecks')
      .upsert(vibechecks, { onConflict: ['trip_id', 'date'] });

    if (vibeInsertError) throw vibeInsertError;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[POST /:trip_id/itinerary] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:trip_id/itinerary/', authMiddleware, async (req, res) => {
  const { trip_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('date, itinerary')
      .eq('trip_id', trip_id);

    if (error && error.code !== 'PGRST116') throw error;

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API endpoint to get vibechecks for a date
router.get('/:id/vibecheck/:date', authMiddleware, async (req, res) => {
  const trip_id = req.params.id;
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({ error: 'Missing date query parameter' });
  }

  try {
    const { data, error } = await supabase
      .from('vibechecks')
      .select('id, vibecheck')
      .eq('trip_id', trip_id)
      .eq('date', date)
      .single();

    if (error?.code === 'PGRST116' || !data) {
      // PGRST116 = no rows found
      return res
        .status(404)
        .json({ error: 'No vibecheck found for this date' });
    }

    return res.json({
      vibecheck: data.vibecheck,
      vibecheck_id: data.id,
    });
  } catch (err) {
    console.error('Error fetching vibecheck:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to update vibechecks for a date
router.patch('/:id/vibecheck/:date', authMiddleware, async (req, res) => {
  const { id, date } = req.params;

  const { data: itinerary, error: itineraryError } = await supabase
    .from('itineraries')
    .select('id, itinerary')
    .eq('trip_id', id)
    .eq('date', date)
    .single();

  if (itineraryError || !itinerary) {
    return res.status(500).json({ error: 'Itinerary not found or invalid.' });
  }

  const vibe = await generateVibeCheck({
    itineraryText: itinerary.itinerary,
    tripDate: date,
  });

  const { error } = await supabase
    .from('vibechecks')
    .update({ vibecheck: vibe })
    .eq('trip_id', id)
    .eq('date', date)
    .eq('itinerary_id', itinerary.id);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ vibecheck: vibe });
});

module.exports = router;
