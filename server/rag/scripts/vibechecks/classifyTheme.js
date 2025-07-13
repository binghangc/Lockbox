const { THEMES } = require('../../constants/vibechecks.js');

function createLlm() {
  const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    apiKey,
    temperature: 0,
  });
}

async function classifyTheme(vibecheckText) {
  const options = THEMES.join(', ');
  const prompt = `What type of theme is ${vibecheckText}?
  
Choose the most suitable theme from the following themes: ${options}

Only return the best matching theme as a short string.`;

  const llm = createLlm();
  const response = await llm.invoke([['human', prompt]]);
  return response.content.trim().toLowerCase();
}

module.exports = classifyTheme;
