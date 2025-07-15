// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// eslint-disable-next-line import/no-unresolved
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendPushNotification } from '$lib/sendPushNotification.ts';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('PROJECT_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  const now = new Date().toISOString();

  const { data: trips } = await supabase
    .from('trips')
    .select('id, title, end_date, participants:participants(user:profiles(id, expo_push_token, notification_preferences))')
    .eq('status', 'ended')
    .eq('end_date', today);

  for (const trip of trips || []) {
    for (const participant of trip.participants) {
      const user = participant.user;
      if (!user?.expo_push_token || !user.id) continue;

      const prefs = user.notification_preferences || {};
      if (prefs.vaultOpening === false) continue;

      await sendPushNotification(token, {
        title: 'Vault unlocked 🔓',
        body: `Your trip "${trip.title}" has ended! See what your friends captured.`,
        data: { tripId: trip.id },
      });
    }
  }

  return new Response(JSON.stringify({ message: 'Trip statuses updated' }), {
    status: 200,
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/updateTripStatus' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
