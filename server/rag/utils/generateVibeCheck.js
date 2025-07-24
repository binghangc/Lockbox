const { HumanMessage } = require('@langchain/core/messages');
const dayjs = require('dayjs');
const { chatModel } = require('../../utils/geminiclient.js');
const {
  retrieveSimilarItineraryChunks,
} = require('./retrieveSimilarItineraryChunks.js');
const supabase = require('../../utils/supabaseAdminClient.js');

/**
 * Retrieves unique vibe checks from similar itinerary chunks.
 * Ensures diversity by filtering to one per trip.
 */
async function getDiverseVibeCheckExamples(similarChunks, limit = 3) {
  const chunkIds = similarChunks.map((doc) => doc.metadata.id);
  const { data, error } = await supabase
    .from('vibechecks')
    .select('*')
    .in('itinerary_id', chunkIds);

  if (error) throw new Error(`Error fetching vibe checks: ${error.message}`);

  // Deduplicate by trip_id
  const { uniqueByTrip } = data.reduce(
    (acc, vibe) => {
      if (acc.seenTrips.has(vibe.trip_id) || acc.uniqueByTrip.length >= limit) {
        return acc;
      }
      acc.seenTrips.add(vibe.trip_id);
      acc.uniqueByTrip.push(vibe);
      return acc;
    },
    { uniqueByTrip: [], seenTrips: new Set() },
  );

  return uniqueByTrip;
}

async function generateVibeCheck({
  itineraryText,
  tripDate,
  tripTitle,
  country,
  description,
}) {
  const formattedDate = dayjs(tripDate).format('dddd, MMMM D');
  let exampleLines = '';

  try {
    const similarChunks = await retrieveSimilarItineraryChunks(
      itineraryText,
      15,
    );
    const exampleVibes = await getDiverseVibeCheckExamples(similarChunks, 3);

    if (exampleVibes.length > 0) {
      exampleLines = exampleVibes
        .map((v, i) => `${i + 1}. "${v.prompt}"`)
        .join('\n');
    }
  } catch (err) {
    console.warn('[generateVibeCheck] fallback to zero-shot:', err.message);
  }

  const contextPrefix = exampleLines
    ? `Here are 3 vibe checks from similar trips:\n${exampleLines}\n\nNow adapt that tone to this trip but DO NOT copy them exactly and do not use any location names from these prompts:`
    : `Generate a vibe check based on this trip:`;

  const message = new HumanMessage(
    `It's ${formattedDate}. Here's an itinerary:\n\n${itineraryText}\n\n

${contextPrefix}

You are an emotionally intelligent Gen-Z travel assistant. Based on this specific itinerary, give me ONE single short, funny, Gen-Z-coded vibe check prompt that references the locations or activities or food here (but not all three). 

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
- Keep each vibe check to one phrase, max 5–7 words. 
- Only return the final prompt. No explanations. No numbering.
- MUST be hyper-specific to this itinerary
- No colons or labels like "Funny:" or "Alhambra:".
- Don't be generic. Phrases like "Main character moments" are not specific to the trip unless they fit the content perfectly.
- Bonus if it sounds like a meme or references any popular media.

This prompt is for a travel app where friends post short videos based on a prompt and their trip itinerary. They're meant to store memories — silly fails, awkward moments, food shots, etc.`,
  );

  try {
    const response = await chatModel.invoke([message]);
    return typeof response?.content === 'string'
      ? response.content.trim()
      : 'Could not generate vibe check. Try again.';
  } catch (error) {
    console.error('Error generating vibe check:', error);
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
}

module.exports = {
  generateVibeCheck,
};
