require('dotenv').config({ path: './server/.env.server' });
const supabase = require('../server/utils/supabaseAdminClient.js');
const { itineraryQueue } = require('../server/queue.js');

(async () => {
  try {
    console.log('[Recovery] Fetching itineraries missing embeddings...');

    const { data: embedded, error: e1 } = await supabase
      .from('itinerary_embeddings')
      .select('itinerary_id');

    if (e1) throw e1;

    const embeddedIds = (embedded ?? []).map((r) => r.itinerary_id);

    let query = supabase.from('itineraries').select('id, itinerary, trip_id');

    if (embeddedIds.length > 0) {
      const list = `(${embeddedIds.map((id) => `"${id}"`).join(',')})`;
      query = query.not('id', 'in', list);
    }
    const { data: itineraries, error: e2 } = await query;
    if (e2) throw e2;

    if (!itineraries?.length) {
      console.log('[Recovery] No unembedded itineraries — all good ✅');
      return;
    }

    console.log(
      `[Recovery] Found ${itineraries.length} itineraries without embeddings.`,
    );

    const tripIds = [...new Set(itineraries.map((v) => v.trip_id))];

    const { data: trips, error: tErr } = await supabase
      .from('trips')
      .select('id, country')
      .in('id', tripIds);

    if (tErr) throw tErr;

    const byTripId = new Map(trips.map((t) => [t.id, t]));

    const pickCountry = (t) => t?.country || null;

    for (const entry of itineraries) {
      const t = byTripId.get(entry.trip_id);
      const country = pickCountry(t);

      try {
        await itineraryQueue.add(
          'embed-itinerary',
            {
              itinerary: entry.itinerary,
              itinerary_id: entry.id,
              trip_id: entry.trip_id,
              country: country,
            },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 500,
            removeOnFail: 1000,
          },
        );
        console.log(`✅ Enqueued re-embedding for itinerary ${entry.id}`);
      } catch (err) {
        console.error(`❌ Failed to enqueue ${entry.id}:`, err?.message || err);
      }
    }
  } catch (err) {
    console.error('[Recovery] Fatal:', err?.message || err);
    process.exit(1);
  }
})();
