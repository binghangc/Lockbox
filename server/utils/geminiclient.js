const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY not found in environment variables. Please check your .env file.',
  );
}

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.5-flash-preview-06-17',
  // add temperature, topP, topK here if needed
});

module.exports = { chatModel };
