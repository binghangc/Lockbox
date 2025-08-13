const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegStatic);

const variants = [
  { name: '480p', resolution: '854x480', bitrate: '800k' },
  { name: '240p', resolution: '426x240', bitrate: '400k' },
];

async function encodeToHLS(inputPath, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const encodeVariant = (variant) =>
    new Promise((resolve, reject) => {
      const variantPath = path.join(outputDir, `${variant.name}.m3u8`);
      ffmpeg(inputPath)
        .inputOptions('-f', 'mov')
        .videoFilter("crop='min(iw,ih)':'min(iw,ih)',setsar=1")
        .videoCodec('libx264')
        .size(variant.resolution)
        .videoBitrate(variant.bitrate)
        .outputOptions([
          '-preset veryfast',
          '-g 48',
          '-sc_threshold 0',
          '-keyint_min 48',
          '-hls_time 4',
          '-hls_playlist_type vod',
          `-hls_segment_filename ${outputDir}/${variant.name}_%03d.ts`,
        ])
        .output(variantPath)
        .on('end', () => {
          console.log(`[encoder] HLS encoding complete for ${variant.name}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`[encoder] Error in ${variant.name}:`, err.message);
          reject(err);
        })
        .run();
    });

  await Promise.all(variants.map(encodeVariant));

  const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
  const masterPlaylistContent = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    ...variants.map(
      (v) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${v.bitrate.replace('k', '000')},RESOLUTION=${v.resolution}\n${v.name}.m3u8`,
    ),
  ].join('\n');

  fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);
  console.log('[encoder] Master playlist generated at', masterPlaylistPath);
}

module.exports = encodeToHLS;
