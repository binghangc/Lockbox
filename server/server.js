require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

// imported routes
const uploadAvatarRoute = require('./routes/upload-avatar');

app.use(express.json());

// Check IP address
app.get('/', (req, res) => res.send('API is running'));

// API auth endpoints: signup, login, logout
app.use('/auth', require('./routes/auth'));

// API profile endpoints: get and edit profile info, ie name, bio, avatar_url
app.use('/profile', require('./routes/profile'));

// API endpoint for getting friends list for current user
app.get('/friends/', async (req, res) => {
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
    .from('friends')
    .select('*')
    .or(`uid1.eq.${user_id},uid2.eq.${user_id}`)
    .eq('status', 'accepted');

    if (friendError) {
        return res.status(500).json({ error: friendError.message });
    }

    res.status(200).json(friends);
});

// API endpoint for sending friend request
app.post('/friends/send-request', async (req, res) => {
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

// API endpoint for accepting friend request
app.patch('/friends/accept-request', async (req, res) => {
    const { uid1, uid2 } = req.body;

    if (!uid1 || !uid2) {
        return res.status(400).json({ error: 'Missing requester id or receiver id' });
    }

    const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('uid1', uid1)
        .eq('uid2', uid2);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Friend request accepted successfully' });
});

// API endpoint for rejecting friend request
app.patch('/friends/reject-request', async (req, res) => {
    const { uid1, uid2 } = req.body;

    if (!uid1 || !uid2) {
        return res.status(400).json({ error: 'Missing requester id or receiver id' });
    }

    const { error } = await supabase
        .from('friends')
        .update({ status: 'declined' })
        .eq('uid1', uid1)
        .eq('uid2', uid2);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Friend request rejected successfully' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
