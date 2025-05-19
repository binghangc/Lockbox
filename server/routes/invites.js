const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// API endpoint for getting list of invites
router.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }
  
    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user;
  
    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
  
    const user_id = user.id;

    const { data: invites, error: invitesError } = await supabase
        .from('invites')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'pending')

    if (invitesError) {
        return res.status(500).json({ error: invitesError.message });
    }

    res.status(200).json(invites)
})


// API endpoint for sending trip invites
router.post('/send-invite', async (req, res) => {
    const { user_id, host_id } = req.body;

    if (!user_id || !host_id) {
        return res.status(400).json({ error: 'Missing host id or participant id' });
    }

    const { error } = await supabase
        .from('invites')
        .insert([{ user_id, host_id, status: 'pending' }]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Trip invite sent successfully' });
});

// API endpoint for accepting trip invite
router.patch('/accept-invite', async (req, res) => {
    const { id, user_id, host_id } = req.body;

    if (!user_id || !host_id) {
        return res.status(400).json({ error: 'Missing host id or participant id' });
    }

    const { error } = await supabase
        .from('invites')
        .update({ 
            status: 'accept', 
            accepted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user_id)
        .eq('host_id', host_id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Trip invite accepted successfully' });
});

// API endpoint for accepting trip invite
router.patch('/decline-invite', async (req, res) => {
    const { id, user_id, host_id } = req.body;

    if (!user_id || !host_id) {
        return res.status(400).json({ error: 'Missing host id or participant id' });
    }

    const { error } = await supabase
        .from('invites')
        .update({ 
            status: 'decline', 
            accepted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user_id)
        .eq('host_id', host_id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Trip invite rejected successfully' });
});

module.exports = router;