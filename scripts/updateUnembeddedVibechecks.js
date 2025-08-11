require('dotenv').config({ path: './server/.env.server' });
const supabase = require('../server/utils/supabaseAdminClient.js');
const { vibechecksQueue } = require('../server/queue.js');

(async () => {
  try {
    console.log('[Recovery] Fetching vibechecks missing embeddings...');

    const { data: embedded, error: e1 } = await supabase
      .from('vibecheck_embeddings')
      .select('vibecheck_id');

    if (e1) throw e1;

    const embeddedIds = (embedded ?? []).map((r) => r.vibecheck_id);

    let query = supabase.from('vibechecks').select('id, vibecheck, trip_id');

    if (embeddedIds.length > 0) {
      const list = `(${embeddedIds.map((id) => `"${id}"`).join(',')})`;
      query = query.not('id', 'in', list);
    }
    const { data: vibechecks, error: e2 } = await query;
    if (e2) throw e2;

    if (!vibechecks?.length) {
      console.log('[Recovery] No unembedded vibechecks — all good ✅');
      return;
    }

    console.log(
      `[Recovery] Found ${vibechecks.length} vibechecks without embeddings.`,
    );

    const tripIds = [...new Set(vibechecks.map((v) => v.trip_id))];

    const { data: trips, error: tErr } = await supabase
      .from('trips')
      .select('id, user_id')
      .in('id', tripIds);

    if (tErr) throw tErr;

    const byTripId = new Map(trips.map((t) => [t.id, t]));

    const pickUserId = (t) => t?.user_id || null;

    for (const vc of vibechecks) {
      const t = byTripId.get(vc.trip_id);
      const userId = pickUserId(t);

      try {
        await vibechecksQueue.add(
          'embed-vibecheck',
          {
            vibecheck_id: vc.id,
            vibecheck_text: vc.vibecheck,
            user_id: vc.user_id,
            trip_id: vc.trip_id,
          },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 500,
            removeOnFail: 1000,
          },
        );
        console.log(`✅ Enqueued re-embedding for vibecheck ${vc.id}`);
      } catch (err) {
        console.error(`❌ Failed to enqueue ${vc.id}:`, err?.message || err);
      }
    }
  } catch (err) {
    console.error('[Recovery] Fatal:', err?.message || err);
    process.exit(1);
  }
})();
