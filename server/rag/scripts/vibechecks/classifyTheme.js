const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { THEMES } = require('../../constants/vibechecks.js');

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

async function classifyTheme(vibecheckText) {
  const options = THEMES.join(', ');
  const prompt = `What type of theme is ${vibecheckText}?
  
  Choose the most suitable theme from the following themes: ${options}
  
  Only return the best matching theme as a short string.`;
  const response = await llm.invoke([['human', prompt]]);
  return response.content.trim().toLowerCase();
}

module.exports = classifyTheme;