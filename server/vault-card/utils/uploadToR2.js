const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2(buffer, key) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME_VAULTS,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    ACL: 'public-read',
  });

  await r2.send(command);
  return `${process.env.R2_PUBLIC_DOMAIN_VAULTS}/${key}`;
}

module.exports = uploadToR2;
