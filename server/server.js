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

// API endpoint to get profile information
app.get('/profile', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader?.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log('Authenticated user ID:', user.id);

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        return res.status(400).json({ error: profileError.message });
    }

    res.status(200).json({ user, profile });
});

// API endpoint to edit profile information
app.patch('/profile/edit', async (req, res) => {
    const { user_id, field, value } = req.body;
  
    if (!user_id || !field || typeof value !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid params' });
    }
  
    const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user_id);
  
    if (error) {
        return res.status(500).json({ error: error.message });
    }
  
    res.status(200).json({ message: 'Profile updated successfully' });
});

// API endpoint to upload avatar
app.use('/profile', uploadAvatarRoute);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
