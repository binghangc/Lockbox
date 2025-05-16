// API endpoint for getting friends list for current user
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);


router.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }
  
    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;
  
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
  
    const user_id = user.id;
  
    const { data: friends, error: friendError } = await supabase
        .from('friendships')
        .select('*')
        .or(`uid1.eq.${user_id},uid2.eq.${user_id}`)
        .eq('status', 'accepted');

    if (friendError) {
        return res.status(500).json({ error: friendError.message });
    }

    res.status(200).json(friends);
});

router.get('/search', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Missing username in query'});
    }

    const { data: results, error: resultError} = await supabase
        .from('profiles')
        .select('*')
        .ilike("username", `%${username}%`);
    
    if (resultError) {
        return res.status(500).json({ error: resultError.message });
    }

    res.status(200).json(results);
})

// API endpoint for sending friend request
router.post('/send-request', async (req, res) => {
    const { uid1, uid2 } = req.body;

    if (!uid1 || !uid2) {
        return res.status(400).json({ error: 'Missing requester id or receiver id' });
    }

    const { error } = await supabase
        .from('friends')
        .insert([{ uid1, uid2, status: 'pending' }]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Friend request sent successfully' });
});

// API endpoint to get requests
router.get('/requests', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }
  
    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;
  
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
  
    const user_id = user.id;
  
    const { data: friends, error: friendError } = await supabase
        .from('friendships')
        .select('*')
        .like(`uid2.eq.${user_id}`)
        .eq('status', 'pending');

    if (friendError) {
        return res.status(500).json({ error: friendError.message });
    }

    res.status(200).json(friends);
});


// API endpoint for accepting friend request
router.patch('/accept-request', async (req, res) => {
    const { id, uid1, uid2 } = req.body;

    if (!uid1 || !uid2) {
        return res.status(400).json({ error: 'Missing requester id or receiver id' });
    }

    const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', id)
        .eq('uid1', uid1)
        .eq('uid2', uid2);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Friend request accepted successfully' });
});

// API endpoint for rejecting friend request
router.patch('/decline-request', async (req, res) => {
    const { id, uid1, uid2 } = req.body;

    if (!uid1 || !uid2) {
        return res.status(400).json({ error: 'Missing requester id or receiver id' });
    }

    const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', id)
        .eq('uid1', uid1)
        .eq('uid2', uid2);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Friend request rejected successfully' });
});

module.exports = router;