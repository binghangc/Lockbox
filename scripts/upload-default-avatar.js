require('dotenv').config();


const fs = require('fs');
const path = require('path');
const r2 = require('../server/utils/r2client'); // your configured AWS SDK R2 client

const uploadDefaultAvatar = async () => {
  const filePath = path.join(__dirname, '../assets/defaultavatar.jpg');
  const fileBuffer = fs.readFileSync(filePath);
  const key = 'defaults/avatar-default.jpg';

  try {
    await r2
      .putObject({
        Bucket: process.env.R2_BUCKET_NAME_AVATARS,
        Key: key,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
      })
      .promise();

    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN_AVATAR}/${key}`;
    console.log('✅ Uploaded successfully! Public URL:');
    console.log(publicUrl);
  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
};

uploadDefaultAvatar();
