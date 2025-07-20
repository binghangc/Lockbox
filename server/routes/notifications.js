const express = require('express');

const router = express.Router();
const supabase = require('../utils/supabaseAdminClient.js');

router.post('/register', async (req, res) => {
  const { userId, expoPushToken, preferences } = req.body;

  if (!userId || !expoPushToken) {
    return res.status(400).json({ error: 'Missing userId or token' });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      expo_push_token: expoPushToken,
      notification_preferences: preferences || {},
    })
    .eq('id', userId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ success: true });
});

module.exports = router;
