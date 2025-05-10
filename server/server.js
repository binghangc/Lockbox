require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

console.log('Loaded SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

app.use(express.json());

app.get('/', (req, res) => res.send('API is running'));

// API endpoint for signup
app.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: username,
                username,
                avatar_url: 'https://i.pinimg.com/736x/c3/9a/f4/c39af4399a87bc3d7701101b728cddc9.jpg',
            },
        },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Signup successful! Please check your email for verification.', data });
});

// API endpoint for login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    if (!data.session) {
        return res.status(500).json({ error: 'Login succeeded but session is missing' });
    }

    res.status(200).json({ 
        message: 'Login successful!', 
        session: data.session,
        user: data.user});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

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

app.patch('/profile', async (req, res) => {
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
  
