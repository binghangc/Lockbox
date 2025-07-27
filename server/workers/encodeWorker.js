const { Worker } = require('bullmq');
const fs = require('fs');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const redis = require('../redis.js');
const encodeToHLS = require('../encoder.js');
const r2 = require('../utils/r2client.js');
const supabase = require('../utils/supabaseAdminClient.js');

const BUCKET = process.env.R2_BUCKET_NAME_VIDEOS;

function walkDir(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkDir(fullPath) : [fullPath];
  });
}

console.log('[encodeWorker] Worker is running...');

const worker = new Worker(
  'encode-hls',
  async (job) => {
    try {
      const { orbId, sourcePath, hlsKeyPrefix } = job.data;
      console.log(`[Job Start] Orb ${orbId}`);
      console.log('→ sourcePath:', sourcePath);
      console.log('→ hlsKeyPrefix:', hlsKeyPrefix);

      const hlsOutputDir = path.join(__dirname, `../../temp/hls/${orbId}`);
      await encodeToHLS(sourcePath, hlsOutputDir, orbId);

      const hlsFiles = walkDir(hlsOutputDir);
      console.log(`[Upload] Uploading ${hlsFiles.length} HLS files to R2...`);

      await Promise.all(
        hlsFiles.map((fullPath) => {
          const relativePath = path.relative(hlsOutputDir, fullPath);
          const stream = fs.createReadStream(fullPath);
          return r2.send(
            new PutObjectCommand({
              Bucket: BUCKET,
              Key: `${hlsKeyPrefix}/${relativePath}`,
              Body: stream,
              ContentType: relativePath.endsWith('.m3u8')
                ? 'application/vnd.apple.mpegurl'
                : 'video/MP2T',
            }),
          );
        }),
      );

      // Cleanup
      fs.unlinkSync(sourcePath);
      fs.rmSync(hlsOutputDir, { recursive: true, force: true });

      const tempDir = path.join(__dirname, '../../temp');
      if (fs.existsSync(tempDir)) {
        fs.readdirSync(tempDir).forEach((entry) => {
          fs.rmSync(path.join(tempDir, entry), {
            recursive: true,
            force: true,
          });
        });
      }

      // Update orb record
      const { error } = await supabase
        .from('orbs')
        .update({ hls_key: `${hlsKeyPrefix}/master.m3u8` })
        .eq('id', orbId);

      if (error) {
        throw new Error(`[Supabase Update Error] ${error.message}`);
      }
    } catch (err) {
      console.error(`[encode-hls job] error for orb ${job.data.orbId}:`, err);
      throw err;
    }
  },
  { connection: redis },
);

worker.on('failed', (job, err) => {
  console.error(`[encode-hls job] FAILED ${job.id}:`, err);
});
