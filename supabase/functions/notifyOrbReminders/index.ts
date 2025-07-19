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
  try {
      const supabase = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!,
    );

    const utc = new Date();
    const singaporeTime = new Date(utc.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    const localDate = singaporeTime.toISOString().split('T')[0];

    const { data: ongoingTrips } = await supabase
      .from('trips')
      .select('id, participants:participants(user:profiles(id, expo_push_token, notification_preferences))')
      .eq('status', 'ongoing');

    if (!ongoingTrips) return new Response('No trips found', { status: 200 });

    for (const trip of ongoingTrips || []) {
      for (const participant of trip.participants) {
        const user = participant.user;
        if (!user?.expo_push_token || !user.id) continue;

        const prefs = user.notification_preferences || {};
        if (prefs.orbReminders === false) continue;

        const startOfDay = new Date(localDate + 'T00:00:00+08:00');
        const endOfDay = new Date(localDate + 'T23:59:59+08:00');
        const todayStart = startOfDay.toISOString();
        const todayEnd = endOfDay.toISOString();

        // Check if user already submitted an orb today for this trip
        const { count, error } = await supabase
          .from('orbs')
          .select('*', { count: 'exact', head: true })
          .eq('trip_id', trip.id)
          .eq('user_id', user.id)
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd);

        if (error) {
          console.error(`Error checking orbs for user ${user.id}`, error);
          continue;
        }

        if (count === 0) {
          await sendPushNotification(user.expo_push_token, {
            title: 'Time to vibe ✨',
            body: `Don't forget to record your orb for "${trip.title}" today!`,
            data: { tripId: trip.id },
          });
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Orb reminders sent.' }), {
      status: 200,
    });
  } catch (error) {
    console.error('[notifyOrbReminders ERROR]', error);
    return new Response(
      `Internal error: ${error?.message || 'unknown'}\n\n${error?.stack || ''}`,
      { status: 500 }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/updateTripStatus' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
