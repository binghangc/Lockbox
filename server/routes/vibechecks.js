const express = require('express');
const { generateVibeCheck } = require('../utils/geminiclient.js');

const router = express.Router();

const supabase = require('../utils/supabaseAdminClient.js');

// API Endpoint
router.post('/vibe-check', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const vibe = await generateVibeCheck(prompt);

    const vibes = Array.isArray(vibe) ? vibe : [vibe];
    return res.json({ vibes });
  } catch (error) {
    console.error('API Error:', error.message);
    return res
      .status(500)
      .json({ error: error.message || 'Failed to get vibe check from Gemini' });
  }
});

// API Endpoint
router.post('/vibe-check/:tripId', async (req, res) => {
  const { tripId } = req.params;

  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .select('title, itinerary')
      .eq('id', tripId)
      .single();

    if (error || !trip?.itinerary) {
      return res.status(404).json({ error: 'Trip or itinerary not found' });
    }

    const vibes = await generateVibeCheck(trip.itinerary);

    return res.json({ tripId, vibes });
  } catch (err) {
    console.error('Vibe check error:', err);
    return res.status(500).json({ error: 'Failed to generate vibe checks' });
  }
});

module.exports = router;
