const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const HTML_TEMPLATE_PATH = path.join(__dirname, 'vaultStatsCard.html');

app.post('/generate-stats-card', async (req, res) => {
  const stats = req.body;

  let html;
  try {
    html = fs.readFileSync(HTML_TEMPLATE_PATH, 'utf-8');
  } catch (err) {
    return res.status(500).send('Could not read HTML template');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Inject trip stats into the page
    await page.evaluate((data) => {
      window.renderStats(data);
    }, stats);

    await page.waitForTimeout(500); // wait for layout/render

    const card = await page.$('#root');
    const screenshot = await card.screenshot({ type: 'png' });

    await browser.close();

    if (!screenshot) {
      return res.status(500).send('Failed to render card');
    }

    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (err) {
    if (browser) await browser.close();
    console.error('Error rendering stats card:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3001, () => {
  console.log('🎨 Vault stats renderer running on http://localhost:3001');
});