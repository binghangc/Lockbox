import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendPushNotification } from '$lib/sendPushNotification.ts';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('PROJECT_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!,
  );

  const today = new Date().toISOString().split('T')[0];

  const { data: vibeChecks, error } = await supabase
    .from('vibe_checks')
    .select(`
      id,
      trip_id,
      date,
      trip:trip_id (
        title,
        participants:participants (
          user:profiles (
            id,
            expo_push_token,
            notification_preferences
          )
        )
      )
    `)
    .eq('date', today);

  if (error) {
    console.error('Failed to fetch vibe checks:', error);
    return new Response('Internal error', { status: 500 });
  }

  for (const vibe of vibeChecks || []) {
    for (const participant of vibe.trip?.participants || []) {
      const user = participant.user;
      const wantsNotif = user?.notification_preferences?.vibeChecks;

      if (!user?.expo_push_token || !wantsNotif) continue;

      const { data: existingOrb, error: orbErr } = await supabase
        .from('orbs')
        .select('id')
        .eq('vibe_check_id', vibe.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (orbErr) {
        console.error('Error checking orb:', orbErr);
        continue;
      }

      if (existingOrb) continue;

      await sendPushNotification(user.expo_push_token, {
        title: '🎤 New prompt available!',
        body: `Send in your orb for "${vibe.trip.title}" now.`,
        data: {
          tripId: vibe.trip_id,
          vibeCheckId: vibe.id,
        },
      });
    }
  }

  return new Response(JSON.stringify({ message: 'VibeCheck cron notifs sent' }), {
    status: 200,
  });
});