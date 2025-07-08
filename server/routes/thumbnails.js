const express = require('express');

const router = express.Router();

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(process.env.R2_ENDPOINT),
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME_THUMBNAILS;
const PUBLIC_URL = process.env.R2_PUBLIC_DOMAIN_THUMBNAILS;

router.get('/', async (req, res) => {
  try {
    const data = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();

    const thumbnails = data.Contents.map((item) => ({
      name: item.Key.replace(/\.[^/.]+$/, ''),
      url: `${PUBLIC_URL}/${item.Key}`,
    }));

    res.json(thumbnails);
  } catch (err) {
    console.error('Error listing thumbnails:', err);
    res.status(500).json({ error: 'Failed to fetch thumbnails' });
  }
});

module.exports = router;
