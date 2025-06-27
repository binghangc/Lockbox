const THEMES = [
  'funny',
  'emotional',
  'nostalgic',
  'reflective',
  'aesthetic',
  'chaotic',
  'vulnerable',
  'romantic',
  'unfiltered',
  'wholesome',
];

const EVENT_TAGS = [
  'grad trip',
  'road trip',
  'birthday',
  'honeymoon',
  'family trip',
  'solo trip',
  'couple trip',
  'friendcation',
  'school trip',
  'group tour',
  'study abroad',
  'bachelor trip',
  'retreat',
  'festival trip',
  'reunion trip',
  'gap year',
  'long distance meet',
  'breakup trip',
  'anniversary trip',
  'just because',
];

// consts/vibechecks.js
const AXES = [
  'valence',
  'energy',
  'vulnerability',
  'spontaneity',
  'romanticness',
  'nostalgia',
  'sensory_intensity',
];

const AXIS_DESCRIPTIONS = {
  valence:
    'How emotionally positive is the text? (0 = very sad, 1 = very joyful)',
  energy:
    'How intense or energetic is the text? (0 = very calm, 1 = very chaotic)',
  vulnerability:
    'How personal or emotionally raw is the text? (0 = surface-level, 1 = deeply personal)',
  spontaneity:
    'How spontaneous or impulsive is the text? (0 = planned or formal, 1 = impulsive or random)',
  romanticness:
    'How romantic is the tone or content? (0 = purely platonic, 1 = very romantic)',
  nostalgia:
    'How nostalgic or reflective is the text? (0 = present-focused, 1 = highly nostalgic)',
  sensory_intensity:
    'How vivid or sensory-rich is the description? (0 = mundane, 1 = immersive)',
};

module.exports = {
  THEMES,
  EVENT_TAGS,
  AXES,
  AXIS_DESCRIPTIONS,
};
