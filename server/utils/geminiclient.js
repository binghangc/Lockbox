const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage } = require('@langchain/core/messages');

if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY not found in environment variables. Please check your .env file.',
  );
}

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-2.5-flash-preview-04-17',
  // add other configurations like temperature, topK, topP here
});

async function generateVibeCheck(promptContent) {
  try {
    const message = new HumanMessage(promptContent);
    const response = await chatModel.invoke([message]);

    if (response && typeof response.content === 'string') {
      return response.content;
    }
    return 'Sorry, I couldn’t come up with a vibe check this time.';
  } catch (error) {
    console.error('Error generating content with LangChain:', error);
    let errorMessage = 'Failed to generate content using LangChain.';
    if (error.message) {
      errorMessage += ` Details: ${error.message}`;
    }
    throw new Error(errorMessage);
  }
}

module.exports = {
  generateVibeCheck,
};
