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

async function generateVibeCheck({
  itineraryText,
  tripDate,
  tripTitle,
  country,
  description,
}) {
  const formattedDate = dayjs(tripDate).format('dddd, MMMM D');
  try {
    const message = new HumanMessage(
      `It's ${formattedDate}. Here's an itinerary:\n\n${itineraryText}\n\n
      
      You are an emotionally intelligent Gen-Z travel assistant. Based on this specific itinerary, Give me ONE single short, funny, Gen-Z-coded vibe check prompt that references the locations or activities or food here (but not all three). 

      If it’s a hill — mention climbing, views, exhaustion.  
      If it's a food spot — mention cravings, mess, first bites.  
      If it’s a museum — mention getting lost, random statues, or “too many rooms.”
      Don't just name the place (eg no "Capitoline core unlocked").
      Use playful metaphors or specific reactions to the activity. 
      Avoid repeating themes like “calves crying” — keep responses fresh and diverse.

      Trip information:
      - Title: ${tripTitle}
      - Country: ${country}
      - Description: ${description}
      
      Guidelines:
      - Keep each vibe check to one phrase, max 5-7 words. 
      - Only return the final prompt. No explanations. No numbering.
      - MUST be hyper-specific to this itinerary
      - No colons or labels like "Funny:" or "Alhambra:".
      - Don't be generic. Phrases like "Main character moments" are not specific to the trip unless they fit the content perfectly.
      - Bonus if it sounds like a meme or references any popular media.
      
      
      
      This prompt is actually for a travel app where friends can post short videos based on a prompt and their trip itinerary, so it's meant to store memories. 
      They function as categories people can cache different memories into (eg funny laugh till you cry, 
      food, romantic, silly epic fails, awkward moments, pure joy, etc).`,
    );
    const response = await chatModel.invoke([message]);

    if (response && typeof response.content === 'string') {
      const raw = response.content.trim();
      return raw;
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
