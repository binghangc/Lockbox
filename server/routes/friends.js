// API endpoint for getting friends list for current user
const express = require('express');

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const authMiddleware = require('../middleware/auth.js');

router.get('/', authMiddleware, async (req, res) => {
  const user_id = req.user.id;

  const { data: friendships, error: friendsError } = await supabase
    .from('friendships')
    .select(
      `    
        id,
        uid1,
        uid2,
        status,
        profile1:uid1 (id, username, name, bio, avatar_url),
        profile2:uid2 (id, username, name, bio, avatar_url)
    `,
    )
    .or(`uid1.eq.${user_id},uid2.eq.${user_id}`)
    .eq('status', 'accepted');

  if (friendsError) {
    return res.status(500).json({ error: friendsError.message });
  }

  const friends = friendships.map((friendship) => {
    const otherUser =
      friendship.profile1.id === user_id
        ? friendship.profile2
        : friendship.profile1;

    return {
      id: friendship.id,
      ...otherUser,
    };
  });

  return res.status(200).json(friends);
});

// API endpoint for searching users
router.get('/search', authMiddleware, async (req, res) => {
  const { username } = req.query;
  const { user } = req;

  if (!username || !user) {
    return res.status(400).json({ error: 'Missing username or unauthorized' });
  }

  // 1. Accepted friendships
  const { data: friendships, error: friendsError } = await supabase
    .from('friendships')
    .select('uid1, uid2')
    .or(`uid1.eq.${user.id},uid2.eq.${user.id}`)
    .eq('status', 'accepted');

  if (friendsError) {
    return res.status(500).json({ error: friendsError.message });
  }

  const acceptedIds = new Set();
  friendships?.forEach(({ uid1, uid2 }) => {
    if (uid1 !== user.id) acceptedIds.add(uid1);
    if (uid2 !== user.id) acceptedIds.add(uid2);
  });
  // 2. Pending friend requests (either direction)
  const { data: pendingRequests, error: pendingError } = await supabase
    .from('friendships')
    .select('uid1, uid2')
    .or(`uid1.eq.${user.id},uid2.eq.${user.id}`)
    .eq('status', 'pending');
  if (pendingError) {
    return res.status(500).json({ error: pendingError.message });
  }

  const pendingIds = new Set();
  pendingRequests?.forEach(({ uid1, uid2 }) => {
    if (uid1 !== user.id) pendingIds.add(uid1);
    if (uid2 !== user.id) pendingIds.add(uid2);
  });
  // 3. Query for matching profiles
  const { data: allMatches, error: searchError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${username}%`)
    .neq('id', user.id);

  if (searchError) return res.status(500).json({ error: searchError.message });

  // 4. Attach status: "accepted" | "pending" | "none"
  const results = allMatches.map((profile) => ({
    ...profile,
    status: (() => {
      if (acceptedIds.has(profile.id)) {
        return 'accepted';
      }
      if (pendingIds.has(profile.id)) {
        return 'pending';
      }
      return 'none';
    })(),
  }));

  return res.status(200).json(results);
});

// API endpoint for sending friend request
router.post('/send-request', async (req, res) => {
  const { uid1, uid2 } = req.body;

  if (!uid1 || !uid2) {
    return res
      .status(400)
      .json({ error: 'Missing requester id or receiver id' });
  }

  await supabase
    .from('friendships')
    .insert([{ uid1, uid2, status: 'pending' }]);

  return res.status(200).json({ message: 'Friend request sent successfully' });
});

// API endpoint to get requests
router.get('/requests', authMiddleware, async (req, res) => {
  const user_id = req.user.id;

  const { data: friends, error: friendError } = await supabase
    .from('friendships')
    .select(
      `
        id,
        uid1,
        uid2,
        status,
        sender:uid1 (name, username, bio, avatar_url)
    `,
    )
    .eq('uid2', user_id)
    .eq('status', 'pending');

  if (friendError) {
    return res.status(500).json({ error: friendError.message });
  }

  return res.status(200).json(friends);
});

// API endpoint for accepting friend request
router.patch('/accept-request', async (req, res) => {
  const { id, uid1, uid2 } = req.body;

  if (!uid1 || !uid2) {
    return res
      .status(400)
      .json({ error: 'Missing requester id or receiver id' });
  }

  const { error } = await supabase
    .from('friendships')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('uid1', uid1)
    .eq('uid2', uid2);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res
    .status(200)
    .json({ message: 'Friend request accepted successfully' });
});

// API endpoint for rejecting friend request
router.patch('/reject-request', async (req, res) => {
  const { id, uid1, uid2 } = req.body;

  if (!uid1 || !uid2) {
    return res
      .status(400)
      .json({ error: 'Missing requester id or receiver id' });
  }

  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', id)
      .eq('uid1', uid1)
      .eq('uid2', uid2);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res
      .status(200)
      .json({ message: 'Friend request rejected successfully' });
  } catch {
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// API endpoint to remove friendship
router.delete('/remove/:targetUserId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { targetUserId } = req.params;

  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .or(
        `and(uid1.eq.${userId},uid2.eq.${targetUserId}),and(uid1.eq.${targetUserId},uid2.eq.${userId})`,
      );

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return res.status(200).json({ message: 'Friendship removed.' });
  } catch (err) {
    console.error('Error removing friend:', err.message ?? err);
    return res.status(500).json({ error: 'Failed to remove friend.' });
  }
});

module.exports = router;
