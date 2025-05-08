require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

app.use(express.json());

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

    res.status(200).json({ message: 'Login successful!', data });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/profile', async (req, res) => {
    const { user, error } = await supabase.auth.getUser();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        return res.status(400).json({ error: profileError.message });
    }

    res.status(200).json({ user, profile: data });
});