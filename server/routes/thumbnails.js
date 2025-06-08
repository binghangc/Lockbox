const express = require('express');

const router = express.Router();

const thumbnails = [
  {
    name: 'Bachelorette Weekend',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/bachelorette-weekend.jpg',
  },
  {
    name: 'Barbenheimer Movie Party',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/barbenheimer-movie-party.jpeg',
  },
  {
    name: "Grad Like It's Hard",
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/grad-like-its-hard.jpeg',
  },
  {
    name: 'Hawaii',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/hawaii.jpg',
  },
  {
    name: 'I Heart LA',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/i_heart_la.avif',
  },
  {
    name: 'Inflatable Pool Party',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/inflatable-pool-party.avif',
  },
  {
    name: 'Pink Luck Poker',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/pink-luck-poker.avif',
  },
  {
    name: 'Ski Trip Vintage',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/skitrip-vintage.jpeg',
  },
  {
    name: 'Ski Trip',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/skitrip.jpg',
  },
  {
    name: 'Snowday Error',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/snowday-error.jpeg',
  },
  {
    name: 'Touch Grass',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/touchgrass.jpg',
  },
  {
    name: 'Vegas Travel',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/vegas-travel.jpeg',
  },
  {
    name: 'White Claw Hippies',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/white-claw-hippies.avif',
  },
  {
    name: 'Wine Hand',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/wine-hand.avif',
  },
  {
    name: 'Winter Break Ski',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/winter-break-ski.jpeg',
  },
  {
    name: 'Zac Grad',
    url: 'https://pub-8c0b91be3e2945c88ce582ecb937b8b6.r2.dev/zac-grad.avif',
  },
];

router.get('/', (req, res) => {
  res.json(thumbnails);
});

module.exports = router;
