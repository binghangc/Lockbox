// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/generateTripStats.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import {
  countTags,
  countThemes,
  extractTopWords,
  groupThemes,
  classifyArchetype,
  cosineSimilarity,
} from './utils.ts';

const supabase = createClient(
  Deno.env.get('PROJECT_URL')!,
  Deno.env.get('SERVICE_ROLE_KEY')!,
);

serve(async (req) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: trips, error: tripError } = await supabase
    .from('trips')
    .select('id')
    .eq('end_date', today);

  if (tripError || !trips?.length) {
    return new Response('No ending trips found', { status: 200 });
  }

  const stopwords = new Set([
    'the',
    'and',
    'you',
    'was',
    'are',
    'we',
    'for',
    'with',
    'had',
    'but',
    'not',
    'all',
    'our',
  ]);
  const results = [];

  for (const { id: trip_id } of trips) {
    try {
      const { data: vibeEmbeds } = await supabase
        .from('vibecheck_embeddings')
        .select('theme, vibecheck_text, embedding, created_at')
        .eq('trip_id', trip_id);

      const { data: itineraryEmbeds } = await supabase
        .from('itinerary_embeddings')
        .select('activity_tag, location_tag, embedding')
        .eq('trip_id', trip_id);

      const { data: orbs } = await supabase
        .from('orbs')
        .select('vibecheck_id, created_at');

      const { data: vibechecks } = await supabase
        .from('vibechecks')
        .select('id, date, vibecheck')
        .eq('trip_id', trip_id);

      if (!vibeEmbeds?.length) continue;

      // Themes
      const themes = vibeEmbeds.map((v) => v.theme);
      const { mostCommon, distribution } = countThemes(themes);

      // Tags
      const topActivities = countTags(
        itineraryEmbeds?.map((e) => e.activity_tag ?? []) || [],
      );
      const topLocations = countTags(
        itineraryEmbeds?.map((e) => e.location_tag ?? []) || [],
      );

      // Theme shift
      const sorted = [...vibeEmbeds].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      let themeShiftScore: number | null = null;
      let themeShiftScoreStatus = '';

      if (sorted.length < 2) {
        themeShiftScoreStatus =
          'Only one vibecheck — not enough to compute shift';
      } else {
        const first = sorted[0]?.embedding;
        const last = sorted.at(-1)?.embedding;

        if (
          Array.isArray(first) &&
          Array.isArray(last) &&
          first.length === last.length
        ) {
          themeShiftScore = 1 - cosineSimilarity(first, last);
          themeShiftScoreStatus = 'Score computed successfully';
        } else {
          themeShiftScoreStatus = 'Embeddings invalid or mismatched length';
        }
      }

      results.push({
        trip_id,
        themeShiftScore,
        vibecheckCount: sorted.length,
        themeShiftScoreStatus:
          sorted.length < 2
            ? 'Only one vibecheck — not enough to compute shift'
            : themeShiftScore === null
              ? 'Embeddings invalid or mismatched length'
              : 'Score computed successfully',
      });

      // Keywords
      const topKeywords = extractTopWords(
        vibeEmbeds.map((v) => v.vibecheck_text),
        stopwords,
      );

      // Clusters
      const vibeClusters = groupThemes(themes);

      // Highlight day
      const orbCounts: Record<string, number> = {};
      for (const o of orbs ?? []) {
        if (!orbCounts[o.vibecheck_id]) orbCounts[o.vibecheck_id] = 0;
        orbCounts[o.vibecheck_id]++;
      }

      let highlight_day: Record<string, unknown> | null = null;
      const topVibecheckId = Object.entries(orbCounts).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];
      if (topVibecheckId) {
        const vibe = vibechecks?.find((v) => v.id === topVibecheckId);
        if (vibe) {
          highlight_day = {
            date: vibe.date,
            orb_count: orbCounts[topVibecheckId],
            vibe: vibe.vibecheck,
          };
        }
      }

      // Archetype
      const trip_archetype = classifyArchetype(
        topActivities,
        topLocations,
        mostCommon,
      );

      const { error: insertError } = await supabase.from('trip_stats').upsert({
        trip_id,
        overall_vibe: mostCommon,
        theme_distribution: distribution,
        top_activity_tags: topActivities,
        top_location_tags: topLocations,
        theme_shift_score: themeShiftScore,
        top_keywords: topKeywords,
        vibe_clusters: vibeClusters,
        highlight_day,
        trip_archetype,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error(
          `Insert failed for trip ${trip_id}:`,
          insertError.message,
        );
        results.push({ trip_id, error: insertError.message });
      } else {
        results.push({ trip_id, status: 'ok' });
      }
    } catch (e) {
      console.error(`Error generating stats for ${trip_id}:`, e.message);
      results.push({ trip_id, error: e.message });
    }
  }

  return new Response(
    JSON.stringify(
      { message: 'Trip stats generation complete', results },
      null,
      2,
    ),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
});
/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generateTripStats' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
