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

// API endpoint for token exchange
app.get('/auth/confirm', async (req, res) => {
    const token_hash = req.query.token_hash;
    const type = req.query.type;
    const next = req.query.next ?? '/';

    if (token_hash && type) {
    try {
        const supabase = createClient({ req, res });

        const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
        });

        if (!error) {
        return res.redirect(303, `/${next.replace(/^\//, '')}`);
        } else {
        console.error('OTP Verification Error:', error);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
    }

    // On failure, redirect to custom error page
    return res.redirect(303, '/auth/auth-code-error');
});

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

// API endpoint for token exchange
app.get("/auth/confirm", async (req, res) => {
    const token_hash = req.query.token_hash
    const type = req.query.type
    const next = req.query.next ?? "/"
    if (token_hash && type) {
        const supabase = createClient({ req, res })
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            res.redirect(303, `/${next.slice(1)}`)
        }
    }
    // return the user to an error page with some instructions
    res.redirect(303, '/auth/auth-code-error')
})

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

app.post("/logout", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No or invalid token provided" });
        }

        const token = authHeader.replace("Bearer ", "");

        return res.status(200).json({ message: "Logged out successfully", token });
    } catch (err) {
        console.error("Logout error:", err); 
        res.status(500).json({ error: "Internal server error" });
    }
});

// API endpoint for forgot password
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${ process.env.EXPO_PUBLIC_REDIRECT_URL }/reset-password`, 
    });

    if (error) throw error;

    res.json({ success: true });
    } catch (err) {
    res.status(500).json({ error: err.message });
    }
});

app.post('/api/v1/reset-password', async (req, res) => {
    const { access_token, new_password } = req.body;

    if (!access_token || !new_password) {
        return res.status(400).json({ error: 'Missing token or password' });
    }

    try {
        const supabaseWithToken = createClient(
            process.env.EXPO_PUBLIC_SUPABASE_URL,
            process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
            {
                global: {
                    headers: { Authorization: `Bearer ${access_token}` }
                }
            }
        );

        const { error } = await supabaseWithToken.auth.updateUser({
            password: new_password
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
