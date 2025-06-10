const AWS = require('aws-sdk');

const r2 = new AWS.S3({
  endpoint: new AWS.Endpoint(process.env.R2_ENDPOINT), // R2 endpoint
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto', // required by AWS SDK
  signatureVersion: 'v4',
});

module.exports = r2;
