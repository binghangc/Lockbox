/**
 * File contains API routes for profiles using Supabase.
 */

const express = require('express');

const router = express.Router();
const multer = require('multer');

const { v4: uuidv4 } = require('uuid');

const upload = multer({ storage: multer.memoryStorage() });

const { createClient } = require('@supabase/supabase-js');
const r2 = require('../utils/r2client.js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
);

const authMiddleware = require('../middleware/auth.js');

// API endpoint to get profile information
router.get('/', authMiddleware, async (req, res) => {
  const { user } = req;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  return res.status(200).json({ user, profile });
});

// API endpoint to edit profile information
router.patch('/edit', async (req, res) => {
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

  return res.status(200).json({ message: 'Profile updated successfully' });
});

router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  const { user_id } = req.body;
  const file = req.file;
  
  if (!user_id || !file) {
    return res.status(400).json({ error: 'Missing user_id or file' });
  }

  const fileExt = file.originalname.split('.').pop();
  const key = `avatars/${user_id}/${uuidv4()}.${fileExt}`;

  try {
    // Upload to Cloudflare R2
    await r2
      .putObject({
        Bucket: process.env.R2_BUCKET_NAME_AVATARS,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'image/jpeg',
        ACL: 'public-read',
      })
      .promise();

    // Construct public URL
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN_AVATAR}/${key}`;

    // Update Supabase DB with avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user_id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ avatar_url: publicUrl });
  } catch (err) {
    console.error('[R2 Upload Error]', err);
    return res.status(500).json({ error: 'Upload to R2 failed' });
  }
});

module.exports = router;

// API endpoint to fetch user stats from public view
router.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('public_user_stats')
    .select('trip_count, friend_count')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching public stats:', error.message);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }

  return res.status(200).json(data);
});
