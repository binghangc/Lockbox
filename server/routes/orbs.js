const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const r2 = require('../utils/r2client.js');
const { getDownloadUrl } = require('../utils/r2SignedUrl.js');
const supabase = require('../utils/supabaseAdminClient.js');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../../temp') });
const BUCKET = process.env.R2_BUCKET_NAME_VIDEOS;

async function storeOrbMetadata({
  orbId,
  tripId,
  userId,
  vibecheckId,
  videoKey,
}) {
  const { data, error } = await supabase
    .from('orbs')
    .insert({
      orb_id: orbId,
      trip_id: tripId,
      user_id: userId,
      vibecheck_id: vibecheckId || null,
      video_key: videoKey,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`[Supabase Insert Error] ${error.message}`);
  }

  return data;
}

// POST /upload - Upload a video file to R2
router.post('/upload', upload.single('video'), async (req, res) => {
  const { tripId, userId, vibecheckId } = req.body;
  const orbId = uuidv4();
  const { file } = req;

  if (!file || !tripId || !userId) {
    return res
      .status(400)
      .json({ error: 'Missing required fields or video file' });
  }

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

    fs.unlinkSync(file.path);

    let data;
    try {
      data = await storeOrbMetadata({
        orbId,
        tripId,
        userId,
        vibecheckId,
        videoKey: key,
      });
    } catch (error) {
      console.error(error.message);
      return res
        .status(500)
        .json({ error: 'Upload succeeded, but DB insert failed' });
    }

    return res.status(200).json({ message: 'Upload complete', key, orb: data });
  } catch (err) {
    console.error('[R2 Upload Error]', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

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

module.exports = router;
