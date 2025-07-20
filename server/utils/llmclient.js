require('dotenv').config({ path: './server/.env.server' });
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    'GOOGLE_API_KEY not found in environment variables. Please check your .env file.',
  );
}

const llmClient = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash-lite',
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0,
});

module.exports = llmClient;
