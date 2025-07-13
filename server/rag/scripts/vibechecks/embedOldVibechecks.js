const { createClient } = require('@supabase/supabase-js');
const embedVibecheck = require('./embedVibecheck.js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function fetchUnembeddedVibechecks() {
  const { data: embeddedIds, error: e1 } = await supabase
    .from('vibecheck_embeddings')
    .select('vibecheck_id');

  if (e1) throw e1;

  const embeddedIdSet = new Set(embeddedIds.map((row) => row.vibecheck_id));

  const { data: vibechecks, error: e2 } = await supabase
    .from('vibechecks')
    .select('id, vibecheck, trip_id, trips(user_id)')
    .not('vibecheck', 'is', null)
    .not('vibecheck', 'eq', '');

  if (e2) throw e2;

  const unembedded = vibechecks.filter((vc) => !embeddedIdSet.has(vc.id));

  unembedded.forEach((vc, i) => {
    console.log(
      `  ${i + 1}. [${vc.id}] ${vc.vibecheck.slice(0, 80)}... (user: ${vc.user_id})`,
    );
  });

  return unembedded.map((vc) => ({
    id: vc.id,
    vibecheck: vc.vibecheck,
    trip_id: vc.trip_id,
    user_id: vc.trips?.user_id ?? null,
  }));
}

async function bulkEmbed() {
  const vibechecks = await fetchUnembeddedVibechecks();

  return Promise.all(
    vibechecks.map((vc) =>
      embedVibecheck({
        vibecheck_id: vc.id,
        vibecheck_text: vc.vibecheck,
        trip_id: vc.trip_id,
        user_id: vc.user_id,
      }),
    ),
  );
}

bulkEmbed().catch(console.error);
