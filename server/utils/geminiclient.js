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

async function generateVibeCheck(itineraryText) {
  try {
    const message = new HumanMessage(
      `Here's an itinerary:\n\n${itineraryText}\n\nGive me 5 short, funny, Gen-Z-coded vibe check prompts based on this trip. Keep each vibe check to one phrase, max 5-7 words. hese prompts are actually for a travel app where friends can post short videos based on a prompt and their trip itinerary, so it's meant to store memories. so rephrase these prompts into categories people can cache different memories into (eg funny laugh till you cry, food, romantic, silly epic fails, awkward moments, pure joy, etc). Don't give explanations. no [phrase]:[prompt] format. maybe include some meme references, or some references to popular media. Label them 1 to 5.`,
    );
    const response = await chatModel.invoke([message]);

    if (response && typeof response.content === 'string') {
      const vibeChecks = response.content
        .split('\n')
        .filter((line) => line.trim().match(/^\d\./)) // Keep lines starting with 1. to 5.
        .map((line) => line.replace(/^\d\.\s*/, ''));
      return vibeChecks;
    }
    return ['Could not generate vibe checks. Please try again.'];
  } catch (error) {
    console.error('Error generating content with LangChain:', error);
    throw new Error(`LangChain generation failed: ${error.message}`);
  }
}

module.exports = {
  generateVibeCheck,
};
