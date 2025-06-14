const express = require('express');
const { generateVibeCheck } = require('../utils/geminiclient.js');

const router = express.Router();

// API Endpoint
router.post('/vibe-check', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const vibe = await generateVibeCheck(prompt);

    const vibes = Array.isArray(vibe) ? vibe : [vibe];
    res.json({ vibes });
  } catch (error) {
    console.error('API Error:', error.message);
    res
      .status(500)
      .json({ error: error.message || 'Failed to get vibe check from Gemini' });
  }
});

module.exports = router;
