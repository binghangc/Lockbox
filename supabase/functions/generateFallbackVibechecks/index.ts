// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';
import { GoogleGenerativeAIEmbeddings } from 'npm:@langchain/google-genai';

const FALLBACK_VIBECHECKS = {
  funny: [
    'Tripped over vibes, kept walking 😎',
    'We lost the map but found snacks',
    'Shirts were optional. Regret was not.',
    'Wrong train, right memories',
    'That wasn’t water. That was vodka.',
  ],
  emotional: [
    'Didn’t cry… until the sunset hit',
    'Heart felt full. Then spilled over.',
    'That hug fixed 12 years of trauma',
    'Eyes watery. Voice steady.',
    'Heard laughter and remembered I’m alive',
  ],
  nostalgic: [
    'Felt like childhood on rewind',
    'Deja vu but make it bittersweet',
    'Smelled a memory I forgot I had',
    'Wish I could bottle this moment',
    'Summer 2008 energy',
  ],
  reflective: [
    'This walk made my brain shut up',
    'Peace looks like this, I think',
    'Had a convo with my past self',
    'Realized I’ve grown. Quietly proud.',
    'No WiFi. Just thoughts and sky.',
  ],
  aesthetic: [
    'Felt like a music video moment',
    'Soft lighting. Softer smile.',
    'Captured this for my photo dump',
    'Moodboard vibes, no filter needed',
    'Glowy. Grainy. Gorgeous.',
  ],
  chaotic: [
    'Bag count: spiritually bankrupt',
    'Unexpected detour = instant chaos',
    'Fell mid-selfie. Iconic.',
    'Vibes switched mid-sentence and we ran',
    'Didn’t plan it. Did it anyway.',
  ],
  vulnerable: [
    'Said it out loud. Felt lighter.',
    'Didn’t hide the real me today',
    'Shared too much and it felt right',
    'Eyes puffy. Heart open.',
    'Spoke my truth. Shook a little.',
  ],
  romantic: [
    'Brushed hands. Said nothing. Smiled.',
    'Kissed mid-laugh. Cinematic.',
    'Shared an umbrella = married now',
    'Looked at me like poetry.',
    'Slow dance in the rain energy',
  ],
  unfiltered: [
    'No chill. All me.',
    'Said what I meant for once',
    'Too tired to pretend',
    'Overshared. Over it.',
    'No thoughts, just impulse',
  ],
  wholesome: [
    'All hands in = we’re bonded',
    'They remembered my order 🥹',
    'Felt held, not just hugged',
    'Group nap. Core memory.',
    'Laughed so hard I couldn’t breathe',
  ],
  yums: [
    'Spilled boba. Shed a tear.',
    'Too spicy. Ate more.',
    'First bite? I transcended.',
    'Cheese pull changed my life',
    'Crunchy. Creamy. Crying.',
  ],
};

const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: 'models/embedding-001',
  apiKey: Deno.env.get('GOOGLE_API_KEY')!,
  taskType: 'CLUSTERING',
});

export async function embedText(text: string) {
  return await embeddings.embedQuery(text);
}

function getRandomFallback(theme?: string) {
  const themes = Object.keys(FALLBACK_VIBECHECKS);
  const chosenTheme = theme && FALLBACK_VIBECHECKS[theme] ? theme : themes[Math.floor(Math.random() * themes.length)];
  const prompts = FALLBACK_VIBECHECKS[chosenTheme];
  const vibecheck = prompts[Math.floor(Math.random() * prompts.length)];
  return { vibecheck, theme: chosenTheme };
}

serve(async (_req) => {
  try {
      const supabase = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!,
    );

    const utc = new Date();
    const singaporeTime = new Date(utc.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    const localDate = singaporeTime.toISOString().split('T')[0];
    const debugLog = {
      today: localDate,
      queriedTrips: [],
      skippedExisting: [],
      insertedNew: [],
      errors: [],
    };

    // 1. Get active trips
    const { data: trips, error: tripErr } = await supabase
      .from('trips')
      .select('id, status')
      .eq('status', "ongoing");

    if (tripErr) {
      console.error('Trip fetch failed:', tripErr.message);
      return new Response('Trip query failed', { status: 500 });
    }

    debugLog.queriedTrips = trips.map((t) => t.id);

    const results = [];

    for (const trip of trips) {
      const { data: vibeCheck, error: vibeErr } = await supabase
        .from('vibechecks')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('date', localDate)
        .maybeSingle();

      if (vibeErr) {
        console.error(`Error checking vibe for trip ${trip.id}:`, vibeErr.message);
        debugLog.errors.push({ trip_id: trip.id, stage: 'check existing', message: vibeErr.message });
        continue;
      }

      if (!vibeCheck) {
        const fallback = getRandomFallback();

        const { data: inserted, error: insertErr } = await supabase
          .from('vibechecks')
          .insert({
            trip_id: trip.id,
            date: localDate,
            vibecheck: fallback.vibecheck,
            created_at: new Date().toISOString(),
          })
          .select()
          .maybeSingle();

        if (insertErr || !inserted) {
          debugLog.errors.push({ trip_id: trip.id, stage: 'insert vibecheck', message: insertErr?.message || 'unknown' });
          console.error(`Insert error for ${trip.id}:`, insertErr?.message);
          continue;
        }

        let embedding;
        try {
          embedding = await embedText(inserted.vibecheck);
        } catch (embeddingErr) {
          debugLog.errors.push({ trip_id: trip.id, stage: 'embedText', message: embeddingErr?.message || 'embedding failed' });
          continue;
        }

        await supabase.from('vibecheck_embeddings').insert({
          id: inserted.id,
          trip_id: trip.id,
          vibecheck_text: inserted.vibecheck,
          theme: inserted.theme,
          embedding,
          created_at: new Date().toISOString(),
        });

        debugLog.insertedNew.push({ trip_id: trip.id, vibecheck: inserted.vibecheck });

        results.push({ trip_id: trip.id, vibecheck: fallback.vibecheck });
      }
    }

    return new Response(JSON.stringify(debugLog, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      `Internal error: ${error?.message || 'unknown'}\n\n${error?.stack || ''}`,
      { status: 500 }
    );
  }
});
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate_fallback_vibechecks' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
