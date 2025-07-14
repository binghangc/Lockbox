const { THEMES } = require('../../constants/vibechecks.js');
const llmClient = require('../../../utils/llmclient.js');

async function classifyTheme(vibecheckText) {
  const options = THEMES.join(', ');
  const prompt = `What type of theme is ${vibecheckText}?
  
Choose the most suitable theme from the following themes: ${options}

Only return the best matching theme as a short string.`;

  const response = await llmClient.invoke([['human', prompt]]);
  return response.content.trim().toLowerCase();
}

module.exports = classifyTheme;
