// scripts/cleanup-old-avatars.js
require('dotenv').config();
const r2 = require('../server/utils/r2client');
const supabase = require('../server/utils/supabaseclient');

const BUCKET = process.env.R2_BUCKET_NAME_AVATARS;
const PUBLIC_AVATAR_URL_PREFIX = `${process.env.R2_PUBLIC_DOMAIN_AVATAR}/`;

const cleanupUnusedAvatars = async () => {
    const now = new Date();

    // 1. Get all current avatar URLs from Supabase
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('avatar_url');

    if (error) {
        console.error('Error fetching profile data:', error.message);
        return;
    }

    const usedUrls = new Set(profiles.map((p) => p.avatar_url));

    // 2. List all objects in the avatars/ directory
    const listed = await r2
        .listObjectsV2({ Bucket: BUCKET, Prefix: 'avatars/' })
        .promise();

    for (const obj of listed.Contents) {
        const fullUrl = `${PUBLIC_AVATAR_URL_PREFIX}${obj.Key}`;

        const isInUse = usedUrls.has(fullUrl);
        const isOld = new Date(obj.LastModified) < new Date(now - 5 * 24 * 60 * 60 * 1000); // older than 3 days

        if (!isInUse && isOld) {
        console.log(`🧹 Deleting unused: ${obj.Key}`);
        await r2
            .deleteObject({ Bucket: BUCKET, Key: obj.Key })
            .promise();
        }
    }

    console.log('Cleanup complete');
};

cleanupUnusedAvatars();
