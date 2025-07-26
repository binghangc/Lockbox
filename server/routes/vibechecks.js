// server/routes/vibechecks.js
const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authMiddleware = require('../middleware/auth.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

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
