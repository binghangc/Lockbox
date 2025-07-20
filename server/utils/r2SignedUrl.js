const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME_VIDEOS;

async function getDownloadUrl(key) {
  if (!BUCKET) {
    throw new Error('R2_BUCKET_NAME_VIDEOS env var is missing or undefined.');
  }
  if (!key) {
    throw new Error('Key is required to generate a signed URL.');
  }
  console.log('[R2] Generating signed URL for key:', key);

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 }); // 1 hour
  console.log('[R2] Signed URL generated:', signedUrl);
  return signedUrl;
}

module.exports = { getDownloadUrl };
