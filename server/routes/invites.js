const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

const authMiddleware = require('../middleware/auth');

// API endpoint for getting list of invites
router.get('/', authMiddleware, async (req, res) => {
    const user_id = req.user.id;

  const { data: invites, error: invitesError } = await supabase
    .from('invites')
    .select('*, trip:trips(*, host:profiles(*))')
    .eq('user_id', user_id)
    .eq('status', 'pending');

  if (invitesError) {
    return res.status(500).json({ error: invitesError.message });
  }

  return res.status(200).json(invites);
});

// API endpoint for sending trip invites
router.post('/send-invite', async (req, res) => {
  const { user_id, host_id, trip_id } = req.body;

  if (!user_id || !host_id || !trip_id) {
    return res
      .status(400)
      .json({ error: 'Missing host_id, user_id, or trip_id' });
  }

  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user_id)
    .single();

  if (userError) {
    return res.status(500).json({ error: 'Failed to fetch user name.' });
  }

  const { error } = await supabase.from('invites').insert([
    {
      trip_id,
      user_id,
      host_id,
      status: 'pending',
    },
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: `Invite sent to ${userData.name}!` });
});

// API endpoint for getting users who are already invited on a trip
router.get('/invited', async (req, res) => {
  const { trip_id } = req.query;

  if (!trip_id) {
    return res.status(400).json({ error: 'Missing trip_id in query params.' });
  }

  const { data, error } = await supabase
    .from('invites')
    .select('user_id')
    .eq('trip_id', trip_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ invites: data });
});

// API endpoint for accepting trip invite
router.patch('/accept-invite', async (req, res) => {
  const { id, trip_id, user_id } = req.body;

  if (!user_id || !trip_id) {
    return res.status(400).json({ error: 'Missing trip id or participant id' });
  }

  const { error } = await supabase
    .from('invites')
    .update({
      status: 'accepted',
    })
    .eq('id', id)
    .eq('user_id', user_id)
    .eq('trip_id', trip_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { error: participantError } = await supabase
    .from('participants')
    .insert([
      {
        trip_id,
        user_id,
        role: 'participant',
        responded_at: new Date().toISOString(),
      },
    ]);

  if (participantError) {
    return res.status(500).json({ error: participantError.message });
  }

  return res.status(200).json({ message: 'Trip invite accepted successfully' });
});

// API endpoint for accepting trip invite
router.patch('/decline-invite', async (req, res) => {
  const { id, user_id, trip_id } = req.body;

  if (!user_id || !trip_id) {
    return res.status(400).json({ error: 'Missing trip id or participant id' });
  }

  const { error } = await supabase
    .from('invites')
    .update({
      status: 'declined',
    })
    .eq('id', id)
    .eq('user_id', user_id)
    .eq('trip_id', trip_id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Trip invite rejected successfully' });
});

// GET /invites/:id - Get a single trip by ID
router.get('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const inviteId = req.params.id;

  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data, error } = await supabase
    .from('invites')
    .select('*, trip:trips(*, host:profiles(*))')
    .eq('id', inviteId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
});

module.exports = router;
