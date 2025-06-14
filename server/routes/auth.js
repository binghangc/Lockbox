/**
 * File contains API routes for authentication using Supabase.
 */
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client for user-level actions
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// Initialize Supabase admin client for admin-level actions
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  // eslint-disable-next-line prettier/prettier
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// DEBUG: List all users to verify Supabase Admin client
router.get('/debug/list-users', async (req, res) => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.json({ users: data.users });
});

const { DEFAULT_AVATAR_URL } = require('../config/constants.js');

// API endpoint for signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.EXPO_PUBLIC_REDIRECT_URL,
        data: {
          name: username,
          username,
          avatar_url: DEFAULT_AVATAR_URL,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Signup successful! Please check your email.',
    });
  } catch (err) {
    console.error('Unexpected server error during signup:', err);
    return res
      .status(500)
      .json({ error: 'Server error during signup. Try again.' });
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
    return res
      .status(500)
      .json({ error: 'Login succeeded but session is missing' });
  }

  return res.status(200).json({
    message: 'Login successful!',
    session: data.session,
    user: data.user,
  });
});

// API endpoint for forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_REDIRECT_URL}/auth/reset-password`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        global: {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      },
    );

    const { error } = await supabaseWithToken.auth.updateUser({
      password: new_password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint for token exchange
router.get('/auth/confirm', async (req, res) => {
  const { token_hash, type } = req.query;

  if (token_hash && type) {
    /*
    try {
      const supabaseClient = createClient({ req, res });

      const { error } = await supabaseClient.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        return res.redirect(303, `/${next.replace(/^\//, '')}`);
      }
      console.error('OTP Verification Error:', error);
    } catch (err) {
      console.error('Unexpected Error:', err);
    }
    */
  }

  // On failure, redirect to custom error page
  return res.redirect(303, '/auth/auth-code-error');
});

// DELETE /auth/delete - delete user account
router.delete('/delete', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return res
      .status(400)
      .json({ error: userError?.message || 'User not found' });
  }

  const userId = user.id;
  console.error('[DELETE /auth/delete] User ID:', userId);

  const { data: deleteUserData, error: deleteAuthError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);
  console.error('[DELETE /auth/delete] deleteUser response:', {
    deleteUserData,
    deleteAuthError,
  });
  if (deleteAuthError) {
    return res.status(500).json({ error: deleteAuthError.message });
  }

  // 1. Delete all trips the user is hosting
  const { error: deleteTripsError } = await supabaseAdmin
    .from('trips')
    .delete()
    .eq('user_id', userId);
  if (deleteTripsError) {
    console.error(
      '[DELETE /auth/delete] Failed to delete user trips:',
      deleteTripsError?.message,
    );
    return res.status(500).json({ error: deleteTripsError.message });
  }

  // 2. Leave all trips the user is a participant of
  const { error: deleteParticipantsError } = await supabaseAdmin
    .from('participants')
    .delete()
    .eq('user_id', userId);
  if (deleteParticipantsError) {
    console.error(
      '[DELETE /auth/delete] Failed to delete user participants:',
      deleteParticipantsError?.message,
    );
    return res.status(500).json({ error: deleteParticipantsError.message });
  }

  // 3. Delete user profile
  const { error: deleteProfileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (deleteProfileError) {
    console.error(
      '[DELETE /auth/delete] Failed to delete user profile:',
      deleteProfileError?.message,
    );
    return res.status(500).json({ error: deleteProfileError.message });
  }

  console.log('[DELETE /auth/delete] Success, returning to client');
  return res.json({ success: true });
});

module.exports = router;
