const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// POST /trips - Create a new trip
router.post('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user_id = userData.user.id;
  const { title, description, start_date, end_date, country, thumbnail_url } = req.body;

  const { data, error } = await supabase.from('trips').insert([
    {
      user_id,
      title,
      description,
      start_date,
      end_date,
      country,
      thumbnail_url
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ message: 'Trip created', data });
});

module.exports = router;