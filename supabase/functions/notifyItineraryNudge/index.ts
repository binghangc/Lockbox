import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendPushNotification } from '$lib/sendPushNotification.ts';

serve(async (_req) => {
  try {
      const supabase = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!,
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoTomorrow = tomorrow.toISOString().split('T')[0];

    // 1. Get trips starting tomorrow
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        id,
        title,
        start_date,
        host:user_id(id, expo_push_token, notification_preferences)
      `)
      .eq('start_date', isoTomorrow);

    if (error) {
      console.error('Failed to fetch trips:', error);
      return new Response('Error', { status: 500 });
    }

    for (const trip of trips || []) {
      const host = trip.host;
      const token = host?.expo_push_token;
      const prefs = host?.notification_preferences || {};
      const wantsNudge = prefs.itineraryNudges === true;

      if (!token || !wantsNudge) continue;

      const { data: items, error: itineraryErr } = await supabase
        .from('itineraries')
        .select('id')
        .eq('trip_id', trip.id)
        .limit(1);

      if (itineraryErr || (items && items.length > 0)) continue;

      await sendPushNotification(token, {
        title: '⏰ Set your itinerary!',
        body: `Your trip "${trip.title}" starts tomorrow. Don’t forget to add activities.`,
        data: { tripId: trip.id },
      });
    }

    return new Response(JSON.stringify({ message: 'Itinerary nudges sent' }), {
      status: 200,
    });
  } catch (error) {
    console.error('[notifyItineraryNudge ERROR]', error);
    return new Response('❌ Internal error', { status: 500 });
  }
});