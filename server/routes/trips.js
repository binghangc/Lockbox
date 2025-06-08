const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

// POST /trips - Create a new trip
router.post('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user_id = userData.user.id;
  const { title, description, start_date, end_date, country, thumbnail_url } =
    req.body;

  const { data, error } = await supabase.from('trips').insert([
    {
      user_id,
      title,
      description,
      start_date,
      end_date,
      country,
      thumbnail_url,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: 'Trip created', data });
});

// GET /trips - Get all trips for the logged-in user (host or participant)
router.get('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const userId = userData.user.id;

  // Step 1: Get trip IDs where user is a participant
  const { data: participantTrips, error: participantErr } = await supabase
    .from('participants')
    .select('trip_id')
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

  return res.json(trips);
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

  const { data, error } = await supabase
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

  return res.json(data);
});

module.exports = router;
