const path = require('path');
const fs = require('fs');
const express = require('express');
const puppeteer = require('puppeteer');
const { HeadObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const uploadToR2 = require('../vault-card/utils/uploadToR2.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const router = express.Router();

// S3 client (adjust region/endpoint if needed)
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.R2_BUCKET_NAME_VAULTS;

router.get('/vault-card/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const r2Key = `vaultCards/${tripId}.png`;
  const publicUrl = `${process.env.R2_PUBLIC_DOMAIN_VAULTS}/${r2Key}`;

  if (!tripId || tripId.length < 10) {
    return res.status(400).json({ error: 'Invalid tripId' });
  }

  // Check if file already exists in R2
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: r2Key }));
    return res.json({ url: publicUrl });
  } catch (err) {
    if (err.name !== 'NotFound') {
      console.error('R2 head error:', err);
      return res.status(500).json({ error: 'R2 check failed' });
    }
  }

  // Load stats and render screenshot
  const { data: stats, error } = await supabase
    .from('trip_stats')
    .select(
      `
        *,
        trip:trip_id (
        id,
        title,
        country,
        thumbnail_url,
        start_date,
        end_date
        )
    `,
    )
    .eq('trip_id', tripId)
    .single();

  if (error || !stats) {
    console.error('Failed to fetch vault stats:', error);
    return res.status(404).json({ error: 'Stats not found' });
  }
  const htmlPath = path.join(__dirname, '../vault-card/vaultStatsCard.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const injected = html
    .replace(
      `const BASE = 'https://vaultcard-r2-domain.r2.dev/fallbacks';`,
      `const BASE = '${process.env.R2_PUBLIC_DOMAIN_VAULTS}/fallbacks';`,
    )
    .replace(
      'window.renderStats({',
      `window.renderStats(${JSON.stringify(stats)}, undefined);\n//`,
    );

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(injected, { waitUntil: 'networkidle0' });

    const frame = await page.$('.story-frame');
    const screenshot = await frame.screenshot({ type: 'png' });

    await uploadToR2(screenshot, r2Key);
    return res.json({ url: publicUrl });
  } catch (e) {
    console.error('Puppeteer error:', e);
    return res.status(500).json({ error: 'Rendering failed' });
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;
