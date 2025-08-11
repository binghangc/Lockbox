// scripts/recoverBrokenOrbs.js
require('dotenv').config({ path: './server/.env.server' });

const { GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const r2 = require('../server/utils/r2client.js');
const supabase = require('../server/utils/supabaseAdminClient.js');
const { encodingQueue } = require('../server/queue.js');

const TEMP_DIR = '/tmp';

async function downloadOrbToTemp(key, destPath) {
  console.log(`→ Downloading ${key} to ${destPath}`);
  const res = await r2.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME_VIDEOS,
      Key: key,
    }),
  );

  const writeStream = fs.createWriteStream(destPath);
  return new Promise((resolve, reject) => {
    res.Body.pipe(writeStream);
    res.Body.on('error', reject);
    writeStream.on('finish', resolve);
  });
}

(async () => {
  console.log('[Recovery] Fetching orbs with missing HLS...');
  const { data: orbs, error } = await supabase
    .from('orbs')
    .select('id, video_key, trip_id, user_id')
    .is('hls_key', null);

  if (error) {
    console.error('[Recovery] Supabase error:', error.message);
    process.exit(1);
  }

  if (!orbs || orbs.length === 0) {
    console.log('[Recovery] No broken orbs found — all good ✅');
    process.exit(0);
  }

  console.log(`[Recovery] Found ${orbs.length} broken orbs.`);

  for (const orb of orbs) {
    try {
      const orbId = orb.id;
      const tempPath = path.join(TEMP_DIR, `${orbId}.mp4`);
      const hlsKeyPrefix = `orbs-hls/${orb.trip_id}/${orb.user_id}/${orbId}`;

      await downloadOrbToTemp(orb.video_key, tempPath);

      await encodingQueue.add('encode-hls', {
        orbId,
        rawKey: orb.video_key,
        sourcePath: tempPath,
        hlsKeyPrefix,
      });

      console.log(`✅ Enqueued re-encoding for orb ${orbId}`);
    } catch (err) {
      console.error(`❌ Failed to recover orb ${orb.id}:`, err.message);
    }
  }
})();
