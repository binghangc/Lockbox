const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    'GOOGLE_API_KEY not found in environment variables. Please check your .env file.',
  );
}

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flash-lite-preview-06-17',
  // add other configurations like temperature, topK, topP here
});

module.exports = { chatModel };
