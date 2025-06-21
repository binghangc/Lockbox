const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage } = require('@langchain/core/messages');
const dayjs = require('dayjs');

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

async function generateVibeCheck({ itineraryText, tripDate }) {
  const formattedDate = dayjs(tripDate).format('dddd, MMMM D');
  try {
    const message = new HumanMessage(
      `It's ${formattedDate}. Here's an itinerary:\n\n${itineraryText}\n\nGive me ONE single short, funny, Gen-Z-coded vibe check prompt based on this trip. 
      Keep each vibe check to one phrase, max 5-7 words. This prompt is actually for a travel app where friends can 
      post short videos based on a prompt and their trip itinerary, so it's meant to store memories. 
      Rephrase this prompt into categories people can cache different memories into (eg funny laugh till you cry, 
      food, romantic, silly epic fails, awkward moments, pure joy, etc). Don't give explanations. 
      no [phrase]:[prompt] format. maybe include some meme references, or some references to popular media. Label it 1.`,
    );
    const response = await chatModel.invoke([message]);

    if (response && typeof response.content === 'string') {
      const raw = response.content.trim();
      const firstLine = raw.split('\n')[0].trim();
      const noNumber = firstLine.replace(/^\s*\d+[.)-]\s*/, '');
      let cleaned = noNumber;

      if (/^[A-Za-z\s]{1,20}:\s/.test(noNumber)) {
        cleaned = noNumber.replace(/^[A-Za-z\s]{1,20}:\s*/, '');
      }
      return cleaned;
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
