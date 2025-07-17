require('dotenv').config({ path: '.env.server' });
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const r2 = require('../utils/r2client.js');
const { getDownloadUrl } = require('../utils/r2SignedUrl.js');
const supabase = require('../utils/supabaseAdminClient.js');
const encodeToHLS = require('../encoder.js');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../../temp') });
const BUCKET = process.env.R2_BUCKET_NAME_VIDEOS;
const { R2_BASE_URL } = process.env;

async function storeOrbMetadata({
  orbId,
  tripId,
  userId,
  vibecheckId,
  videoKey,
  hlsKey,
}) {
  const { data, error } = await supabase
    .from('orbs')
    .insert({
      id: orbId,
      trip_id: tripId,
      user_id: userId,
      vibecheck_id: vibecheckId || null,
      video_key: videoKey,
      hls_key: hlsKey || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`[Supabase Insert Error] ${error.message}`);
  }

  return data;
}

// POST /upload - Upload a video file to R2
// eslint-disable-next-line consistent-return
router.post('/upload', upload.single('video'), async (req, res) => {
  const { tripId, userId, vibecheckId } = req.body;
  const orbId = uuidv4();
  const { file } = req;

  if (!file || !tripId || !userId) {
    return res
      .status(400)
      .json({ error: 'Missing required fields or video file' });
  }

  if (!vibecheckId) {
    return res
      .status(400)
      .json({ error: 'vibecheckId is required for upload' });
  }

  // Check if user already uploaded an orb for this vibecheck
  if (vibecheckId) {
    const { data: existingOrb, error: fetchError } = await supabase
      .from('orbs')
      .select('id')
      .eq('user_id', userId)
      .eq('vibecheck_id', vibecheckId)
      .maybeSingle();

    if (fetchError) {
      console.error('[Supabase Fetch Error]', fetchError.message);
      return res.status(500).json({ error: 'Failed to verify existing orb' });
    }

    if (existingOrb) {
      return res.status(409).json({
        error: 'You have already uploaded an orb for this vibecheck.',
      });
    }
  }

  if (vibecheckId) {
    const key = `orbs/${tripId}/${userId}/${orbId}.mp4`;

    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: fs.createReadStream(file.path),
          ContentType: 'video/mp4',
        }),
      );

      const hlsOutputDir = path.join(__dirname, `../../temp/hls/${orbId}`);
      const hlsKeyPrefix = `orbs-hls/${tripId}/${userId}/${orbId}`;

      try {
        // Step 1: Encode to HLS (480p, 240p)
        await encodeToHLS(file.path, hlsOutputDir, orbId);

        // Step 2: Upload HLS segments and master playlist to R2
        const walkDir = (dir) =>
          fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
            const fullPath = path.join(dir, entry.name);
            return entry.isDirectory() ? walkDir(fullPath) : [fullPath];
          });

        const hlsFiles = walkDir(hlsOutputDir);

        await Promise.all(
          hlsFiles.map((fullPath) => {
            const relativePath = path.relative(hlsOutputDir, fullPath);
            const fileStream = fs.createReadStream(fullPath);
            return r2.send(
              new PutObjectCommand({
                Bucket: BUCKET,
                Key: `${hlsKeyPrefix}/${relativePath}`,
                Body: fileStream,
                ContentType: relativePath.endsWith('.m3u8')
                  ? 'application/vnd.apple.mpegurl'
                  : 'video/MP2T',
              }),
            );
          }),
        );

        // Delete source file after successful encoding and upload
        fs.unlinkSync(file.path);
        // Remove the HLS output directory
        fs.rmSync(hlsOutputDir, { recursive: true, force: true });
        // Also remove the entire temp/ folder's contents
        const tempDir = path.join(__dirname, '../../temp');
        if (fs.existsSync(tempDir)) {
          fs.readdirSync(tempDir).forEach((entry) => {
            fs.rmSync(path.join(tempDir, entry), {
              recursive: true,
              force: true,
            });
          });
        }
      } catch (err) {
        console.error('[HLS Encoding or Upload Error]', err);
        return res.status(500).json({ error: 'Encoding or upload failed' });
      }

      let data;
      try {
        data = await storeOrbMetadata({
          orbId,
          tripId,
          userId,
          vibecheckId,
          videoKey: key,
          hlsKey: `${hlsKeyPrefix}/master.m3u8`,
        });
      } catch (error) {
        console.error(error.message);
        return res
          .status(500)
          .json({ error: 'Upload succeeded, but DB insert failed' });
      }

      return res
        .status(200)
        .json({ message: 'Upload complete', key, orb: data });
    } catch (e) {
      console.warn('[HLS Backup Failed]', e);
      return res.status(500).json({ error: 'Upload or encoding failed' });
    }
  }
}); // end router.post

// GET /url - Get a pre-signed download URL for a video
router.get('/url', async (req, res) => {
  const { tripId, userId, orbId } = req.query;

  if (!tripId || !userId || !orbId)
    return res.status(400).json({ error: 'Missing query parameters' });

  const key = `orbs/${tripId}/${userId}/${orbId}.mp4`;

  try {
    const url = await getDownloadUrl(key);
    return res.status(200).json({ url });
  } catch (err) {
    console.error('[Signed URL Error]', err);
    return res.status(500).json({ error: 'Failed to generate URL' });
  }
});

// GET /vibecheck/:id/status - Check if user has submitted an orb for a vibecheck
router.get('/vibecheck/:id/status', async (req, res) => {
  const { id: vibecheckId } = req.params;
  const { userId } = req.query;

  if (!vibecheckId || !userId) {
    return res.status(400).json({ error: 'Missing vibecheckId or userId' });
  }

  const { data: userData, error: userError } = await supabase
    .from('orbs')
    .select('id, created_at')
    .eq('vibecheck_id', vibecheckId)
    .eq('user_id', userId)
    .maybeSingle();

  if (userError) {
    return res.status(500).json({ error: userError.message });
  }

  const { count, error: countError } = await supabase
    .from('orbs')
    .select('id', { count: 'exact', head: true })
    .eq('vibecheck_id', vibecheckId);

  if (countError) {
    return res.status(500).json({ error: countError.message });
  }

  return res.json({
    userHasResponded: !!userData,
    orbId: userData?.id || null,
    submittedAt: userData?.created_at || null,
    anyoneHasResponded: count > 0,
  });
});

// GET /vibecheck/:id/orbs - Get all orbs for a given vibecheck
router.get('/vibecheck/:id/orbs', async (req, res) => {
  const { id: vibecheckId } = req.params;

  if (!vibecheckId) {
    return res.status(400).json({ error: 'Missing vibecheckId' });
  }

  const { data, error } = await supabase
    .from('orbs')
    .select(
      `
      id,
      user_id,
      vibecheck_id,
      hls_key,
      created_at,
      user:profiles(id, name, avatar_url)
    `,
    )
    .eq('vibecheck_id', vibecheckId);

  if (error) {
    console.error('[Supabase Fetch Error]', error.message);
    return res.status(500).json({ error: 'Failed to fetch orbs' });
  }

  const orbsWithUrls = await Promise.all(
    data.map(async (orb) => {
      const hlsUrl = `${R2_BASE_URL}/${orb.hls_key}`;
      return {
        ...orb,
        hlsUrl,
      };
    }),
  );

  return res.status(200).json({ orbs: orbsWithUrls });
});

module.exports = router;
