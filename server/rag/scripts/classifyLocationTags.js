const classifyLocationType = require('./classifyLocationType.js');

async function classifyLocationTags(locationNames) {
  const locationTags = await Promise.all(
    locationNames.map(async (name) => {
      try {
        const type = await classifyLocationType(name);
        return type;
      } catch (err) {
        console.warn(
          `[classifyLocationTags] Failed to classify "${name}":`,
          err,
        );
        return null;
      }
    }),
  );

  return locationTags.filter(Boolean);
}

module.exports = classifyLocationTags;
