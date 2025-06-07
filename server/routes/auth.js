/**
 * File contains API routes for authentication using Supabase.
 */
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);
  
// API endpoint for signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: process.env.EXPO_PUBLIC_REDIRECT_URL,
                data: {
                    name: username,
                    username,
                    avatar_url: 'https://i.pinimg.com/736x/c3/9a/f4/c39af4399a87bc3d7701101b728cddc9.jpg',
                },
            },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        } else {

        }

        res.status(200).json({
            message: 'Signup successful! Please check your email.',
        });
    } catch (err) {
        console.error('Unexpected server error during signup:', err);
        res.status(500).json({ error: 'Server error during signup. Try again.' });
    }
});

// API endpoint for login
router.post('/login', async (req, res) => {
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

// API endpoint for logout
router.post("/logout", async (req, res) => {
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
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${ process.env.EXPO_PUBLIC_REDIRECT_URL }/auth/reset-password`, 
        });

        if (error) throw error;

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API endpoint for reset password
router.post('/reset-password', async (req, res) => {
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

// API endpoint for token exchange
router.get('/auth/confirm', async (req, res) => {
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

module.exports = router;