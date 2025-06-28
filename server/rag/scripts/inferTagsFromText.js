const { LOCATION_TAGS, ACTIVITY_TAGS } = require('../constants/itineraries.js');

const ACTIVITY_ALIASES = {
  hiking: ['hike', 'trail', 'trek'],
  swimming: ['swim', 'pool', 'pool party', 'night swim', 'snorkel'],
  clubbing: ['club', 'night out', 'rooftop bar'],
  foodCrawl: [
    'snack',
    'brunch',
    'fruit',
    'nachos',
    'popsicle',
    'coconut water',
  ],
  bonfire: ['bonfire', 'firepit'],
  karaoke: ['dj', 'playlist', 'karaoke'],
  stargazing: ['stars', 'aurora', 'northern lights'],
  camping: ['tent', 'campfire', 'camping'],
  picnic: ['picnic', 'blanket', 'basket'],
  trainRide: ['train', 'rail'],
};

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/[.,!?()]/g, '');

function matchAliases(text, tagList, aliasMap) {
  return tagList.filter((tag) => {
    const aliases = aliasMap[tag] || [tag];
    return aliases.some((alias) => text.includes(alias));
  });
}

function matchDirect(text, keywords) {
  return keywords.filter((word) => text.includes(word));
}

async function inferTagsFromText(text) {
  const lowered = normalize(text);

  const locationTags = matchDirect(lowered, LOCATION_TAGS);
  const activityTags = matchAliases(lowered, ACTIVITY_TAGS, ACTIVITY_ALIASES);

  const allKeywords = [...locationTags, ...activityTags];

  return {
    locationTags,
    activityTags,
    keywords: allKeywords,
  };
}

module.exports = inferTagsFromText;
